import { getTradeLimitWithIdentifier } from '../utils/memo'
import { Amount } from './amount'
import { Asset } from './asset'
import { Percent } from './percent'

export class Memo {
  /**
   * Cannot be constructed.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static swapMemo(asset: Asset, address = '', limit?: Amount) {
    const { chain } = asset
    const { symbol } = asset

    const limitString = getTradeLimitWithIdentifier(limit)

    let shortenedSymbol = symbol
    // use shortened asset name for ERC20 tokens
    if (chain === 'ETH' && !asset.isETH()) {
      shortenedSymbol = `${asset.ticker}-${asset.symbol.slice(-3)}`
    }

    return `SWAP:${chain}.${shortenedSymbol}:${address}:${limitString}`
  }

  public static depositMemo(asset: Asset, address = '') {
    const { chain } = asset
    const { symbol } = asset

    return `ADD:${chain}.${symbol}:${address}`
  }

  public static withdrawMemo(
    asset: Asset,
    percent: Percent,
    targetAsset?: Asset,
  ) {
    const { chain } = asset
    const { symbol } = asset

    const target = targetAsset ? `:${targetAsset.toString()}` : ''

    // multiply percent by 100
    return `WITHDRAW:${chain}.${symbol}:${percent
      .mul(100)
      .assetAmount.toNumber()}${target}`
  }

  public static upgradeMemo(address: string) {
    return `SWITCH:${address}`
  }
}
