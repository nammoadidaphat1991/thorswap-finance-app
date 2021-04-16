import { MULTICHAIN_DECIMAL } from 'multichain-sdk/constants'

import { Amount } from './amount'
import { Percent } from './percent'
import { Pool } from './pool'

export type WithdrawAmount = {
  runeAmount: Amount
  assetAmount: Amount
}

export interface ILiquidity {
  readonly pool: Pool
  readonly poolUnits: Amount
  readonly liquidityUnits: Amount

  poolShare: Percent
  assetShare: Amount
  runeShare: Amount

  getLiquidityUnits(runeAddAmount: Amount, assetAddAmount: Amount): Amount
  getLiquiditySlip(runeAddAmount: Amount, assetAddAmount: Amount): Percent
  getSymWithdrawAmount(percent: Percent): WithdrawAmount

  getAsymRuneShare(): Amount
  getAsymAssetShare(): Amount
  getAsymRuneWithdrawAmount(percent: Percent): Amount
  getAsymAssetWithdrawAmount(percent: Percent): Amount
}

export class Liquidity implements ILiquidity {
  public readonly pool: Pool

  public readonly poolUnits: Amount

  public readonly liquidityUnits: Amount

  constructor(pool: Pool, liquidityUnits: Amount) {
    this.pool = pool
    this.poolUnits = Amount.fromBaseAmount(
      pool.detail.units,
      MULTICHAIN_DECIMAL,
    )
    this.liquidityUnits = liquidityUnits
  }

  public get poolShare(): Percent {
    // formula: liquidity Units / total Units
    return new Percent(this.liquidityUnits.div(this.poolUnits).assetAmount)
  }

  public get assetShare(): Amount {
    // formula: Total Balance * liquidity Units / total Units
    return this.pool.assetDepth.mul(this.liquidityUnits).div(this.poolUnits)
  }

  public get runeShare(): Amount {
    // formula: Total Balance * liquidity Units / total Units
    return this.pool.runeDepth.mul(this.liquidityUnits).div(this.poolUnits)
  }

  /**
   * get estimated pool share after adding a liquidity
   * @param runeAddAmount rune amount to add
   * @param assetAddAmount asset amount to add
   * @returns percent object for estimated pool share
   */
  getPoolShareEst(runeAddAmount: Amount, assetAddAmount: Amount): Percent {
    // get LP units after add
    const estimatedLiquidityUnits = this.liquidityUnits.add(
      this.getLiquidityUnits(runeAddAmount, assetAddAmount),
    )

    // get pool units after add
    const newPoolUnits = this.poolUnits.add(estimatedLiquidityUnits)

    return new Percent(estimatedLiquidityUnits.div(newPoolUnits).assetAmount)
  }

  /**
   * get liquidity units after liquidity is added to the pool
   *
   * @param runeAddAmount rune amount to add
   * @param assetAddAmount asset amount to add
   */
  getLiquidityUnits(runeAddAmount: Amount, assetAddAmount: Amount): Amount {
    // formula: ((R + T) (r T + R t))/(4 R T)
    const R = this.pool.runeDepth.add(runeAddAmount) // Must add r first
    const T = this.pool.assetDepth.add(assetAddAmount) // Must add t first
    const part1 = R.add(T)
    const part2 = runeAddAmount.mul(T)
    const part3 = R.mul(assetAddAmount)
    const numerator = part1.mul(part2.add(part3))
    const denominator = R.mul(T).mul(4)

    return numerator.div(denominator)
  }

  /**
   * get slip for add liquidity
   *
   * @param runeAddAmount rune amount to add
   * @param assetAddAmount asset amount to add
   */
  getLiquiditySlip(runeAddAmount: Amount, assetAddAmount: Amount): Percent {
    // formula: (t * R - T * r)/ (T*r + R*T)
    const R = this.pool.runeDepth
    const T = this.pool.assetDepth
    const numerator = assetAddAmount.mul(R).sub(T.mul(runeAddAmount))
    const denominator = T.mul(runeAddAmount).add(R.mul(T))

    // set absolute value of percentage, no negative allowed
    return new Percent(numerator.div(denominator).assetAmount.absoluteValue())
  }

  getSymWithdrawAmount(percent: Percent): WithdrawAmount {
    const runeAmount = this.runeShare.mul(percent)
    const assetAmount = this.assetShare.mul(percent)

    return {
      runeAmount,
      assetAmount,
    }
  }

  /**
   *  Ref: https://gitlab.com/thorchain/thornode/-/issues/657
   *  share = (s * A * (2 * T^2 - 2 * T * s + s^2))/T^3
   *  s = stakeUnits for member (after factoring in withdrawBasisPoints)
   *  T = totalPoolUnits for pool
   *  A = assetDepth to be withdrawn
   *
   *  Formula:
   *  share = (s * A * (2 * T^2 - 2 * T * s + s^2))/T^3
   *  (part1 * (part2 - part3 + part4)) / part5
   */
  getAsymRuneShare(): Amount {
    const s = this.liquidityUnits
    const T = this.poolUnits
    const A = this.pool.runeDepth

    const part1 = s.mul(A)
    const part2 = T.mul(T).mul(2)
    const part3 = T.mul(s).mul(2)
    const part4 = s.mul(s)
    const numerator = part1.mul(part2.sub(part3).add(part4))
    const part5 = T.mul(T).mul(T)

    const amount = numerator.div(part5)

    return amount
  }

  getAsymAssetShare(): Amount {
    const s = this.liquidityUnits
    const T = this.poolUnits
    const A = this.pool.assetDepth

    const part1 = s.mul(A)
    const part2 = T.mul(T).mul(2)
    const part3 = T.mul(s).mul(2)
    const part4 = s.mul(s)
    const numerator = part1.mul(part2.sub(part3).add(part4))
    const part5 = T.mul(T).mul(T)

    const amount = numerator.div(part5)

    return amount
  }

  getAsymRuneWithdrawAmount(percent: Percent): Amount {
    return this.getAsymRuneShare().mul(percent)
  }

  getAsymAssetWithdrawAmount(percent: Percent): Amount {
    return this.getAsymAssetShare().mul(percent)
  }
}
