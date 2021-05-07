import { FeeOptionKey } from '@xchainjs/xchain-client'
import { InboundAddressesItem } from 'midgard-sdk'

const multiplier: Record<FeeOptionKey, number> = {
  average: 0.67,
  fast: 1,
  fastest: 1.5,
}

/**
 * Ref: https://github.com/xchainjs/xchainjs-lib/issues/299
 * return feeRate per option
 * average: 0.67x
 * fast: 1x
 * fastest: 1.5x
 * @param feeOptionKey average | fast | fastest
 * @param inboundData inboundAddressItem fetched from thornode
 */
export const getFeeRate = ({
  feeOptionKey = 'fast',
  inboundData,
}: {
  feeOptionKey: FeeOptionKey
  inboundData: InboundAddressesItem
}) => {
  return Number(inboundData?.gas_rate ?? 0) * multiplier[feeOptionKey]
}
