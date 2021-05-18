import { useCallback, useMemo } from 'react'

import { useSelector } from 'react-redux'

import { unwrapResult } from '@reduxjs/toolkit'
import { THORChain } from '@xchainjs/xchain-util'
import {
  Action,
  ActionListParams,
  ActionStatusEnum,
  ActionTypeEnum,
  HistoryInterval,
} from 'midgard-sdk'
import { Asset, SupportedChain, Account } from 'multichain-sdk'

import * as actions from 'redux/midgard/actions'
import { actions as sliceActions } from 'redux/midgard/slice'
import { useDispatch, RootState } from 'redux/store'
import * as walletActions from 'redux/wallet/actions'

import { TX_PUBLIC_PAGE_LIMIT } from 'settings/constants/global'

import { SubmitTx, TxTracker, TxTrackerType } from './types'

const MAX_HISTORY_COUNT = 100
const PER_DAY = 'day' as HistoryInterval

export const useMidgard = () => {
  const dispatch = useDispatch()
  const midgardState = useSelector((state: RootState) => state.midgard)
  const walletState = useSelector((state: RootState) => state.wallet)
  const account = useMemo(() => walletState.account, [walletState])

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

    dispatch(
      actions.getEarningsHistory({
        interval: PER_DAY,
        count: MAX_HISTORY_COUNT,
      }),
    )
    dispatch(
      actions.getTVLHistory({
        interval: PER_DAY,
        count: MAX_HISTORY_COUNT,
      }),
    )
    dispatch(
      actions.getSwapHistory({
        query: {
          interval: PER_DAY,
          count: MAX_HISTORY_COUNT,
        },
      }),
    )
    dispatch(
      actions.getLiquidityHistory({
        query: {
          interval: PER_DAY,
          count: MAX_HISTORY_COUNT,
        },
      }),
    )
  }, [dispatch])

  const getPoolHistory = useCallback(
    (pool: string) => {
      // fetch historical data till past day

      const query = {
        pool,
        query: {
          interval: PER_DAY,
          count: MAX_HISTORY_COUNT,
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
      if (!account) return

      const assetChainAddress = Account.getChainAddress(account, chain)
      const thorchainAddress = Account.getChainAddress(account, THORChain)
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
    [dispatch, account],
  )

  // get pool member details for a specific chain
  const getMemberDetailsByChain = useCallback(
    (chain: SupportedChain) => {
      if (!account) return

      const chainWalletAddr = Account.getChainAddress(account, chain)

      if (chainWalletAddr) {
        dispatch(
          actions.getPoolMemberDetailByChain({
            chain,
            address: chainWalletAddr,
          }),
        )
      }
    },
    [dispatch, account],
  )

  // get pool member details for all chains
  const getAllMemberDetails = useCallback(() => {
    if (!account) return

    Object.keys(account).forEach((chain) => {
      getMemberDetailsByChain(chain as SupportedChain)
    })
  }, [getMemberDetailsByChain, account])

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

  // process tx tracker to update balance after submit
  // update sent asset balance after submit
  const processSubmittedTx = useCallback(
    ({ submitTx, type }: { submitTx: SubmitTx; type: TxTrackerType }) => {
      if (type === TxTrackerType.Swap || type === TxTrackerType.Switch) {
        const inAsset = submitTx?.inAssets?.[0]
        if (inAsset) {
          const asset = Asset.fromAssetString(inAsset?.asset)

          if (asset) {
            dispatch(
              walletActions.getWalletByChain(asset.chain as SupportedChain),
            )
          }
        }
      } else if (type === TxTrackerType.AddLiquidity) {
        const inAssets = submitTx?.inAssets ?? []
        inAssets.forEach((inAsset) => {
          const asset = Asset.fromAssetString(inAsset?.asset)

          if (asset) {
            dispatch(
              walletActions.getWalletByChain(asset.chain as SupportedChain),
            )
          }
        })
      }
    },
    [dispatch],
  )

  // process tx tracker to update balance after success
  const processTxTracker = useCallback(
    ({ txTracker, action }: { txTracker: TxTracker; action?: Action }) => {
      // update received asset balance after success
      if (action?.status === ActionStatusEnum.Success) {
        if (action.type === ActionTypeEnum.Swap) {
          const outTx = action.out[0]
          const asset = Asset.fromAssetString(outTx?.coins?.[0]?.asset)

          if (asset) {
            dispatch(
              walletActions.getWalletByChain(asset.chain as SupportedChain),
            )
          }
        } else if (action.type === ActionTypeEnum.AddLiquidity) {
          const inAssets = txTracker.submitTx?.inAssets ?? []
          inAssets.forEach((inAsset) => {
            const asset = Asset.fromAssetString(inAsset.asset)

            if (asset) {
              // reload liquidity member details
              getMemberDetailsByChain(asset.chain as SupportedChain)
            }
          })
        } else if (action.type === ActionTypeEnum.Withdraw) {
          const outAssets = txTracker.submitTx?.outAssets ?? []
          outAssets.forEach((outAsset) => {
            const asset = Asset.fromAssetString(outAsset.asset)

            if (asset) {
              dispatch(
                walletActions.getWalletByChain(asset.chain as SupportedChain),
              )
              // reload liquidity member details
              getMemberDetailsByChain(asset.chain as SupportedChain)
            }
          })
        } else if (action.type === ActionTypeEnum.Switch) {
          dispatch(walletActions.getWalletByChain(THORChain))
        }
      }
    },
    [dispatch, getMemberDetailsByChain],
  )

  const pollTx = useCallback(
    (txTracker: TxTracker) => {
      dispatch(actions.pollTx(txTracker))
        .then(unwrapResult)
        .then((response) =>
          processTxTracker({
            txTracker,
            action: response?.actions?.[0],
          }),
        )
    },
    [dispatch, processTxTracker],
  )

  const pollUpgradeTx = useCallback(
    (txTracker: TxTracker) => {
      dispatch(actions.pollUpgradeTx(txTracker))
        .then(unwrapResult)
        .then((response) =>
          processTxTracker({
            txTracker,
            action: response?.actions?.[0],
          }),
        )
    },
    [dispatch, processTxTracker],
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

  const getInboundData = useCallback(() => {
    dispatch(actions.getThorchainInboundData())
  }, [dispatch])

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
    processSubmittedTx,
    getInboundData,
  }
}
