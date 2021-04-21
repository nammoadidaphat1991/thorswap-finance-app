import { useCallback, useMemo } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { THORChain } from '@xchainjs/xchain-util'
import { ActionListParams, HistoryInterval } from 'midgard-sdk'
import moment from 'moment'
import { SupportedChain } from 'multichain-sdk'

import * as actions from 'redux/midgard/actions'
import { actions as sliceActions } from 'redux/midgard/slice'
import { RootState } from 'redux/store'

import { TX_PUBLIC_PAGE_LIMIT } from 'settings/constants/global'

import { TxTracker } from './types'

const MAX_HISTORY_COUNT = 100
const PER_DAY = 'day' as HistoryInterval

export const useMidgard = () => {
  const dispatch = useDispatch()
  const midgardState = useSelector((state: RootState) => state.midgard)
  const walletState = useSelector((state: RootState) => state.wallet)
  const wallet = useMemo(() => walletState.wallet, [walletState])

  const isGlobalHistoryLoading = useMemo(
    () =>
      midgardState.earningsHistoryLoading ||
      midgardState.swapHistoryLoading ||
      midgardState.liquidityHistoryLoading,
    [midgardState],
  )

  // get earnings, swap, liquidity history
  const getGlobalHistory = useCallback(() => {
    // fetch historical data till past day

    const pastDay = moment().subtract(1, 'days').unix()
    dispatch(
      actions.getEarningsHistory({
        interval: PER_DAY,
        count: MAX_HISTORY_COUNT,
        to: pastDay,
      }),
    )
    dispatch(
      actions.getSwapHistory({
        query: {
          interval: PER_DAY,
          count: MAX_HISTORY_COUNT,
          to: pastDay,
        },
      }),
    )
    dispatch(
      actions.getLiquidityHistory({
        query: {
          interval: PER_DAY,
          count: MAX_HISTORY_COUNT,
          to: pastDay,
        },
      }),
    )
  }, [dispatch])

  const getPoolHistory = useCallback(
    (pool: string) => {
      // fetch historical data till past day

      const pastDay = moment().subtract(1, 'days').unix()
      const query = {
        pool,
        query: {
          interval: PER_DAY,
          count: MAX_HISTORY_COUNT,
          to: pastDay,
        },
      }
      dispatch(actions.getSwapHistory(query))
      dispatch(actions.getDepthHistory(query))
      dispatch(actions.getLiquidityHistory(query))
    },
    [dispatch],
  )

  // get tx data
  const getTxData = useCallback(
    (params: Omit<ActionListParams, 'limit'>) => {
      dispatch(
        actions.getActions({
          ...params,
          limit: TX_PUBLIC_PAGE_LIMIT,
        }),
      )
    },
    [dispatch],
  )

  /**
   * reload pool member details for a specific chain
   * 1. fetch pool member data for chain wallet addr (asset asymm share, symm share)
   * 2. fetch pool member data for thorchain wallet addr (rune asymm share)
   */
  const loadMemberDetailsByChain = useCallback(
    (chain: SupportedChain) => {
      if (!wallet) return

      const assetChainAddress = wallet?.[chain]?.address
      const thorchainAddress = wallet?.[THORChain]?.address
      if (assetChainAddress && thorchainAddress) {
        dispatch(
          actions.reloadPoolMemberDetailByChain({
            chain,
            thorchainAddress,
            assetChainAddress,
          }),
        )
      }
    },
    [dispatch, wallet],
  )

  // get pool member details for a specific chain
  const getMemberDetailsByChain = useCallback(
    (chain: SupportedChain) => {
      if (!wallet) return

      const chainWalletAddr = wallet?.[chain]?.address

      if (chainWalletAddr) {
        dispatch(
          actions.getPoolMemberDetailByChain({
            chain,
            address: chainWalletAddr,
          }),
        )
      }
    },
    [dispatch, wallet],
  )

  // get pool member details for all chains
  const getAllMemberDetails = useCallback(() => {
    if (!wallet) return

    Object.keys(wallet).forEach((chain) => {
      getMemberDetailsByChain(chain as SupportedChain)
    })
  }, [getMemberDetailsByChain, wallet])

  const addNewTxTracker = useCallback(
    (txTracker: TxTracker) => {
      dispatch(sliceActions.addNewTxTracker(txTracker))
    },
    [dispatch],
  )

  const updateTxTracker = useCallback(
    ({ uuid, txTracker }: { uuid: string; txTracker: Partial<TxTracker> }) => {
      dispatch(sliceActions.updateTxTracker({ uuid, txTracker }))
    },
    [dispatch],
  )

  const pollTx = useCallback(
    (txTracker: TxTracker) => {
      dispatch(actions.pollTx(txTracker))
    },
    [dispatch],
  )

  const pollUpgradeTx = useCallback(
    (txTracker: TxTracker) => {
      dispatch(actions.pollUpgradeTx(txTracker))
    },
    [dispatch],
  )

  const pollApprove = useCallback(
    (txTracker: TxTracker) => {
      dispatch(actions.pollApprove(txTracker))
    },
    [dispatch],
  )

  const clearTxTrackers = useCallback(() => {
    dispatch(sliceActions.clearTxTrackers())
  }, [dispatch])

  const setTxCollapsed = useCallback(
    (collapsed: boolean) => {
      dispatch(sliceActions.setTxCollapsed(collapsed))
    },
    [dispatch],
  )

  return {
    ...midgardState,
    actions,
    isGlobalHistoryLoading,
    getPoolHistory,
    getGlobalHistory,
    getTxData,
    getAllMemberDetails,
    getMemberDetailsByChain,
    loadMemberDetailsByChain,
    addNewTxTracker,
    updateTxTracker,
    clearTxTrackers,
    setTxCollapsed,
    pollTx,
    pollUpgradeTx,
    pollApprove,
  }
}
