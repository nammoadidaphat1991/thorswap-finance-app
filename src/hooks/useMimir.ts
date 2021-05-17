// https://docs.thorchain.org/how-it-works/governance#mimir

import { useMemo } from 'react'

import { Amount } from 'multichain-sdk'

import { useMidgard } from 'redux/midgard/hooks'

export const useMimir = () => {
  const { networkData, mimir } = useMidgard()

  const maxLiquidityRuneMimir = mimir?.['mimir//MAXIMUMLIQUIDITYRUNE']
  const maxLiquidityRune = Amount.fromMidgard(maxLiquidityRuneMimir)
  const totalPooledRune = Amount.fromMidgard(networkData?.totalPooledRune)

  const isFundsCapReached: boolean = useMemo(() => {
    if (!maxLiquidityRuneMimir) return false

    // totalPooledRune >= 90% of maxLiquidityRune
    return maxLiquidityRune.mul(0.9).lte(totalPooledRune)
  }, [totalPooledRune, maxLiquidityRune, maxLiquidityRuneMimir])

  const capPercent = useMemo(() => {
    if (!maxLiquidityRuneMimir) return null

    return `${totalPooledRune.div(maxLiquidityRune).mul(100).toFixed(1)}%`
  }, [totalPooledRune, maxLiquidityRune, maxLiquidityRuneMimir])

  return {
    totalPooledRune,
    maxLiquidityRune,
    isFundsCapReached,
    capPercent,
  }
}
