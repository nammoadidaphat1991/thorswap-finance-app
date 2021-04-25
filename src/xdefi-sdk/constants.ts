export const BTCChain = 'BTC'
export const BNBChain = 'BTC'
export const THORChain = 'BTC'
export const ETHChain = 'BTC'
export const LTCChain = 'BTC'
export const BCHChain = 'BTC'

export type Provider = {
  title: string
  providerPath: string
}

export const providersList: Provider[] = [
  {
    title: 'Ethereum Provider',
    providerPath: 'ethereum',
  },
  {
    title: 'Bitcoin Provider',
    providerPath: 'xfi.bitcoin',
  },
  {
    title: 'BinanceDEX Provider',
    providerPath: 'xfi.binance',
  },
  {
    title: 'BitcoinCash Provider',
    providerPath: 'xfi.bitcoincash',
  },
  {
    title: 'LiteCoin Provider',
    providerPath: 'xfi.litecoin',
  },
  {
    title: 'Thorchain Provider',
    providerPath: 'xfi.thorchain',
  },
]

export const THORCHAIN_POOL_ADDRESS = ''
