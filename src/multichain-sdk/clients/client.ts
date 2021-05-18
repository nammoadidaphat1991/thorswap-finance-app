import { TxHash } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'

import { Asset, AssetAmount } from '../entities'
import { Wallet } from './account'
import { TxParams } from './types'

export interface IClient {
  chain: Chain

  loadBalance(): Promise<Wallet | null>
  hasAmountInBalance(assetAmount: AssetAmount): Promise<boolean>
  getAssetBalance(asset: Asset): Promise<AssetAmount>

  transfer(tx: TxParams): Promise<TxHash>
}
