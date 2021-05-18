import { useCallback } from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { Asset, Amount, NetworkFee, Account } from 'multichain-sdk'

import { SupportedChain } from 'multichain-sdk/clients/types'

import { RootState } from 'redux/store'
import * as walletActions from 'redux/wallet/actions'

import { getGasRateByFeeOption } from 'helpers/networkFee'

export const useBalance = () => {
  const dispatch = useDispatch()
  const { feeOptionType } = useSelector((state: RootState) => state.app)
  const { account } = useSelector((state: RootState) => state.wallet)
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
      if (!account) {
        // allow max amount for emulation if wallet is not connected
        return Amount.fromAssetAmount(10 ** 3, 8)
      }

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

      const balance = Account.getAssetBalance(account, asset).amount

      /**
       * if asset is used for gas, subtract the inbound gas fee from input amount
       * else allow full amount
       * Calc: max spendable amount = balance amount - 2 x gas fee(if send asset equals to gas asset)
       */

      const maxSpendableAmount = asset.isGasAsset()
        ? balance.sub(inboundFee.mul(1.5).amount)
        : balance

      if (maxSpendableAmount.gt(0)) {
        return maxSpendableAmount
      }

      return Amount.fromAssetAmount(0, asset.decimal)
    },
    [account, feeOptionType, inboundData],
  )

  return {
    getMaxBalance,
    reloadAllBalance,
    reloadBalanceByChain,
    account,
  }
}
