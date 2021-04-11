import {
  Chain,
  BNBChain,
  BTCChain,
  ETHChain,
  LTCChain,
  BCHChain,
  THORChain,
} from '@xchainjs/xchain-util'

export const getChainName = (chain: Chain): string => {
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
    return 'ERC20'
  }

  return chain
}
