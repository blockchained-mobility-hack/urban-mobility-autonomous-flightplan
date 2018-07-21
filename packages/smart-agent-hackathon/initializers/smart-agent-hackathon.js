'use strict'
var request = require('request')
const { Initializer, api } = require('actionhero')
const { Profile, KeyProvider, Ipld, ContractState, DataContract, Description, Sharing } = require('@evan.network/blockchain-core')

module.exports = class SmartAgent extends Initializer {
  constructor() {
    super()
    this.name = ''
    this.loadPriority = 4000
    this.startPriority = 4000
    this.stopPriority = 4000
  }

  async initialize() { }
  
  async start() { }
  async stop() { api.log('Stopped Listening.', 'debug', this.name) }
}
