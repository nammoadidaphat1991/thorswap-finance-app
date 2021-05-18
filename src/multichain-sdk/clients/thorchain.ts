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
import { Wallet, WalletOption } from './account'
import { IClient } from './client'
import { TxParams } from './types'

export type DepositParam = {
  assetAmount: AssetAmount
  memo?: string
}

export interface IThorChain extends IClient {
  getClient(): ThorClient
  deposit(tx: DepositParam): Promise<TxHash>
}

export class ThorChain implements IThorChain {
  private client: ThorClient

  public readonly chain: Chain

  public wallet: Wallet | null

  constructor({ network = 'testnet' }: { network?: Network }) {
    this.chain = THORChain
    this.client = new ThorClient({
      network,
    })

    this.wallet = null
  }

  /**
   * get xchain-binance client
   */
  getClient(): ThorClient {
    return this.client
  }

  /**
   * Wallet Management
   */
  connectKeystore = (phrase: string) => {
    this.client = new ThorClient({
      network: this.client.getNetwork(),
      phrase,
    })

    const address = this.client.getAddress()

    // add wallet
    this.wallet = new Wallet({
      address,
      chain: THORChain,
      type: WalletOption.KEYSTORE,
    })
  }

  disconnectKeystore = () => {
    this.client.purgeClient()

    if (this.wallet?.type === WalletOption.KEYSTORE) {
      this.wallet = null
    }
  }

  connectXdefiWallet = async (xdefiClient: XdefiClient) => {
    if (!xdefiClient) throw Error('xdefi client not found')

    /**
     * 1. load chain provider
     * 2. patch getAddress method
     * 3. patch transfer method
     * 4. patch deposit method
     * 5. add wallet
     */

    this.client = new ThorClient({
      network: this.client.getNetwork(),
    })

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

    // add wallet
    this.wallet = new Wallet({
      address,
      chain: THORChain,
      type: WalletOption.XDEFI,
    })
  }

  loadBalance = async (): Promise<Wallet | null> => {
    try {
      const balances: Balance[] = await this.client.getBalance()

      const walletBalances = balances.map((data: Balance) => {
        const { asset, amount } = data

        const assetObj = new Asset(asset.chain, asset.symbol)
        const amountObj = new Amount(
          amount.amount(),
          AmountType.BASE_AMOUNT,
          assetObj.decimal,
        )

        return new AssetAmount(assetObj, amountObj)
      })

      this.wallet?.setBalance(walletBalances)

      return this.wallet
    } catch (error) {
      return Promise.reject(error)
    }
  }

  hasAmountInBalance = async (assetAmount: AssetAmount): Promise<boolean> => {
    try {
      await this.loadBalance()

      const assetBalance = this.wallet?.balance.find((data: AssetAmount) =>
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

      const assetBalance = this.wallet?.balance.find((data: AssetAmount) =>
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
