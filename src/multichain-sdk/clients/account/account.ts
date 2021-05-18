import { Chain } from '@xchainjs/xchain-util'

import { Wallet } from './wallet'

/**
 * Account manages multiple connected wallets per chain
 */

export class Account {
  chain: Chain

  wallets: Wallet[]

  constructor(chain: Chain) {
    this.chain = chain
    this.wallets = []
  }

  hasConnectedWallet = (): boolean => {
    const wallets = this.wallets.filter((data) => data.connected)

    return wallets?.length > 0
  }

  connectWallet(wallet: Wallet) {
    wallet.activate()
    this.wallets.push(wallet)
  }

  disconnectWallet(wallet: Wallet) {
    this.wallets = this.wallets.map((data: Wallet) => {
      if (data.eq(wallet)) {
        data.disconnect()
      }

      return data
    })
  }
}
