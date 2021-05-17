import { Chain } from '@xchainjs/xchain-util'
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
  Coin,
  MemberPool,
  InboundAddressesItem,
  TVLHistory,
  LastblockItem,
} from 'midgard-sdk'
import { Pool } from 'multichain-sdk'

export enum TxTrackerStatus {
  Submitting = 'Submitting',
  Pending = 'Pending',
  Success = 'Success',
  Failed = 'Failed',
}

// TxTrackerType has additional Approve value
export enum TxTrackerType {
  Approve = 'Approve',
  Swap = 'swap',
  AddLiquidity = 'addLiquidity',
  Withdraw = 'withdraw',
  Donate = 'donate',
  Refund = 'refund',
  Switch = 'switch',
}

export interface SubmitTx {
  inAssets?: Coin[]
  outAssets?: Coin[]
  txID?: string
  submitDate?: Date
  recipient?: string
  poolAsset?: string
  addTx?: {
    runeTxID?: string
    assetTxID?: string
  }
  withdrawChain?: Chain // chain for asset used for withdraw tx
}

export interface TxTracker {
  uuid: string
  type: TxTrackerType
  status: TxTrackerStatus
  submitTx: SubmitTx
  action: Action | null
  refunded: boolean | null
}

// Record<asset, tracker status>
export type ApproveStatus = Record<string, TxTrackerStatus>

export type MimirData = {
  'mimir//CHURNINTERVAL'?: number
  'mimir//FUNDMIGRATIONINTERVAL'?: number
  'mimir//MINIMUMBONDINRUNE'?: number
  'mimir//MINRUNEPOOLDEPTH'?: number
  'mimir//NEWPOOLCYCLE'?: number
  'mimir//ROTATEPERBLOCKHEIGHT'?: number
  'mimir//MAXLIQUIDITYRUNE'?: number
  'mimir//MAXIMUMLIQUIDITYRUNE'?: number
}

export type ShareType = 'sym' | 'runeAsym' | 'assetAsym'

export enum PoolShareType {
  'SYM' = 'SYM',
  'RUNE_ASYM' = 'RUNE_ASYM',
  'ASSET_ASYM' = 'ASSET_ASYM',
}

// Pool Member Data for sym, runeAsym, assetAsym
export type PoolMemberData = {
  sym?: MemberPool
  runeAsym?: MemberPool
  assetAsym?: MemberPool
}

// Record<poolString, PoolMemberData>
export type ChainMemberData = Record<string, PoolMemberData>

// Record<chainString, ChainMemberData>
export type ChainMemberDetails = Record<string, ChainMemberData>

// Record<chainString, boolean>
export type ChainMemberDetailsLoading = Record<string, boolean>

export type LiquidityProvider = {
  asset: string
  rune_address?: string
  asset_address?: string
  last_add_height: number
  units: string
  pending_rune: string
  pending_asset: string
  pending_tx_Id?: string
  rune_deposit_value: string
  asset_deposit_value: string
}

export type PendingLP = Record<string, LiquidityProvider>

export interface State {
  pools: Pool[]
  poolLoading: boolean
  memberDetails: MemberDetails
  memberDetailsLoading: boolean
  chainMemberDetails: ChainMemberDetails
  chainMemberDetailsLoading: ChainMemberDetailsLoading
  poolStats: PoolStatsDetail | null
  poolStatsLoading: boolean
  depthHistory: DepthHistory | null
  depthHistoryLoading: boolean
  earningsHistory: EarningsHistory | null
  earningsHistoryLoading: boolean
  tvlHistory: TVLHistory | null
  tvlHistoryLoading: boolean
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
  approveStatus: ApproveStatus
  volume24h: number | null
  inboundData: InboundAddressesItem[]
  pendingLP: PendingLP
  pendingLPLoading: boolean
  lastBlock: LastblockItem[]
}
