import { Asset, getContractAddressFromAsset } from 'multichain-sdk'

import { bnbIcon, nativeRuneIcon } from 'components/Icons'

import { IS_TESTNET } from 'settings/config'
import { assetIconMap } from 'settings/logoData'

export const getAssetIconUrl = (asset: Asset): string => {
  if (asset.isBNB()) {
    return bnbIcon
  }
  if (asset.isRUNE()) {
    return nativeRuneIcon
  }

  if (asset.chain === 'ETH' && asset.ticker !== 'ETH') {
    if (!IS_TESTNET) {
      const contract = getContractAddressFromAsset(asset)
      console.log('contract', contract)
      return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${contract}/logo.png`
    }

    // ethereum logos
    if (asset.ticker === 'WETH') {
      return 'https://assets.coingecko.com/coins/images/2518/large/weth.png'
    }

    if (asset.ticker === 'DAI') {
      return 'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_DAI.svg'
    }

    if (asset.ticker === 'SUSHI') {
      return 'https://etherscan.io/token/images/sushitoken_32.png'
    }
  }

  const logoSymbol = assetIconMap[asset.ticker]

  if (logoSymbol) {
    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/${logoSymbol}/logo.png`
  }

  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/${asset.symbol}/logo.png`
}
