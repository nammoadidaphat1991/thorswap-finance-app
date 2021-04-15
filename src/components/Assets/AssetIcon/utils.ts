import { Asset } from 'multichain-sdk'

import { bnbIcon, nativeRuneIcon } from 'components/Icons'

import { assetIconMap } from 'settings/logoData'

export const getAssetIconUrl = (asset: Asset): string => {
  if (asset.isBNB()) {
    return bnbIcon
  }
  if (asset.isRUNE()) {
    return nativeRuneIcon
  }

  // ethereum logos
  if (asset.ticker === 'WETH') {
    return 'https://assets.coingecko.com/coins/images/2518/large/weth.png'
  }

  if (asset.ticker === 'DAI') {
    return 'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_DAI.svg'
  }

  if (asset.ticker === 'SUSHI') {
    return 'https://assets.coingecko.com/coins/images/12271/thumb/512x512_Logo_no_chop.png'
  }

  if (asset.ticker === 'AAVE') {
    return 'https://assets.coingecko.com/coins/images/12645/thumb/AAVE.png'
  }

  if (asset.ticker === 'YFI') {
    return 'https://assets.coingecko.com/coins/images/11849/thumb/yfi-192x192.png'
  }

  if (asset.ticker === 'ALPHA') {
    return 'https://etherscan.io/token/images/alpha_32.png'
  }

  if (asset.ticker === 'SNX') {
    return 'https://etherscan.io/token/images/snx_32.png'
  }

  if (asset.ticker === 'PERP') {
    return 'https://etherscan.io/token/images/perpetual_32.png'
  }

  if (asset.ticker === 'CREAM') {
    return 'https://etherscan.io/token/images/CreamFinance_32.png'
  }

  if (asset.ticker === 'DNA') {
    return 'https://etherscan.io/token/images/encrypgen2_28.png'
  }

  if (asset.ticker === 'TVK') {
    return 'https://etherscan.io/token/images/terravirtua_32.png'
  }

  const logoSymbol = assetIconMap[asset.ticker]

  if (logoSymbol) {
    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/${logoSymbol}/logo.png`
  }

  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/${asset.symbol}/logo.png`
}
