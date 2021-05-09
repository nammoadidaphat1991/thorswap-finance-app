import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { THORChain } from '@xchainjs/xchain-util'
import { ActionStatusEnum, ActionTypeEnum } from 'midgard-sdk'
import moment from 'moment'
import { Pool } from 'multichain-sdk'

import * as midgardActions from './actions'
import { State, TxTracker, TxTrackerStatus } from './types'
import { getChainMemberDetails, isPendingLP } from './utils'

const initialState: State = {
  pools: [],
  poolLoading: false,
  memberDetails: {
    pools: [],
  },
  memberDetailsLoading: false,
  chainMemberDetails: {},
  chainMemberDetailsLoading: {},
  stats: null,
  networkData: null,
  constants: null,
  queue: null,
  poolStats: null,
  poolStatsLoading: false,
  depthHistory: null,
  depthHistoryLoading: false,
  earningsHistory: null,
  earningsHistoryLoading: false,
  tvlHistory: null,
  tvlHistoryLoading: false,
  swapHistory: null,
  swapHistoryLoading: false,
  liquidityHistory: null,
  liquidityHistoryLoading: false,
  txData: null,
  txDataLoading: false,
  txTrackers: [],
  txCollapsed: true,
  mimirLoading: false,
  mimir: {},
  approveStatus: {},
  volume24h: null,
  inboundData: [],
  pendingLP: {},
  pendingLPLoading: false,
}

const slice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    addNewTxTracker(state, action: PayloadAction<TxTracker>) {
      state.txTrackers = [...state.txTrackers, action.payload]
      state.txCollapsed = false
    },
    updateTxTracker(
      state,
      action: PayloadAction<{ uuid: string; txTracker: Partial<TxTracker> }>,
    ) {
      const { uuid, txTracker } = action.payload

      state.txTrackers = state.txTrackers.map((tracker: TxTracker) => {
        if (tracker.uuid === uuid) {
          return {
            ...tracker,
            ...txTracker,
          }
        }

        return tracker
      })
    },
    clearTxTrackers(state) {
      state.txTrackers = []
    },
    setTxCollapsed(state, action: PayloadAction<boolean>) {
      state.txCollapsed = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(midgardActions.getPools.pending, (state) => {
        state.poolLoading = true
      })
      .addCase(midgardActions.getPools.fulfilled, (state, action) => {
        const pools = action.payload

        state.pools = pools.reduce((res: Pool[], poolDetail) => {
          const poolObj = Pool.fromPoolData(poolDetail)
          if (poolObj) {
            res.push(poolObj)
          }
          return res
        }, [])

        state.poolLoading = false
      })
      .addCase(midgardActions.getPools.rejected, (state) => {
        state.poolLoading = false
      })
      .addCase(midgardActions.getMemberDetail.pending, (state) => {
        state.memberDetailsLoading = true
      })
      .addCase(midgardActions.getMemberDetail.fulfilled, (state, action) => {
        state.memberDetails = action.payload
        state.memberDetailsLoading = false
      })
      .addCase(midgardActions.getMemberDetail.rejected, (state) => {
        state.memberDetailsLoading = false
      })
      // used for getting all pool share data
      .addCase(
        midgardActions.getPoolMemberDetailByChain.pending,
        (state, action) => {
          const {
            arg: { chain },
          } = action.meta

          state.chainMemberDetailsLoading = {
            ...state.chainMemberDetailsLoading,
            [chain]: true,
          }
        },
      )
      /**
       * NOTE: need to fetch pool member data for both chain address and thorchain address
       * get sym, assetAsym share from the MemberPool Data with non-thorchain address
       * get runeAsym share from the MemberPool Data with thorchain address
       */
      .addCase(
        midgardActions.getPoolMemberDetailByChain.fulfilled,
        (state, action) => {
          const {
            arg: { chain },
          } = action.meta

          const { pools: memPools } = action.payload

          const fetchedChainMemberDetails = getChainMemberDetails({
            chain,
            memPools,
            chainMemberDetails: state.chainMemberDetails,
          })

          state.chainMemberDetails = fetchedChainMemberDetails

          state.chainMemberDetailsLoading = {
            ...state.chainMemberDetailsLoading,
            [chain]: false,
          }
        },
      )
      .addCase(
        midgardActions.getPoolMemberDetailByChain.rejected,
        (state, action) => {
          const {
            arg: { chain },
          } = action.meta

          state.chainMemberDetailsLoading = {
            ...state.chainMemberDetailsLoading,
            [chain]: false,
          }
        },
      )
      // used for getting pool share for a specific chain
      .addCase(
        midgardActions.reloadPoolMemberDetailByChain.pending,
        (state, action) => {
          const {
            arg: { chain },
          } = action.meta

          state.chainMemberDetailsLoading = {
            ...state.chainMemberDetailsLoading,
            [chain]: true,
          }
        },
      )
      /**
       * NOTE: need to fetch pool member data for both chain address and thorchain address
       * get sym, assetAsym share from the MemberPool Data with non-thorchain address
       * get runeAsym share from the MemberPool Data with thorchain address
       */
      .addCase(
        midgardActions.reloadPoolMemberDetailByChain.fulfilled,
        (state, action) => {
          const {
            arg: { chain },
          } = action.meta

          const { runeMemberData, assetMemberData } = action.payload

          const { pools: runeMemberDetails } = runeMemberData
          const { pools: assetMemberDetails } = assetMemberData

          // add rune asymm
          const fetchedChainMemberDetails1 = getChainMemberDetails({
            chain: THORChain,
            memPools: runeMemberDetails,
            chainMemberDetails: state.chainMemberDetails,
          })

          // add sym, asset asymm
          const fetchedChainMemberDetails2 = getChainMemberDetails({
            chain,
            memPools: assetMemberDetails,
            chainMemberDetails: fetchedChainMemberDetails1,
          })

          state.chainMemberDetails = fetchedChainMemberDetails2

          state.chainMemberDetailsLoading = {
            ...state.chainMemberDetailsLoading,
            [chain]: false,
          }
        },
      )
      .addCase(
        midgardActions.reloadPoolMemberDetailByChain.rejected,
        (state, action) => {
          const {
            arg: { chain },
          } = action.meta

          state.chainMemberDetailsLoading = {
            ...state.chainMemberDetailsLoading,
            [chain]: false,
          }
        },
      )
      .addCase(midgardActions.getStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })
      .addCase(midgardActions.getNetworkData.fulfilled, (state, action) => {
        state.networkData = action.payload
      })
      .addCase(midgardActions.getConstants.fulfilled, (state, action) => {
        state.constants = action.payload
      })
      .addCase(midgardActions.getQueue.fulfilled, (state, action) => {
        state.queue = action.payload
      })
      // get pool stats
      .addCase(midgardActions.getPoolStats.pending, (state) => {
        state.poolStatsLoading = true
      })
      .addCase(midgardActions.getPoolStats.fulfilled, (state, action) => {
        state.poolStatsLoading = false
        state.poolStats = action.payload
      })
      .addCase(midgardActions.getPoolStats.rejected, (state) => {
        state.poolStatsLoading = true
      })
      // get depth history
      .addCase(midgardActions.getDepthHistory.pending, (state) => {
        state.depthHistoryLoading = true
      })
      .addCase(midgardActions.getDepthHistory.fulfilled, (state, action) => {
        state.depthHistoryLoading = false
        state.depthHistory = action.payload
      })
      .addCase(midgardActions.getDepthHistory.rejected, (state) => {
        state.depthHistoryLoading = true
      })
      // get earnings history
      .addCase(midgardActions.getEarningsHistory.pending, (state) => {
        state.earningsHistoryLoading = true
      })
      .addCase(midgardActions.getEarningsHistory.fulfilled, (state, action) => {
        state.earningsHistoryLoading = false
        state.earningsHistory = action.payload
      })
      .addCase(midgardActions.getEarningsHistory.rejected, (state) => {
        state.earningsHistoryLoading = true
      })
      // get tvl history
      .addCase(midgardActions.getTVLHistory.pending, (state) => {
        state.tvlHistoryLoading = true
      })
      .addCase(midgardActions.getTVLHistory.fulfilled, (state, action) => {
        state.tvlHistoryLoading = false
        state.tvlHistory = action.payload
      })
      .addCase(midgardActions.getTVLHistory.rejected, (state) => {
        state.tvlHistoryLoading = true
      })
      // get swap history
      .addCase(midgardActions.getSwapHistory.pending, (state) => {
        state.swapHistoryLoading = true
      })
      .addCase(midgardActions.getSwapHistory.fulfilled, (state, action) => {
        state.swapHistoryLoading = false
        state.swapHistory = action.payload
      })
      .addCase(midgardActions.getSwapHistory.rejected, (state) => {
        state.swapHistoryLoading = true
      })
      // get liquidity history
      .addCase(midgardActions.getLiquidityHistory.pending, (state) => {
        state.liquidityHistoryLoading = true
      })
      .addCase(
        midgardActions.getLiquidityHistory.fulfilled,
        (state, action) => {
          state.liquidityHistoryLoading = false
          state.liquidityHistory = action.payload
        },
      )
      .addCase(midgardActions.getLiquidityHistory.rejected, (state) => {
        state.liquidityHistoryLoading = true
      })
      // get tx
      .addCase(midgardActions.getActions.pending, (state) => {
        state.txDataLoading = true
      })
      .addCase(midgardActions.getActions.fulfilled, (state, action) => {
        state.txDataLoading = false
        state.txData = action.payload
      })
      .addCase(midgardActions.getActions.rejected, (state) => {
        state.txDataLoading = true
      })
      // get thorchain mimir
      .addCase(midgardActions.getMimir.pending, (state) => {
        state.mimirLoading = true
      })
      .addCase(midgardActions.getMimir.fulfilled, (state, action) => {
        state.mimirLoading = false
        state.mimir = action.payload
      })
      .addCase(midgardActions.getMimir.rejected, (state) => {
        state.mimirLoading = true
      })
      // poll Tx
      .addCase(midgardActions.pollTx.fulfilled, (state, action) => {
        const { arg: txTracker } = action.meta
        const { actions } = action.payload
        const txData = actions?.[0]

        if (txData) {
          state.txTrackers = state.txTrackers.map((tracker: TxTracker) => {
            if (tracker.uuid === txTracker.uuid) {
              const status =
                txData.status === ActionStatusEnum.Pending
                  ? TxTrackerStatus.Pending
                  : TxTrackerStatus.Success

              const refunded =
                status === TxTrackerStatus.Success &&
                txData.type === ActionTypeEnum.Refund

              return {
                ...tracker,
                action: txData,
                status,
                refunded,
              }
            }

            return tracker
          })
        }
      })
      // poll Upgrade Tx
      .addCase(midgardActions.pollUpgradeTx.fulfilled, (state, action) => {
        const { arg: txTracker } = action.meta
        const { actions } = action.payload
        const txData = actions?.[0]
        const {
          submitTx: { submitDate },
        } = txTracker

        if (submitDate && txData) {
          const { date } = txData

          if (
            moment.unix(Number(date) / 1000000000).isAfter(moment(submitDate))
          ) {
            state.txTrackers = state.txTrackers.map((tracker: TxTracker) => {
              if (tracker.uuid === txTracker.uuid) {
                const status =
                  txData.status === ActionStatusEnum.Pending
                    ? TxTrackerStatus.Pending
                    : TxTrackerStatus.Success

                const refunded =
                  status === TxTrackerStatus.Success &&
                  txData.type === ActionTypeEnum.Refund

                return {
                  ...tracker,
                  action: txData,
                  status,
                  refunded,
                }
              }

              return tracker
            })
          }
        }
      })
      // poll Approve Tx
      .addCase(midgardActions.pollApprove.fulfilled, (state, action) => {
        const { asset, approved } = action.payload
        const { arg: txTracker } = action.meta

        if (asset) {
          state.txTrackers = state.txTrackers.map((tracker: TxTracker) => {
            if (tracker.uuid === txTracker.uuid) {
              const status = approved
                ? TxTrackerStatus.Success
                : TxTrackerStatus.Pending

              // save approve status to state
              state.approveStatus = {
                ...state.approveStatus,
                [asset.toString()]: status,
              }

              return {
                ...tracker,
                status,
              }
            }

            return tracker
          })
        }
      })
      // get 24h volume
      .addCase(midgardActions.getVolume24h.fulfilled, (state, action) => {
        state.volume24h = action.payload.totalVolume
      })
      // get thornode inbound addresses
      .addCase(
        midgardActions.getThorchainInboundData.fulfilled,
        (state, action) => {
          state.inboundData = action.payload
        },
      )
      // get pending LP
      .addCase(midgardActions.getLiquidityProviderData.pending, (state) => {
        state.pendingLPLoading = true
      })
      .addCase(
        midgardActions.getLiquidityProviderData.fulfilled,
        (state, action) => {
          const {
            arg: { asset },
          } = action.meta
          const data = action.payload

          if (isPendingLP(data)) {
            state.pendingLP = {
              [asset]: data,
              ...state.pendingLP,
            }
          } else {
            delete state.pendingLP?.[asset]
          }
          state.pendingLPLoading = false
        },
      )
      .addCase(midgardActions.getLiquidityProviderData.rejected, (state) => {
        state.pendingLPLoading = false
      })
  },
})

export const { reducer, actions } = slice

export default slice
