import {
  Chain,
  BNBChain,
  BTCChain,
  ETHChain,
  LTCChain,
  BCHChain,
  THORChain,
} from '@xchainjs/xchain-util'

export const getChainName = (chain: Chain, ticker: string): string => {
  if (
    chain === BTCChain ||
    chain === LTCChain ||
    chain === BCHChain ||
    chain === THORChain
  ) {
    return 'Native'
  }

  if (chain === BNBChain) {
    return 'BEP2'
  }

  if (chain === ETHChain) {
    if (ticker === 'ETH') return 'Native'

    return 'ERC20'
  }

  return chain
}

export const getAssetName = (chain: Chain, ticker: string): string => {
  if (chain === BTCChain) return 'Bitcoin'
  if (chain === LTCChain) return 'Litecoin'
  if (chain === BCHChain) return 'Bitcoin Cash'

  if (chain === ETHChain && ticker === 'ETH') {
    return 'Ethereum'
  }

  return ticker
}
