import { useCallback } from 'react'

import { useDispatch } from 'react-redux'

import { Amount, Asset, Price, runeToAsset } from 'multichain-sdk'

import { useMidgard } from 'redux/midgard/hooks'

import { useApp } from './app/hooks'

/**
 * hooks for managing global state per page, loading moments
 */
export const useGlobalState = () => {
  const dispatch = useDispatch()
  const { actions, pools, getTxData } = useMidgard()
  const { baseCurrency } = useApp()

  const loadInitialData = useCallback(() => {
    dispatch(actions.getVolume24h())
    dispatch(actions.getPools())
    dispatch(actions.getStats())
    dispatch(actions.getNetworkData())
    dispatch(actions.getMimir())
    dispatch(actions.getQueue())
    getTxData({
      offset: 0,
    })
  }, [dispatch, actions, getTxData])

  const refreshPage = useCallback(() => {
    loadInitialData()
  }, [loadInitialData])

  const runeToCurrency = useCallback(
    (runeAmount: Amount): Price => {
      const quoteAsset = Asset.fromAssetString(baseCurrency)

      return runeToAsset({
        runeAmount,
        quoteAsset,
        pools,
      })
    },
    [baseCurrency, pools],
  )

  return {
    runeToCurrency,
    refreshPage,
  }
}
