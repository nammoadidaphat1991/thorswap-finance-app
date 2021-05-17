import { createAsyncThunk } from '@reduxjs/toolkit'
import { ActionTypeEnum } from 'midgard-sdk'
import { Asset } from 'multichain-sdk'

import { midgardApi } from 'services/midgard'
import { multichain } from 'services/multichain'
import {
  getThorchainMimir,
  getInboundData,
  getLiquidityProvider,
} from 'services/thornode'

import { SupportedChain } from '../../multichain-sdk/clients/types'
import { TxTracker } from './types'

export const getPools = createAsyncThunk(
  'midgard/getPools',
  midgardApi.getPools,
)

export const getPoolStats = createAsyncThunk(
  'midgard/getPoolStats',
  midgardApi.getPoolStats,
)

export const getNetworkData = createAsyncThunk(
  'midgard/getNetworkData',
  midgardApi.getNetworkData,
)

export const getLastblock = createAsyncThunk(
  'midgard/getLastblock',
  midgardApi.getLastblock,
)

export const getStats = createAsyncThunk(
  'midgard/getStats',
  midgardApi.getStats,
)

export const getConstants = createAsyncThunk(
  'midgard/getConstants',
  midgardApi.getConstants,
)

export const getQueue = createAsyncThunk(
  'midgard/getQueue',
  midgardApi.getQueue,
)

export const getActions = createAsyncThunk(
  'midgard/getActions',
  midgardApi.getActions,
)

export const getTVLHistory = createAsyncThunk(
  'midgard/getTVLHistory',
  midgardApi.getTVLHistory,
)

export const getSwapHistory = createAsyncThunk(
  'midgard/getSwapHistory',
  midgardApi.getSwapHistory,
)

export const getLiquidityHistory = createAsyncThunk(
  'midgard/getLiquidityHistory',
  midgardApi.getLiquidityHistory,
)

export const getEarningsHistory = createAsyncThunk(
  'midgard/getEarningsHistory',
  midgardApi.getEarningsHistory,
)

export const getDepthHistory = createAsyncThunk(
  'midgard/getDepthHistory',
  midgardApi.getDepthHistory,
)

export const getMemberDetail = createAsyncThunk(
  'midgard/getMemberDetail',
  midgardApi.getMemberDetail,
)

// NOTE: pass chain and address to param
export const getPoolMemberDetailByChain = createAsyncThunk(
  'midgard/getPoolMemberDetailByChain',
  async ({ address }: { chain: SupportedChain; address: string }) => {
    const response = await midgardApi.getMemberDetail(address)

    return response
  },
)

// NOTE: pass chain, thorchain address, chain wallet address for wallet
export const reloadPoolMemberDetailByChain = createAsyncThunk(
  'midgard/reloadPoolMemberDetailByChain',
  async ({
    thorchainAddress,
    assetChainAddress,
  }: {
    chain: SupportedChain
    thorchainAddress: string
    assetChainAddress: string
  }) => {
    const runeMemberData = await midgardApi.getMemberDetail(thorchainAddress)
    const assetMemberData = await midgardApi.getMemberDetail(assetChainAddress)

    return {
      runeMemberData,
      assetMemberData,
    }
  },
)

export const pollUpgradeTx = createAsyncThunk(
  'midgard/pollUpgradeTx',
  async (txTracker: TxTracker) => {
    const {
      submitTx: { recipient },
    } = txTracker

    if (recipient) {
      const response = await midgardApi.getActions({
        limit: 1,
        offset: 0,
        address: recipient,
        type: ActionTypeEnum.Switch,
      })
      return response
    }

    throw Error('no recipient')
  },
)

export const pollTx = createAsyncThunk(
  'midgard/pollTx',
  async (txTracker: TxTracker) => {
    let txId = txTracker.submitTx?.txID

    if (txId && txId.includes('0x')) {
      txId = txId.slice(2)
    }

    const response = await midgardApi.getActions({
      limit: 1,
      offset: 0,
      txId,
    })
    return response
  },
)

export const pollApprove = createAsyncThunk(
  'midgard/pollApprove',
  async (txTracker: TxTracker) => {
    const assetString = txTracker.submitTx?.inAssets?.[0]?.asset

    if (!assetString) throw Error('invalid asset string')

    const asset = Asset.fromAssetString(assetString)

    if (!asset) throw Error('invalid asset')

    const approved = await multichain.isAssetApproved(asset)

    return {
      asset,
      approved,
    }
  },
)

export const getMimir = createAsyncThunk(
  'thorchain/getThorchainMimir',
  async () => {
    const { data } = await getThorchainMimir()

    return data
  },
)

// get 24h volume
export const getVolume24h = createAsyncThunk(
  'midgard/getVolume24h',
  async () => {
    const { intervals: swapIntervals } = await midgardApi.getSwapHistory({
      query: {
        interval: 'day',
        count: 1,
      },
    })

    const {
      intervals: liquidityIntervals,
    } = await midgardApi.getLiquidityHistory({
      query: {
        interval: 'day',
        count: 1,
      },
    })

    // swap + add + withdraw
    const volume24h =
      Number(swapIntervals[0].totalVolume) +
      Number(liquidityIntervals[0].addLiquidityVolume) +
      Number(liquidityIntervals[0].withdrawVolume)

    return volume24h
  },
)

// get 24h volume
export const getThorchainInboundData = createAsyncThunk(
  'thornode/getInboundData',
  async () => {
    const { data } = await getInboundData()

    return data
  },
)

// get liquidity provider
export const getLiquidityProviderData = createAsyncThunk(
  'thornode/getLiquidityProvider',
  async ({ address, asset }: { asset: string; address: string }) => {
    const { data } = await getLiquidityProvider({ asset, address })

    return data
  },
)
