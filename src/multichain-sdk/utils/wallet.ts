import { Chain } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { Wallet, SupportedChain } from '../clients/types'
import { Asset, AssetAmount, Pool, Amount } from '../entities'

export const getWalletAssets = (wallet: Wallet | null) => {
  const assets: Asset[] = []

  if (!wallet) return assets

  Object.keys(wallet).map((chain) => {
    const chainWallet = wallet[chain as SupportedChain]
    chainWallet.balance.forEach((data: AssetAmount) => {
      assets.push(data.asset)
    })
  })

  return assets
}

export const getInputAssets = ({
  wallet,
  pools,
}: {
  wallet: Wallet | null
  pools: Pool[]
}) => {
  const assets: Asset[] = []

  const poolAssets = pools.map((pool) => pool.asset)
  poolAssets.push(Asset.RUNE())

  if (!wallet) return poolAssets

  if (pools.length === 0) return []

  Object.keys(wallet).map((chain) => {
    const chainWallet = wallet[chain as SupportedChain]
    chainWallet.balance.forEach((data: AssetAmount) => {
      if (poolAssets.find((poolAsset) => poolAsset.eq(data.asset))) {
        assets.push(data.asset)
      }
    })
  })

  return assets
}

export const getInputAssetsForAdd = ({
  wallet,
  pools,
}: {
  wallet: Wallet | null
  pools: Pool[]
}) => {
  const assets: Asset[] = []

  const poolAssets = pools.map((pool) => pool.asset)

  if (!wallet) return poolAssets

  if (pools.length === 0) return []

  Object.keys(wallet).map((chain) => {
    const chainWallet = wallet[chain as SupportedChain]
    chainWallet.balance.forEach((data: AssetAmount) => {
      if (poolAssets.find((poolAsset) => poolAsset.eq(data.asset))) {
        assets.push(data.asset)
      }
    })
  })

  return assets
}

export const getNonPoolAssets = ({
  wallet,
  pools,
}: {
  wallet: Wallet | null
  pools: Pool[]
}) => {
  const assets: Asset[] = []

  const poolAssets = pools.map((pool) => pool.asset)
  poolAssets.push(Asset.RUNE())

  if (!wallet) return poolAssets

  if (pools.length === 0) return []

  Object.keys(wallet).map((chain) => {
    const chainWallet = wallet[chain as SupportedChain]
    chainWallet.balance.forEach((data: AssetAmount) => {
      if (!poolAssets.find((poolAsset) => poolAsset.eq(data.asset))) {
        assets.push(data.asset)
      }
    })
  })

  return assets
}

export const removeAddressPrefix = (address: string): string => {
  const prefixIndex = address.indexOf(':') + 1
  return address.substr(prefixIndex > 0 ? prefixIndex : 0)
}

export const getWalletAddressByChain = (
  wallet: Wallet,
  chain: Chain,
): string | null => {
  if (chain in wallet) {
    const addr = wallet?.[chain as SupportedChain]?.address ?? null

    if (addr) {
      return removeAddressPrefix(addr)
    }
  }

  return null
}

export const getAssetUSDPrice = (asset: Asset, pools: Pool[]): BigNumber => {
  const assetPool = pools.find((pool) => pool.asset.eq(asset))

  if (!assetPool) return new BigNumber(0)

  return new BigNumber(assetPool.detail.assetPriceUSD)
}

export const getAssetBalance = (asset: Asset, wallet: Wallet): AssetAmount => {
  const emptyAmount = new AssetAmount(
    asset,
    Amount.fromBaseAmount(0, asset.decimal),
  )

  if (asset.chain in wallet) {
    const { balance } = wallet?.[asset.chain as SupportedChain]

    return (
      balance.find((assetData: AssetAmount) => {
        return assetData.asset.eq(asset)
      }) || emptyAmount
    )
  }

  return emptyAmount
}

export const getRuneToUpgrade = (wallet: Wallet): Asset[] => {
  const runeToUpgrade = []

  const bnbRuneBalance = wallet?.BNB?.balance?.find(
    (assetAmount: AssetAmount) => assetAmount.asset.ticker === 'RUNE',
  )
  const ethRuneBalance = wallet?.ETH?.balance?.find(
    (assetAmount: AssetAmount) => assetAmount.asset.ticker === 'RUNE',
  )

  if (bnbRuneBalance?.amount.baseAmount.gt(0)) {
    runeToUpgrade.push(bnbRuneBalance.asset)
  }

  if (ethRuneBalance?.amount.baseAmount.gt(0)) {
    runeToUpgrade.push(ethRuneBalance.asset)
  }

  return runeToUpgrade
}

export const hasOldRuneInWallet = (wallet: Wallet): boolean => {
  return getRuneToUpgrade(wallet).length > 0
}

export const getTotalUSDPriceInBalance = (
  balance: AssetAmount[],
  pools: Pool[],
): BigNumber => {
  let total = new BigNumber(0)

  if (!balance.length) return total

  balance.forEach((assetBalance: AssetAmount) => {
    const usdPrice = getAssetUSDPrice(assetBalance.asset, pools)

    total = total.plus(assetBalance.amount.assetAmount.multipliedBy(usdPrice))
  })

  return total
}
