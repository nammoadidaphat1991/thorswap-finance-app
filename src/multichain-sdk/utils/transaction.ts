import { SupportedChain } from '../clients/types'
import { blockTime, blockReward } from '../constants'
import { Amount } from '../entities'

// get estimated time for tx processed on thorchain network
export const getEstimatedTxSeconds = ({
  chain,
  amount,
}: {
  chain: SupportedChain
  amount: Amount
}): number => {
  const chainBlockReward = blockReward?.[chain] ?? 0
  const chainBlockTime = blockTime?.[chain] ?? 0

  if (chainBlockReward) {
    const block = Math.ceil(amount.assetAmount.toNumber() / chainBlockReward)
    return block * chainBlockTime
  }

  return 0
}

export const getEstimatedTxTime = ({
  chain,
  amount,
}: {
  chain: SupportedChain
  amount: Amount
}) => {
  const seconds = getEstimatedTxSeconds({ chain, amount })

  if (!seconds) return '<5s'

  if (seconds < 60) {
    return `<${seconds}s`
  }

  return `<${Math.ceil(seconds / 60)}m`
}
