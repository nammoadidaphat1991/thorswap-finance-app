import { Chain } from '@xchainjs/xchain-util'
import { InboundAddressesItem } from 'midgard-sdk'

// Reference issue: https://github.com/thorchain/asgardex-electron/issues/1381
export const getGasRateByChain = ({
  inboundData,
  chain,
}: {
  inboundData: InboundAddressesItem[]
  chain: Chain
}): number => {
  const chainInboundData = inboundData.find((data) => data.chain === chain)

  return Number(chainInboundData?.gas_rate ?? 0)
}
