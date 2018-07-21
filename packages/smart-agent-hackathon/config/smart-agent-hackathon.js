// normal actionhero plugin config, needs to be linked into actionhero/edge-server installation

exports['default'] = {

  ethAccounts: {
    // accountID : private key
    '0x20a6E2feD0e1518cd0a61B1946B3e9D064aB171b' : '13ad711b451e228c176a4507f16271b61e83efabfcc50abe2881aaae225fdc1e'
  },

  encryptionKeys: {
    // sha3('accountID') : blockchain profile encryption key
    '0x8286e6ff0169c877ce96c6850f89266023435b2a0084955519aee6ae5e847669' : '76d63f0a1bc0f4e243fd716a5073c4907436a46dae74e01747a694e67d1b5158',
    // sha9('accountID','accountID') : dfs profile encryption key 
    '0x55e1144a60db5bb1c0af20de752381b6cc425cc4573bbe2541690e8d0a5f3eba' : '76d63f0a1bc0f4e243fd716a5073c4907436a46dae74e01747a694e67d1b5158',
    
  },
  
  smartAgentUAV: (api) => {
    return {
      disabled: false,
      name: 'UAV',
      ethAccount: '0x20a6E2feD0e1518cd0a61B1946B3e9D064aB171b',

      // every party that needs to agree on the flight plan must have it's own listener
      // and has its own account and evan.network profile
      listeners: {
        // kinda hackish, just reusing the default account for the insurance listener
        // if the main smart agent has to do anything writing, it should get an own account
        insurance: '0x20a6E2feD0e1518cd0a61B1946B3e9D064aB171b',
      }
    }
  }
}
