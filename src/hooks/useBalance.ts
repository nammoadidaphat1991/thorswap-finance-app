import { useCallback } from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { Asset, Amount, AssetAmount, getAssetBalance } from 'multichain-sdk'

import { SupportedChain } from 'multichain-sdk/clients/types'

import { RootState } from 'redux/store'
import * as walletActions from 'redux/wallet/actions'

export const useBalance = () => {
  const dispatch = useDispatch()
  const { wallet } = useSelector((state: RootState) => state.wallet)

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
      const balance = getAssetBalance(asset, wallet).amount

      if (balance.gt(thresholdAmount)) {
        return balance.sub(thresholdAmount)
      }

      return Amount.fromAssetAmount(0, asset.decimal)
    },
    [wallet],
  )

  return {
    getMaxBalance,
    reloadAllBalance,
    reloadBalanceByChain,
    wallet,
  }
}
