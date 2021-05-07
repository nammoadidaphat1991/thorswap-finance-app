import { useMemo } from 'react'

import { Asset, Amount, AssetAmount, NetworkFee } from 'multichain-sdk'

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
    if (!outboundFee || !inboundFee.asset.eq(inputAsset)) return inboundFee

    const outboundFeeInSendAsset = new AssetAmount(
      inputAsset,
      Amount.fromAssetAmount(
        outboundFee.totalPriceIn(inputAsset, pools).price,
        inputAsset.decimal,
      ),
    )

    return inboundFee.add(outboundFeeInSendAsset)
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
