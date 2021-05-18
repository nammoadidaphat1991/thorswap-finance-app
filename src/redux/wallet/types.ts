import { Keystore } from '@xchainjs/xchain-crypto'
import { WalletAccount } from 'multichain-sdk'

import { SupportedChain } from 'multichain-sdk/clients/types'

export interface State {
  accountType: 'keystore' | 'xdefi' | null
  keystore: Keystore | null
  account: WalletAccount | null
  accountLoading: boolean
  chainWalletLoading: { [key in SupportedChain]: boolean }
  isConnectModalOpen: boolean
}
