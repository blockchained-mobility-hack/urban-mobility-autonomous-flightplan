// normal actionhero plugin config, needs to be linked into actionhero/edge-server installation

exports['default'] = {

  ethAccounts: {
    // insurance
    // accountID : private key
    '0x20a6E2feD0e1518cd0a61B1946B3e9D064aB171b' : '13ad711b451e228c176a4507f16271b61e83efabfcc50abe2881aaae225fdc1e',

    // flynex
    '0x8958AED4D3a577298166526c37087578C5DB2Fd2' : 'f545549446343dd1e47bd81cebebbbc5b74607758512d22c631b223db57106a5',

    // weather
    '0xFCE2dfF569b6f715E83934d3CfCeff777916fFC7' : '3e9a0130dae617e0b09e17a91072cc301fd203e4b24f1fe0c458621b18a32318',
  },

  encryptionKeys: {
    // insurance
    // sha3('accountID') : blockchain profile encryption key
    '0x8286e6ff0169c877ce96c6850f89266023435b2a0084955519aee6ae5e847669' : '76d63f0a1bc0f4e243fd716a5073c4907436a46dae74e01747a694e67d1b5158',
    // sha9('accountID','accountID') : dfs profile encryption key 
    '0x55e1144a60db5bb1c0af20de752381b6cc425cc4573bbe2541690e8d0a5f3eba' : '76d63f0a1bc0f4e243fd716a5073c4907436a46dae74e01747a694e67d1b5158',

    // flynex
    '0x23d05912fd9ec60d94576cd4b3a50a9e2b7770058f9964236d0b66b593636747' : '76d63f0a1bc0f4e243fd716a5073c4907436a46dae74e01747a694e67d1b5158',
    '0x61f02c078822dfb95f1e27746d5c767813e59b9b0b32da5c9ba26c3de36e5866' : '76d63f0a1bc0f4e243fd716a5073c4907436a46dae74e01747a694e67d1b5158',
    // weather
    '0xc37f61a9120b12d41db131e6c2b632ec5fad6fdbb1d109d128906995fb969c1f' : '76d63f0a1bc0f4e243fd716a5073c4907436a46dae74e01747a694e67d1b5158',
    '0xb71f789a0089f63baddcbcacfd480bff023025385c07f6c6a141c5fadf0d24bd' : '76d63f0a1bc0f4e243fd716a5073c4907436a46dae74e01747a694e67d1b5158',

    
  },
  
  smartAgentUAV: (api) => {
    return {
      disabled: false,
      name: 'UAV',
      ethAccount: '0x20a6E2feD0e1518cd0a61B1946B3e9D064aB171b',
      iota: 'https://testnet140.tangle.works',

      // every party that needs to agree on the flight plan must have it's own listener
      // and has its own account and evan.network profile
      listeners: {
        // kinda hackish, just reusing the default account for the insurance listener
        // if the main smart agent has to do anything writing, it should get an own account
        insurance: '0x20a6E2feD0e1518cd0a61B1946B3e9D064aB171b',
        flynex: '0x8958AED4D3a577298166526c37087578C5DB2Fd2',
        weather: '0xFCE2dfF569b6f715E83934d3CfCeff777916fFC7',
        iota: '0xFCE2dfF569b6f715E83934d3CfCeff777916fFC7',
      }
    }
  }
}
