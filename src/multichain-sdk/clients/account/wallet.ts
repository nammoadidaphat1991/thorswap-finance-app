import { Chain } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { AssetAmount, Asset, Pool, Amount } from '../../entities'
import { WalletType } from './types'
import { getAssetValueInUSD } from './utils'

/**
 * Wallet Class manages connected wallet for specific chain
 */
export interface IWallet {
  chain: Chain
  type: WalletType
  connected: boolean
  active: boolean
  address: string
  balance: AssetAmount[]

  setBalance(balance: AssetAmount[]): void
  disconnect(): void

  activate(): void
  deactivate(): void

  eq(wallet: Wallet): boolean

  removeAddressPrefix(address: string): string

  getWalletAssets(): Asset[]
  getInputAssetsForSwap(pools: Pool[]): Asset[]
  getInputAssetsForDeposit(pools: Pool[]): Asset[]
  getInputAssetsForCreate(pools: Pool[]): Asset[]
  getAssetBalance(asset: Asset): AssetAmount
  getAssetAmountInUSD(asset: Asset, pools: Pool[]): BigNumber
  getTotalBalanceInUSD(pools: Pool[]): BigNumber
}

export class Wallet implements IWallet {
  chain: Chain

  type: WalletType

  connected: boolean

  active: boolean

  address: string

  balance: AssetAmount[]

  constructor({
    chain,
    type,
    connected,
    address,
    active = false,
  }: {
    chain: Chain
    type: WalletType
    connected: boolean
    address: string
    active?: boolean
  }) {
    this.chain = chain
    this.type = type
    this.connected = connected
    this.active = active

    // remove asset prefix(:) eg: bitcoincash:xxxxx -> xxxxx
    this.address = this.removeAddressPrefix(address)
    this.balance = []
  }

  setBalance = (balance: AssetAmount[]) => {
    this.balance = balance
  }

  activate = () => {
    this.active = true
  }

  deactivate = () => {
    this.active = false
  }

  disconnect = () => {
    this.connected = false
    this.balance = []
  }

  eq = (wallet: Wallet): boolean => {
    if (this.type === wallet.type && this.address === wallet.address) {
      return true
    }

    return false
  }

  getWalletAssets = (): Asset[] => {
    return this.balance.map((balance: AssetAmount) => balance.asset)
  }

  getInputAssetsForSwap = (pools: Pool[]): Asset[] => {
    const poolAssets = pools.map((pool) => pool.asset)

    // Add RUNE to pool assets since RUNE is available for swap but not pool asset
    poolAssets.push(Asset.RUNE())

    return this.balance.reduce((res: Asset[], assetBalance: AssetAmount) => {
      if (poolAssets.find((poolAsset) => poolAsset.eq(assetBalance.asset))) {
        res.push(assetBalance.asset)
      }

      return res
    }, [])
  }

  getInputAssetsForDeposit = (pools: Pool[]): Asset[] => {
    const poolAssets = pools.map((pool) => pool.asset)

    // search only pool assets in the balance
    return this.balance.reduce((res: Asset[], assetBalance: AssetAmount) => {
      if (poolAssets.find((poolAsset) => poolAsset.eq(assetBalance.asset))) {
        res.push(assetBalance.asset)
      }

      return res
    }, [])
  }

  getInputAssetsForCreate = (pools: Pool[]): Asset[] => {
    const poolAssets = pools.map((pool) => pool.asset)
    poolAssets.push(Asset.RUNE())

    // find only non-pool assets that are available for creating a new pool
    return this.balance.reduce((res: Asset[], assetBalance: AssetAmount) => {
      if (!poolAssets.find((poolAsset) => poolAsset.eq(assetBalance.asset))) {
        res.push(assetBalance.asset)
      }

      return res
    }, [])
  }

  removeAddressPrefix = (address: string): string => {
    const prefixIndex = address.indexOf(':') + 1
    return address.substr(prefixIndex > 0 ? prefixIndex : 0)
  }

  getAssetBalance = (asset: Asset): AssetAmount => {
    const emptyAmount = new AssetAmount(
      asset,
      Amount.fromBaseAmount(0, asset.decimal),
    )

    return (
      this.balance.find((assetData: AssetAmount) => {
        return assetData.asset.eq(asset)
      }) || emptyAmount
    )
  }

  getAssetAmountInUSD = (asset: Asset, pools: Pool[]): BigNumber => {
    const usdPrice = getAssetValueInUSD(asset, pools)

    return this.getAssetBalance(asset).assetAmount.multipliedBy(usdPrice)
  }

  // get total wallet value in usd given pool data
  getTotalBalanceInUSD = (pools: Pool[]): BigNumber => {
    let total = new BigNumber(0)

    if (!this.balance.length) return total

    this.balance.forEach((assetBalance: AssetAmount) => {
      const usdPrice = getAssetValueInUSD(assetBalance.asset, pools)

      total = total.plus(assetBalance.amount.assetAmount.multipliedBy(usdPrice))
    })

    return total
  }
}
