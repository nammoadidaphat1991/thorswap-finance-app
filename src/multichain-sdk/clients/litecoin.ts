import {
  TxHash,
  Balance,
  TxParams as ClientTxParams,
} from '@xchainjs/xchain-client'
import { Client as LtcClient, Network } from '@xchainjs/xchain-litecoin'
import {
  assetToString,
  baseAmount,
  Chain,
  LTCChain,
} from '@xchainjs/xchain-util'

import { XdefiClient } from '../../xdefi-sdk'
import { AmountType, Amount, Asset, AssetAmount } from '../entities'
import { IClient } from './client'
import { TxParams } from './types'

export interface ILtcChain extends IClient {
  getClient(): LtcClient
}

export class LtcChain implements ILtcChain {
  private balances: AssetAmount[] = []

  private client: LtcClient

  public readonly chain: Chain

  constructor({
    network = 'testnet',
    phrase,
  }: {
    network?: Network
    phrase: string
  }) {
    this.chain = LTCChain
    this.client = new LtcClient({
      network,
      phrase,
    })
  }

  /**
   * get xchain-binance client
   */
  getClient(): LtcClient {
    return this.client
  }

  get balance() {
    return this.balances
  }

  useXdefiWallet = async (xdefiClient: XdefiClient) => {
    if (!xdefiClient) throw Error('xdefi client not found')

    /**
     * 1. load chain provider
     * 2. patch getAddress method
     * 3. patch transfer method
     */
    xdefiClient.loadProvider(LTCChain)

    const address = await xdefiClient.getAddress(LTCChain)
    this.client.getAddress = () => address

    const transfer = async (txParams: ClientTxParams) => {
      const { asset, amount, recipient, memo } = txParams

      if (!asset) throw Error('invalid asset to transfer')

      const txHash = await xdefiClient.transfer({
        asset: assetToString(asset),
        amount: amount.amount().toNumber(),
        decimal: amount.decimal,
        recipient,
        memo,
      })

      return txHash
    }

    this.client.transfer = transfer
  }

  loadBalance = async (): Promise<AssetAmount[]> => {
    try {
      const balances: Balance[] = await this.client.getBalance()

      this.balances = balances.map((data: Balance) => {
        const { asset, amount } = data

        const assetObj = new Asset(asset.chain, asset.symbol)
        const amountObj = new Amount(
          amount.amount(),
          AmountType.BASE_AMOUNT,
          assetObj.decimal,
        )

        return new AssetAmount(assetObj, amountObj)
      })

      return this.balances
    } catch (error) {
      return Promise.reject(error)
    }
  }

  hasAmountInBalance = async (assetAmount: AssetAmount): Promise<boolean> => {
    try {
      await this.loadBalance()

      const assetBalance = this.balances.find((data: AssetAmount) =>
        data.asset.eq(assetAmount.asset),
      )

      if (!assetBalance) return false

      return assetBalance.amount.gte(assetAmount.amount)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getAssetBalance = async (asset: Asset): Promise<AssetAmount> => {
    try {
      await this.loadBalance()

      const assetBalance = this.balances.find((data: AssetAmount) =>
        data.asset.eq(asset),
      )

      if (!assetBalance)
        return new AssetAmount(asset, Amount.fromAssetAmount(0, asset.decimal))

      return assetBalance
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * transfer on binance chain
   * @param {TxParams} tx transfer parameter
   */
  transfer = async (tx: TxParams): Promise<TxHash> => {
    // use xchainjs-client standard internally
    try {
      const {
        assetAmount,
        recipient,
        memo,
        feeRate,
        feeOptionKey = 'average',
      } = tx
      const { asset } = assetAmount
      const amount = baseAmount(assetAmount.amount.baseAmount, asset.decimal)

      const feeRateValue =
        feeRate || (await this.client.getFeeRates())[feeOptionKey]

      return await this.client.transfer({
        asset: asset.getAssetObj(),
        amount,
        recipient,
        memo,
        feeRate: feeRateValue,
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
