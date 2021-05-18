export type Network = 'testnet' | 'mainnet'

export enum WalletStatus {
  NoWeb3Provider = 0,
  XdefiDetected = 1,
  MetaMaskDetected = 2,
}

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

export type MetaMaskTxParams = {
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
