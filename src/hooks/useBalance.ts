import { useCallback } from 'react'

import { useSelector, useDispatch } from 'react-redux'

import {
  Asset,
  Amount,
  AssetAmount,
  getAssetBalance,
  NetworkFee,
} from 'multichain-sdk'

import { SupportedChain } from 'multichain-sdk/clients/types'

import { RootState } from 'redux/store'
import * as walletActions from 'redux/wallet/actions'

import { getGasRateByFeeOption } from 'helpers/networkFee'

export const useBalance = () => {
  const dispatch = useDispatch()
  const { feeOptionType } = useSelector((state: RootState) => state.app)
  const { wallet } = useSelector((state: RootState) => state.wallet)
  const { inboundData } = useSelector((state: RootState) => state.midgard)

  const reloadBalanceByChain = useCallback(
    (chain: SupportedChain) => {
      dispatch(walletActions.getWalletByChain(chain))
    },
    [dispatch],
  )

  const reloadAllBalance = useCallback(() => {
    dispatch(walletActions.loadAllWallets())
  }, [dispatch])

  const getMaxBalance = useCallback(
    (asset: Asset): Amount => {
      if (!wallet) {
        // allow max amount for emulation if wallet is not connected
        return Amount.fromAssetAmount(10 ** 3, 8)
      }

      // threshold amount to retain in the balance for gas purpose
      const thresholdAmount = AssetAmount.getThresholdAmount(asset).amount

      // calculate inbound fee
      const gasRate = getGasRateByFeeOption({
        inboundData,
        chain: asset.chain,
        feeOptionType,
      })
      const inboundFee = NetworkFee.getNetworkFeeByAsset({
        asset,
        gasRate,
        direction: 'inbound',
      })

      const balance = getAssetBalance(asset, wallet).amount

      // max spendable amount = balance amount - threshold amount - gas fee(if send asset equals to gas asset)
      const maxSpendableAmount = balance
        .sub(thresholdAmount)
        .sub(inboundFee.amount)

      if (maxSpendableAmount.gt(0)) {
        return maxSpendableAmount
      }

      return Amount.fromAssetAmount(0, asset.decimal)
    },
    [wallet, feeOptionType, inboundData],
  )

  return {
    getMaxBalance,
    reloadAllBalance,
    reloadBalanceByChain,
    wallet,
  }
}
