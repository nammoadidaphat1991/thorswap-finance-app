import React, { useCallback, useState } from 'react'

import { Keystore as KeystoreType } from '@xchainjs/xchain-crypto'

import { useWallet } from 'redux/wallet/hooks'

import { Overlay } from '../UIElements'
import ConnectKeystoreView from './ConnectKeystore'
import CreateKeystoreView from './CreateKeystore'
import PhraseView from './Phrase'
import * as Styled from './WalletModal.style'

enum WalletMode {
  'Keystore' = 'Keystore',
  'Create' = 'Create',
  'Phrase' = 'Phrase',
}

const WalletModal = () => {
  const [walletMode, setWalletMode] = useState<WalletMode>(WalletMode.Keystore)

  const {
    unlockWallet,
    setIsConnectModalOpen,
    isConnectModalOpen,
    walletLoading,
  } = useWallet()

  const handleConnect = useCallback(
    async (keystore: KeystoreType, phrase: string) => {
      await unlockWallet(keystore, phrase)

      setIsConnectModalOpen(false)
    },
    [unlockWallet, setIsConnectModalOpen],
  )

  return (
    <Overlay
      isOpen={isConnectModalOpen}
      onDismiss={() => setIsConnectModalOpen(false)}
    >
      <Styled.ConnectContainer>
        {walletMode === WalletMode.Keystore && (
          <ConnectKeystoreView
            onConnect={handleConnect}
            onCreate={() => setWalletMode(WalletMode.Create)}
            onPhraseImport={() => setWalletMode(WalletMode.Phrase)}
            loading={walletLoading}
          />
        )}
        {walletMode === WalletMode.Create && (
          <CreateKeystoreView
            onConnect={handleConnect}
            onKeystore={() => setWalletMode(WalletMode.Keystore)}
            onPhraseImport={() => setWalletMode(WalletMode.Phrase)}
          />
        )}
        {walletMode === WalletMode.Phrase && (
          <PhraseView
            onConnect={() => {}}
            onCreate={() => setWalletMode(WalletMode.Create)}
            onKeystore={() => setWalletMode(WalletMode.Keystore)}
          />
        )}
      </Styled.ConnectContainer>
    </Overlay>
  )
}

export default WalletModal
