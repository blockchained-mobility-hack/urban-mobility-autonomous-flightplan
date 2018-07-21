'use strict'
var request = require('request')
const { Initializer, api } = require('actionhero')
const { Profile, KeyProvider, Ipld, ContractState, DataContract, Description, Sharing } = require('@evan.network/blockchain-core')

// configuration shortcut
const config = api.config.smartAgentUAV

const listenerConnections = {}

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

    // specialize from blockchain smart agent library
    class SmartAgentUAV extends api.smartAgents.SmartAgent {

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

      async initialize () { await super.initialize() }

      // generic listener to blockchain events
      async listen(serviceName, serviceAccount) {
        api.log(`Listening with ${serviceAccount} as ${serviceName}`)
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
