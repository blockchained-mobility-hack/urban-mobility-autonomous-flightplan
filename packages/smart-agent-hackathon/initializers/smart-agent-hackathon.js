'use strict'
var request = require('request')
const { Initializer, api } = require('actionhero')
const { Profile, KeyProvider, Ipld, ContractState, DataContract, Description, Sharing } = require('@evan.network/blockchain-core')

// configuration shortcut
const config = api.config.smartAgentUAV

const listenerConnections = {}

// weather service handlers
async function getWeather(lat, lng, alt) {
  
  const reqUri = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=1a25b5c4007f12dd2e489267db72aaf1&units=metric`
  
  return new Promise( (resolve, reject) => {
    request(reqUri, (error, _, body) => {
      if ( error ) reject(error)
      else resolve(JSON.parse(body))
    })
  })
}

function denyWeather(weather_data) {
  try {
    if(weather_data.visibility < 1000) return 'visibility ' + weather_data.visibility;
    if(weather_data.wind.speed > 50) return 'wind speed ' + weather_data.wind.speed;
    return false
  } catch(ex) { return "bad REST response" } 
}


// flynex service handlers

async function getFlyNex(lat, lng, alt) {
  
  const reqUri = `https://flynexapi.flynex.de/api/Airspaces/GetWhatsHereInfo?height=${alt}&lat=${lat}&lon=${lng}`
  
  return new Promise( (resolve, reject) => {
    request(reqUri, (error, _, body) => {
      if ( error ) reject(error)
      else resolve(JSON.parse(body))
    })
  })
}

function denyFlyNex(weather_data) {

}



module.exports = class SmartAgentUAV extends Initializer {
  constructor() {
    super()
    this.name = 'UAV Flight Plan Admission Checks'
    this.loadPriority = 4000
    this.startPriority = 4000
    this.stopPriority = 4000
  }

  async initialize() {
    if (config.disabled) return

    const taskContractType = api.eth.web3.utils.sha3('TaskDataContract')

    // specialize from blockchain smart agent library
    class SmartAgentUAV extends api.smartAgents.SmartAgent {

      async initialize () { await super.initialize() }

      // every indpendent listener has own account and needs own connection
      makeBCConnection(account) {

        // lots of boilerplate and just passing along of default values
        // the only thing that really needs to be different for each connection
        // is the account and keys and what depends on it
        // there really should be a standard helper function that does all this for you

        const keyProvider = new KeyProvider({keys:api.config.encryptionKeys})
        keyProvider.log = api.log

        const ipld = new Ipld({
          log: api.log,
          ipfs: api.bcc.ipfs,
          keyProvider: keyProvider,
          cryptoProvider: api.bcc.cryptoProvider,
          defaultCryptoAlgo: api.bcc.defaultCryptoAlgo,
          originator: api.eth.web3.utils.soliditySha3(account),
        })
        
        const profileOwn = new Profile({
          ipld: ipld,
          nameResolver: api.bcc.nameResolver,
          defaultCryptoAlgo: 'aes',
          executor: api.bcc.executor,
          contractLoader: api.bcc.contractLoader,
          accountId: account,
          dataContract: api.bcc.dataContract
        });    
        keyProvider.init(profileOwn)
        keyProvider.currentAccount = account

        const description = new Description({
          executor: api.bcc.executor,
          contractLoader: api.bcc.contractLoader,
          dfs: api.bcc.ipfs,
          nameResolver: api.bcc.nameResolver,
          cryptoProvider: api.bcc.cryptoProvider,
          keyProvider: keyProvider,
        })
        const sharing = new Sharing({
          contractLoader: api.bcc.contractLoader,
          cryptoProvider: api.bcc.cryptoProvider,
          description: description,
          executor: api.bcc.executor,
          dfs: api.bcc.ipfs,
          keyProvider: keyProvider,
          nameResolver: api.bcc.nameResolver,
          defaultCryptoAlgo: api.bcc.defaultCryptoAlgo,
        })
        description.sharing = sharing;
        const dataContract = new DataContract({
          cryptoProvider: api.bcc.cryptoProvider,
          dfs: api.bcc.ipfs,
          executor: api.bcc.executor,
          loader: api.bcc.contractLoader,
          log: api.log,
          nameResolver: api.bcc.nameResolver,
          sharing: sharing,
          web3: api.eth.web3,
          description: description,
        })
        
        return {
          contractLoader: api.bcc.contractLoader,
          executor: api.bcc.executor,
          dataContract: dataContract,
          profile: profileOwn,
          sharing: sharing
        };
      }


      // makes sure each listener only starts handlers for events relevant to it
      makeFilter(listenerName) {
        return function(event) {
          const { eventType, contractType, member } = event.returnValues;
          const isit = member === config.listeners[name] &&
                contractType === taskContractType &&
                eventType === '0'                      // invite

          api.log(`event filter: ${listenerName} ${isit}`)
          return isit
        }
      }

      /*
        the handlers basically do all the same:
          1. load the contract from the event
          2. read the query paramters from the contract
          3. query the 3rd party API
          4. examine the data and make a decision
          5. write the decision back into the contract

          so you can parametrize this and have a general "Listener Function"
      */
      
      async iterateTodos(event, serviceName, query, deny) {

        const account = config.listeners[serviceName]
        const { contractAddress } = event.returnValues
        const bcc = listenerConnections[serviceName]
        api.log(`handle UAV ${serviceName} ${account} task: ${contractAddress}`)
        
        try {

          const contract = bcc.contractLoader.loadContract('DataContractInterface', contractAddress)

          let entries = null;
          let denied = false;

          // using a hacky spinlock to wait for blockchain delays that happen sometimes
          // but since this is asynchronous and yields to other threads, this isn't too much of a problem
          do { entries = await bcc.dataContract.getListEntries(contract, 'todos', account) }
          while (entries.length <= 0)

          const responses = []
          const replies = []
          
          for(let entry of entries ) {
            const coord = entry.coordinates[0]
            const p = query(coord.lat, coord.lng, coord.height)

            replies.push(p)
            responses.push(
              {
                id: entry.id,
                solver: account,
                solverAlias: 'Smart Agent UAV ' + serviceName,
                comment: p,
                solveTime: (new Date()).getTime(),
              })
          }

          await Promise.all(replies)
          
          for(let r of responses) {
            denied = deny(r.comment)
            const comment = denied ? 'Denied. ' + denied : 'Accepted.'
            r.comment = comment
          }

          await bcc.dataContract.addListEntries(contract, 'todologs', responses , account)
          api.log(`Finished ${serviceName} task ${contractAddress}`)

        }
        catch (ex) {  api.log(`error occurred while handling ${account}; ${ ex.message || ex }${ex.stack ? ex.stack : ''}`, 'warning') }

      }

      

      // generic listener to blockchain events
      async listen(serviceName, serviceAccount) {
        api.log(`Listening with ${serviceAccount} as ${serviceName}`)

        // every listener needs an own handler
        const handlers = {
          insurance: async (event) => { iterateTodos(event, 'insurance', (lat, lng, alt) => {}, (p) => {})},
          weather: async (event) => { iterateTodos(event, 'weather', getWeather, denyWeather)},
          flynex: async (event) => { iterateTodos(event, 'flynex', getFlyNex, denyFlyNex)}
        }

        await api.bcc.eventHub.subscribe('EventHub', null, 'ContractEvent',
                                         this.makeFilter(serviceName),
                                         handlers[serviceName]);
      }
      
    }

    // start the initialization code
    const smartAgentUAV = new SmartAgentUAV(config)
    await smartAgentUAV.initialize()

    // load listeners for every configured party
    for(let l in config.listeners) {
      listenerConnections[l] = smartAgentUAV.makeBCConnection(config.listeners[l])
      smartAgentUAV.listen(l, config.listeners[l])
    }
  }
  
  async start() { }
  async stop() { api.log('Stopped Listening.', 'debug', this.name) }
}
