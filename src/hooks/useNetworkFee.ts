import { useMemo } from 'react'

import { Asset, Amount, AssetAmount, NetworkFee, Pool } from 'multichain-sdk'

import { useApp } from 'redux/app/hooks'
import { useMidgard } from 'redux/midgard/hooks'

import { getGasRateByChain, getGasRateByFeeOption } from 'helpers/networkFee'

import useInterval from './useInterval'

const POLL_GAS_RATE_INTERVAL = 10 * 1000

export const useNetworkFee = ({
  inputAsset,
  outputAsset,
}: {
  inputAsset: Asset
  outputAsset?: Asset
}) => {
  const { feeOptionType } = useApp()
  const { inboundData, getInboundData, pools } = useMidgard()

  useInterval(() => {
    getInboundData()
  }, POLL_GAS_RATE_INTERVAL)

  const inboundFee = useMemo(() => {
    // get inbound gasRate with fee option
    const gasRate = getGasRateByFeeOption({
      inboundData,
      chain: inputAsset.chain,
      feeOptionType,
    })
    const networkFee = NetworkFee.getNetworkFeeByAsset({
      asset: inputAsset,
      gasRate,
      direction: 'inbound',
    })

    return networkFee
  }, [inputAsset, inboundData, feeOptionType])

  const outboundFee = useMemo(() => {
    if (!outputAsset) return null

    const gasRate = getGasRateByChain({ inboundData, chain: outputAsset.chain })
    const networkFee = NetworkFee.getNetworkFeeByAsset({
      asset: outputAsset,
      gasRate,
      direction: 'outbound',
    })

    return networkFee
  }, [outputAsset, inboundData])

  const totalFee = useMemo(() => {
    if (!outboundFee) return inboundFee

    const outboundFeeInSendAsset = new AssetAmount(
      inputAsset,
      Amount.fromAssetAmount(
        outboundFee.totalPriceIn(inputAsset, pools).price,
        inputAsset.decimal,
      ),
    )

    if (inboundFee.asset.eq(inputAsset)) {
      return inboundFee.add(outboundFeeInSendAsset)
    }

    const inboundFeeInSendAsset = new AssetAmount(
      inputAsset,
      Amount.fromAssetAmount(
        inboundFee.totalPriceIn(inputAsset, pools).price,
        inputAsset.decimal,
      ),
    )
    return inboundFeeInSendAsset.add(outboundFeeInSendAsset)
  }, [inputAsset, inboundFee, outboundFee, pools])

  const totalFeeInUSD = useMemo(
    () => totalFee.totalPriceIn(Asset.USD(), pools),
    [totalFee, pools],
  )

  return {
    totalFee,
    inboundFee,
    outboundFee,
    totalFeeInUSD,
  }
}

export const getSumAmountInUSD = (
  assetAmount1: AssetAmount | null,
  assetAmount2: AssetAmount | null,
  pools: Pool[],
) => {
  const assetAmount1InUSD = assetAmount1?.totalPriceIn(Asset.USD(), pools)
  const assetAmount2InUSD = assetAmount2?.totalPriceIn(Asset.USD(), pools)

  if (assetAmount1 === null && assetAmount2InUSD)
    return assetAmount2InUSD.toCurrencyFormat()
  if (assetAmount2 === null && assetAmount1InUSD)
    return assetAmount1InUSD.toCurrencyFormat()

  if (assetAmount1InUSD && assetAmount2InUSD) {
    const sum = assetAmount1InUSD.raw().plus(assetAmount2InUSD.raw())

    return Amount.fromAssetAmount(sum, 8).toFixed(2)
  }

  return Amount.fromAssetAmount(0, 8).toFixed()
}
