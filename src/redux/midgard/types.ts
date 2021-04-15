import {
  StatsData,
  Network,
  Constants,
  Queue,
  PoolStatsDetail,
  DepthHistory,
  EarningsHistory,
  SwapHistory,
  LiquidityHistory,
  ActionsList,
  MemberDetails,
  Action,
  ActionTypeEnum,
  Coin,
} from 'midgard-sdk'
import { Pool } from 'multichain-sdk'

export enum TxTrackerStatus {
  Submitting = 'Submitting',
  Pending = 'Pending',
  Success = 'Success',
}

export interface SubmitTx {
  inAssets: Coin[]
  outAssets: Coin[]
  txID?: string
  submitDate?: Date
  recipient?: string
  poolAsset?: string
}

export interface TxTracker {
  uuid: string
  type: ActionTypeEnum
  status: TxTrackerStatus
  submitTx: SubmitTx
  action: Action | null
  refunded: boolean | null
}

export type MimirData = {
  'mimir//CHURNINTERVAL'?: number
  'mimir//FUNDMIGRATIONINTERVAL'?: number
  'mimir//MINIMUMBONDINRUNE'?: number
  'mimir//MINRUNEPOOLDEPTH'?: number
  'mimir//NEWPOOLCYCLE'?: number
  'mimir//ROTATEPERBLOCKHEIGHT'?: number
  'mimir//MAXLIQUIDITYRUNE'?: number
}

export interface State {
  pools: Pool[]
  poolLoading: boolean
  memberDetails: MemberDetails
  memberDetailsLoading: boolean
  poolStats: PoolStatsDetail | null
  poolStatsLoading: boolean
  depthHistory: DepthHistory | null
  depthHistoryLoading: boolean
  earningsHistory: EarningsHistory | null
  earningsHistoryLoading: boolean
  swapHistory: SwapHistory | null
  swapHistoryLoading: boolean
  liquidityHistory: LiquidityHistory | null
  liquidityHistoryLoading: boolean
  stats: StatsData | null
  networkData: Network | null
  constants: Constants | null
  queue: Queue | null
  txData: ActionsList | null // for tx explorer
  txDataLoading: boolean
  txTrackers: TxTracker[]
  txCollapsed: boolean
  mimirLoading: boolean
  mimir: MimirData
}
