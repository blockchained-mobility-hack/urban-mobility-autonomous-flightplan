'use strict'

const { api, Action } = require('actionhero')

module.exports = class RandomNumber extends Action {
  constructor () {
    super()
    this.name = 'token'
    this.description = 'I will return a juice token'
    this.outputExample = {}
  }

  async run (data) {
    data.response.token = api.orderToken
  }
}
