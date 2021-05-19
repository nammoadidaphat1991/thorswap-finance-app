import { Asset, SupportedChain } from 'multichain-sdk'

export const chainToSigAsset = (chain: SupportedChain): Asset => {
  if (chain === 'BCH') return Asset.BCH()
  if (chain === 'BNB') return Asset.BNB()
  if (chain === 'BTC') return Asset.BTC()
  if (chain === 'ETH') return Asset.ETH()
  if (chain === 'LTC') return Asset.LTC()

  // return RUNE by default
  return Asset.RUNE()
}
