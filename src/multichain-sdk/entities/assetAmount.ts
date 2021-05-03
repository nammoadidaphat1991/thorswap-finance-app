import {
  BNBChain,
  BTCChain,
  THORChain,
  ETHChain,
  LTCChain,
  BCHChain,
  Chain,
} from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import invariant from 'tiny-invariant'

import {
  RUNE_THRESHOLD_AMOUNT,
  ETH_THRESHOLD_AMOUNT,
  BNB_THRESHOLD_AMOUNT,
  BTC_THRESHOLD_AMOUNT,
  LTC_THRESHOLD_AMOUNT,
  BCH_THRESHOLD_AMOUNT,
  BN_FORMAT,
} from '../constants'
import { AmountType, Rounding, Amount, IAmount } from './amount'
import { Asset } from './asset'
import { Pool } from './pool'
import { Price } from './price'

export interface IAssetAmount extends IAmount {
  readonly asset: Asset
  readonly amount: Amount

  add(amount: AssetAmount): AssetAmount
  sub(amount: AssetAmount): AssetAmount
  mul(value: BigNumber.Value | Amount): AssetAmount
  div(value: BigNumber.Value | Amount): AssetAmount

  toCurrencyFormat(
    {
      significantDigits,
      format,
      rounding,
    }: {
      significantDigits?: number
      format?: BigNumber.Format
      rounding?: Rounding
    },
    isPrefix?: boolean,
  ): string
  unitPriceIn(asset: Asset, pools: Pool[]): Price
  totalPriceIn(asset: Asset, pools: Pool[]): Price
}

export class AssetAmount extends Amount implements IAssetAmount {
  public readonly asset: Asset

  public readonly amount: Amount

  /**
   * min amount allowed for transfer
   * @param chain asset chain
   * @returns min amount
   */
  public static getMinAmountByChain(chain: Chain): AssetAmount {
    if (chain === BNBChain) {
      return new AssetAmount(
        Asset.BNB(),
        Amount.fromBaseAmount(1, Asset.BNB().decimal),
      )
    }
    // 10001 satoshi
    if (chain === BTCChain) {
      return new AssetAmount(
        Asset.BTC(),
        Amount.fromBaseAmount(10001, Asset.BTC().decimal),
      )
    }
    // 10001 satoshi
    if (chain === LTCChain) {
      return new AssetAmount(
        Asset.LTC(),
        Amount.fromBaseAmount(10001, Asset.LTC().decimal),
      )
    }
    // 10001 satoshi
    if (chain === BCHChain) {
      return new AssetAmount(
        Asset.BCH(),
        Amount.fromBaseAmount(10001, Asset.BCH().decimal),
      )
    }
    // 1 Thor
    if (chain === THORChain) {
      return new AssetAmount(
        Asset.RUNE(),
        Amount.fromBaseAmount(1, Asset.RUNE().decimal),
      )
    }
    // 0 ETH
    if (chain === ETHChain) {
      return new AssetAmount(
        Asset.ETH(),
        Amount.fromBaseAmount(0, Asset.ETH().decimal),
      )
    }

    return new AssetAmount(
      Asset.RUNE(),
      Amount.fromBaseAmount(1, Asset.RUNE().decimal),
    )
  }

  /**
   * min threshold amount for gas purpose
   * @param chain name of asset chain
   * @returns min threshold amount to retain in the balance for gas purpose
   */
  public static getThresholdAmountByChain(chain: Chain): AssetAmount {
    if (chain === BNBChain) {
      return new AssetAmount(
        Asset.BNB(),
        Amount.fromAssetAmount(BNB_THRESHOLD_AMOUNT, Asset.BNB().decimal),
      )
    }

    if (chain === BTCChain) {
      return new AssetAmount(
        Asset.BTC(),
        Amount.fromAssetAmount(BTC_THRESHOLD_AMOUNT, Asset.BTC().decimal),
      )
    }

    if (chain === THORChain) {
      return new AssetAmount(
        Asset.RUNE(),
        Amount.fromAssetAmount(RUNE_THRESHOLD_AMOUNT, Asset.RUNE().decimal),
      )
    }

    if (chain === ETHChain) {
      return new AssetAmount(
        Asset.ETH(),
        Amount.fromAssetAmount(ETH_THRESHOLD_AMOUNT, Asset.ETH().decimal),
      )
    }

    if (chain === LTCChain) {
      return new AssetAmount(
        Asset.LTC(),
        Amount.fromAssetAmount(LTC_THRESHOLD_AMOUNT, Asset.LTC().decimal),
      )
    }

    if (chain === BCHChain) {
      return new AssetAmount(
        Asset.BCH(),
        Amount.fromAssetAmount(BCH_THRESHOLD_AMOUNT, Asset.BCH().decimal),
      )
    }

    return new AssetAmount(
      Asset.RUNE(),
      Amount.fromAssetAmount(1, Asset.RUNE().decimal),
    )
  }

  /**
   * min threshold amount for gas purpose
   * @param chain name of asset chain
   * @returns min threshold amount to retain in the balance for gas purpose
   */
  public static getThresholdAmount = (asset: Asset) => {
    if (asset.isGasAsset()) {
      return AssetAmount.getThresholdAmountByChain(asset.chain)
    }

    return new AssetAmount(asset, Amount.fromAssetAmount(0, asset.decimal))
  }

  constructor(asset: Asset, amount: Amount) {
    super(amount.assetAmount, AmountType.ASSET_AMOUNT, asset.decimal)
    this.asset = asset

    // make sure amount has same decimal as asset
    this.amount = new Amount(
      amount.assetAmount,
      AmountType.ASSET_AMOUNT,
      asset.decimal,
    )
  }

  add(amount: AssetAmount): AssetAmount {
    invariant(this.asset.eq(amount.asset), 'asset must be same')

    return new AssetAmount(this.asset, this.amount.add(amount.amount))
  }

  sub(amount: AssetAmount): AssetAmount {
    invariant(this.asset.eq(amount.asset), 'asset must be same')

    return new AssetAmount(this.asset, this.amount.sub(amount.amount))
  }

  mul(value: BigNumber.Value | Amount): AssetAmount {
    let amount
    if (value instanceof Amount) {
      amount = new Amount(
        this.assetAmount.multipliedBy(value.assetAmount),
        AmountType.ASSET_AMOUNT,
        this.decimal,
      )
    } else {
      amount = new Amount(
        this.assetAmount.multipliedBy(value),
        AmountType.ASSET_AMOUNT,
        this.decimal,
      )
    }

    return new AssetAmount(this.asset, amount)
  }

  div(value: BigNumber.Value | Amount): AssetAmount {
    let amount
    if (value instanceof Amount) {
      amount = new Amount(
        this.assetAmount.dividedBy(value.assetAmount),
        AmountType.ASSET_AMOUNT,
        this.decimal,
      )
    } else {
      amount = new Amount(
        this.assetAmount.dividedBy(value),
        AmountType.ASSET_AMOUNT,
        this.decimal,
      )
    }

    return new AssetAmount(this.asset, amount)
  }

  toCurrencyFormat(
    {
      significantDigits,
      format,
      rounding,
    }: {
      significantDigits?: number
      format?: BigNumber.Format
      rounding?: Rounding
    } = {
      significantDigits: 6,
      format: BN_FORMAT,
      rounding: Rounding.ROUND_DOWN,
    },
    isPrefix = false,
  ): string {
    const significantValue = super.toSignificant(
      significantDigits,
      format,
      rounding,
    )

    if (isPrefix) {
      return `${this.asset.currencySymbol()} ${significantValue}`
    }

    return `${significantValue} ${this.asset.currencySymbol()}`
  }

  unitPriceIn(quoteAsset: Asset, pools: Pool[]): Price {
    return new Price({
      baseAsset: this.asset,
      quoteAsset,
      pools,
    })
  }

  totalPriceIn(quoteAsset: Asset, pools: Pool[]): Price {
    return new Price({
      baseAsset: this.asset,
      quoteAsset,
      pools,
      priceAmount: Amount.fromAssetAmount(this.assetAmount, this.decimal),
    })
  }
}
