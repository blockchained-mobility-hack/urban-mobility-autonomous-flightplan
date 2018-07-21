'use strict'
const request = require('request')
const { Action, api } = require('actionhero')

class SmartAgentUAVRegulations extends Action {
  constructor() {
    super()
    this.name = 'smart-agents/uav/getRegulations'
    this.description = 'return regulations for coordinates'
    this.inputs = {
      lat: {
        required: true,
      },
      lng: {
        required: true
      },
      alt: {
        required: true
      }

    }
    this.outputExample = { regulations: {} }
  }

  async run({ params, response }) {
    try {
      const regulations = await api.smartAgentUAV.getRegulations(parseFloat(params.lat),
                                                                 parseFloat(params.lng),
                                                                 parseFloat(params.alt))
      response.status = 'success'
      response.regulations = regulations
      
    } catch (ex) {
      api.log(ex)
      response.status = 'error'
      response.error = ex
    }
  }
}

module.exports = {
  SmartAgentUAVRegulations
}
