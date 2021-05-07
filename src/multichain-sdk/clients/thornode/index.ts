import { getInboundData } from './api'
import { InboundAddressesItem } from './types'

export const getInboundDataByChain = async (
  chain: string,
  network: 'mainnet' | 'testnet',
): Promise<InboundAddressesItem> => {
  try {
    const { data: inboundData } = await getInboundData(network)
    const addresses = inboundData || []

    const chainAddressData = addresses.find(
      (item: InboundAddressesItem) => item.chain === chain,
    )

    if (chainAddressData) {
      return chainAddressData
    }

    throw new Error('pool address not found')
  } catch (error) {
    return Promise.reject(error)
  }
}
