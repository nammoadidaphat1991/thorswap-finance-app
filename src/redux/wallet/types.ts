import { Keystore } from '@xchainjs/xchain-crypto'
import { Wallet } from 'multichain-sdk'

import { SupportedChain } from 'multichain-sdk/clients/types'

export type WalletType = 'keystore' | 'xdefi' | null

export interface State {
  walletType: WalletType
  keystore: Keystore | null
  wallet: Wallet | null
  walletLoading: boolean
  chainWalletLoading: { [key in SupportedChain]: boolean }
  isConnectModalOpen: boolean
}
