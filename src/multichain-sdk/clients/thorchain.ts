import {
  TxParams as ClientTxParams,
  TxHash,
  Balance,
  Network,
} from '@xchainjs/xchain-client'
import {
  Client as ThorClient,
  DepositParam as ClientDepositParam,
} from '@xchainjs/xchain-thorchain'
import {
  assetToString,
  baseAmount,
  Chain,
  THORChain,
} from '@xchainjs/xchain-util'

import { XdefiClient } from '../../xdefi-sdk'
import {
  INSUFFICIENT_RUNE_THRESHOLD_AMOUNT_ERROR,
  INVALID_MEMO_ERROR,
  RUNE_THRESHOLD_AMOUNT,
} from '../constants'
import { AmountType, Amount, Asset, AssetAmount } from '../entities'
import { IClient } from './client'
import { TxParams, WalletOption } from './types'

export type DepositParam = {
  assetAmount: AssetAmount
  memo?: string
}

export interface IThorChain extends IClient {
  getClient(): ThorClient
  deposit(tx: DepositParam): Promise<TxHash>
}

export class ThorChain implements IThorChain {
  private balances: AssetAmount[] = []

  private client: ThorClient

  public readonly chain: Chain

  public walletType: WalletOption | null

  constructor({ network = 'testnet' }: { network?: Network }) {
    this.chain = THORChain
    this.client = new ThorClient({
      network,
    })

    this.walletType = null
  }

  /**
   * get xchain-binance client
   */
  getClient(): ThorClient {
    return this.client
  }

  get balance() {
    return this.balances
  }

  connectKeystore = (phrase: string) => {
    this.client = new ThorClient({
      network: this.client.getNetwork(),
      phrase,
    })
    this.walletType = WalletOption.KEYSTORE
  }

  disconnect = () => {
    this.client.purgeClient()
    this.walletType = null
  }

  connectXdefiWallet = async (xdefiClient: XdefiClient) => {
    if (!xdefiClient) throw Error('xdefi client not found')

    /**
     * 1. load chain provider
     * 2. patch getAddress method
     * 3. patch transfer method
     * 4. patch deposit method
     */
    xdefiClient.loadProvider(THORChain)

    const address = await xdefiClient.getAddress(THORChain)
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

    const deposit = async (txParams: ClientDepositParam) => {
      const { asset, amount, memo } = txParams

      if (!asset) throw Error('invalid asset to deposit')

      const txHash = await xdefiClient.depositTHOR({
        asset: assetToString(asset),
        amount: amount.amount().toNumber(),
        decimal: amount.decimal,
        recipient: '',
        memo,
      })

      return txHash
    }
    this.client.deposit = deposit

    this.walletType = WalletOption.XDEFI
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

      console.log('assetbalance', assetBalance?.amount.toFixed())
      console.log('assetbalance', assetAmount?.amount.toFixed())

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
      const { assetAmount, recipient, memo } = tx
      const { asset } = assetAmount
      const amount = baseAmount(assetAmount.amount.baseAmount, asset.decimal)

      const res = await this.client.transfer({
        asset: asset.getAssetObj(),
        amount,
        recipient,
        memo,
      })

      return res
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async deposit(tx: DepositParam): Promise<TxHash> {
    try {
      const { assetAmount, memo } = tx
      const { asset } = assetAmount
      const amount = baseAmount(assetAmount.amount.baseAmount, asset.decimal)

      if (!memo) throw new Error(INVALID_MEMO_ERROR)

      // Note: retain RUNE threshold amount for gas purpose
      const hasThresholdAmount = await this.hasAmountInBalance(
        new AssetAmount(
          Asset.RUNE(),
          Amount.fromAssetAmount(RUNE_THRESHOLD_AMOUNT, Asset.RUNE().decimal),
        ),
      )

      if (!hasThresholdAmount) {
        throw new Error(INSUFFICIENT_RUNE_THRESHOLD_AMOUNT_ERROR)
      }

      const res = await this.client.deposit({
        asset: asset.getAssetObj(),
        amount,
        memo,
      })

      return res
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
