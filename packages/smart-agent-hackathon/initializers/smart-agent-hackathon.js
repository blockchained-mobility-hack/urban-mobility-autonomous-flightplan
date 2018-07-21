'use strict'
var request = require('request')
const { Initializer, api } = require('actionhero')
const { Profile, KeyProvider, Ipld, ContractState, DataContract, Description, Sharing } = require('@evan.network/blockchain-core')

// configuration shortcut
const config = api.config.smartAgentUAV

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

      async initialize () {
        await super.initialize()
      }

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
      smartAgentUAV.listen(l, config.listeners[l])
    }
  }
  
  async start() { }
  async stop() { api.log('Stopped Listening.', 'debug', this.name) }
}
