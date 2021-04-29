import axios from 'axios'

import { THORNODE_MAINNET_URL, THORNODE_TESTNET_URL } from './config'

export const getThornodeBaseUrl = (network: 'mainnet' | 'testnet') => {
  if (network === 'mainnet') {
    return THORNODE_MAINNET_URL
  }
  return THORNODE_TESTNET_URL
}

// https://thornode.thorchain.info/thorchain/inbound_addresses
export const getThornodeInboundAddress = async (
  network: 'mainnet' | 'testnet',
) => {
  const baseUrl = getThornodeBaseUrl(network)

  const response = await axios.get(`${baseUrl}/thorchain/inbound_addresses`)

  return response
}
