import {
  BTCChain,
  BNBChain,
  THORChain,
  ETHChain,
  LTCChain,
  BCHChain,
} from './constants'

export type Network = 'testnet' | 'mainnet'

// note only supported chains
export const supportedChains = [
  BTCChain,
  BNBChain,
  THORChain,
  ETHChain,
  LTCChain,
  BCHChain,
] as const
export type SupportedChain = typeof supportedChains[number]

export type TxParams = {
  asset: string // BNB.RUNE-B1A, BTC.BTC, ETH.USDT-0xffffff
  amount: number
  decimal: number
  recipient: string
  memo?: string
}

export type Asset = {
  chain: string
  symbol: string
  ticker: string
}

export type XdefiTxParams = {
  from: string
  recipient: string
  feeRate?: number
  asset: Asset
  amount: {
    amount: number
    decimals: number
  }
  memo?: string
}
