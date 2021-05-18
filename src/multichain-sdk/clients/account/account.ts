import {
  BTCChain,
  BNBChain,
  THORChain,
  ETHChain,
  LTCChain,
  BCHChain,
  Chain,
} from '@xchainjs/xchain-util'

import { Asset, AssetAmount, Amount, Pool } from '../../entities'
import { SupportedChain } from '../types'
import { WalletAccount } from './types'
import { Wallet } from './wallet'

/**
 * Account manages multiple connected wallets
 */
export class Account {
  wallets: WalletAccount

  constructor() {
    this.wallets = {
      [BTCChain]: null,
      [BNBChain]: null,
      [THORChain]: null,
      [ETHChain]: null,
      [LTCChain]: null,
      [BCHChain]: null,
    }
  }

  setWallet = (chain: Chain, wallet: Wallet | null) => {
    this.wallets[chain as SupportedChain] = wallet
  }

  getChainWallet = (chain: Chain): Wallet | null => {
    return this.wallets[chain as SupportedChain]
  }

  hasWallet = (chain: Chain): boolean => {
    return !!this.getChainWallet(chain as SupportedChain)
  }

  public static getAssetBalance = (
    account: WalletAccount,
    asset: Asset,
  ): AssetAmount => {
    const emptyAmount = new AssetAmount(
      asset,
      Amount.fromBaseAmount(0, asset.decimal),
    )
    const chainWallet = account[asset.chain as SupportedChain]

    return chainWallet?.getAssetBalance(asset) ?? emptyAmount
  }

  public static getChainAddress = (
    account: WalletAccount,
    chain: Chain,
  ): string | null => {
    const chainWallet = account[chain as SupportedChain]
    return chainWallet?.address ?? null
  }

  public static getWalletAssets = (account: WalletAccount): Asset[] => {
    const assets: Asset[] = []

    if (!account) return assets

    Object.keys(account).map((chain) => {
      const chainWallet = account[chain as SupportedChain]

      if (chainWallet) {
        chainWallet.balance.forEach((data: AssetAmount) => {
          assets.push(data.asset)
        })
      }
    })

    return assets
  }

  public static getInputAssets = ({
    account,
    pools,
  }: {
    account: WalletAccount | null
    pools: Pool[]
  }) => {
    const assets: Asset[] = []

    const poolAssets = pools.map((pool) => pool.asset)
    poolAssets.push(Asset.RUNE())

    if (!account) return poolAssets

    if (pools.length === 0) return []

    Object.keys(account).forEach((chain) => {
      const chainWallet = account[chain as SupportedChain]

      chainWallet?.balance.forEach((data: AssetAmount) => {
        if (poolAssets.find((poolAsset) => poolAsset.eq(data.asset))) {
          assets.push(data.asset)
        }
      })
    })

    return assets
  }

  public static getInputAssetsForAdd = ({
    account,
    pools,
  }: {
    account: WalletAccount | null
    pools: Pool[]
  }) => {
    const assets: Asset[] = []

    const poolAssets = pools.map((pool) => pool.asset)

    if (!account) return poolAssets

    if (pools.length === 0) return []

    Object.keys(account).map((chain) => {
      const chainWallet = account[chain as SupportedChain]

      chainWallet?.balance.forEach((data: AssetAmount) => {
        if (poolAssets.find((poolAsset) => poolAsset.eq(data.asset))) {
          assets.push(data.asset)
        }
      })
    })

    return assets
  }

  public static getNonPoolAssets = ({
    account,
    pools,
  }: {
    account: WalletAccount | null
    pools: Pool[]
  }) => {
    const assets: Asset[] = []

    const poolAssets = pools.map((pool) => pool.asset)
    poolAssets.push(Asset.RUNE())

    if (!account) return poolAssets

    if (pools.length === 0) return []

    Object.keys(account).map((chain) => {
      const chainWallet = account[chain as SupportedChain]

      chainWallet?.balance.forEach((data: AssetAmount) => {
        if (!poolAssets.find((poolAsset) => poolAsset.eq(data.asset))) {
          assets.push(data.asset)
        }
      })
    })

    return assets
  }

  // get BNB.RUNE or ETH.RUNE to upgrade
  public static getRuneToUpgrade = (account: WalletAccount): Asset[] => {
    const runeToUpgrade = []

    const bnbRuneBalance = account.BNB?.balance?.find(
      (assetAmount: AssetAmount) => assetAmount.asset.ticker === 'RUNE',
    )
    const ethRuneBalance = account.ETH?.balance?.find(
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

  // see if there's any rune to upgrade
  public static hasOldRune = (account: WalletAccount): boolean => {
    return Account.getRuneToUpgrade(account).length > 0
  }
}
