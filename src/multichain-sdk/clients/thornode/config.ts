export const THORNODE_TESTNET_API_URI =
  'https://testnet.thornode.thorchain.info/thorchain'

export const THORNODE_MAINNET_API_URI =
  'https://thornode.thorchain.info/thorchain'

export const thornodeAPI = (url: string, network = 'testnet') =>
  `${
    network === 'testnet' ? THORNODE_TESTNET_API_URI : THORNODE_MAINNET_API_URI
  }/${url}`
