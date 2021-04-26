import React, { useCallback, useState, useMemo } from 'react'

import {
  FolderOpenOutlined,
  PlusOutlined,
  ImportOutlined,
  ArrowLeftOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { Keystore as KeystoreType } from '@xchainjs/xchain-crypto'

import { useWallet } from 'redux/wallet/hooks'

import { xdefi } from 'services/xdefi'

import { XdefiLogoIcon } from '../Icons'
import { Overlay, Label } from '../UIElements'
import ConnectKeystoreView from './ConnectKeystore'
import CreateKeystoreView from './CreateKeystore'
import PhraseView from './Phrase'
import * as Styled from './WalletModal.style'

enum WalletMode {
  'Keystore' = 'Keystore',
  'Create' = 'Create',
  'Phrase' = 'Phrase',
  'XDefi' = 'XDefi',
  'Select' = 'Select',
}

const WalletModal = () => {
  const [walletMode, setWalletMode] = useState<WalletMode>(WalletMode.Select)

  const {
    unlockWallet,
    connectXdefiWallet,
    setIsConnectModalOpen,
    isConnectModalOpen,
    walletLoading,
  } = useWallet()

  const xdefiInstalled = useMemo(() => xdefi.isWalletDetected(), [])

  const handleConnect = useCallback(
    async (keystore: KeystoreType, phrase: string) => {
      await unlockWallet(keystore, phrase)

      setIsConnectModalOpen(false)
    },
    [unlockWallet, setIsConnectModalOpen],
  )

  const handleConnectXDefi = useCallback(async () => {
    if (!xdefiInstalled) {
      window.open('https://xdefi.io')
    } else {
      try {
        await connectXdefiWallet()
      } catch (error) {
        console.log(error)
      }
      setIsConnectModalOpen(false)
    }
  }, [xdefiInstalled, connectXdefiWallet, setIsConnectModalOpen])

  const renderMainPanel = useMemo(() => {
    return (
      <Styled.MainPanel>
        <Styled.ConnectOption onClick={handleConnectXDefi}>
          {xdefiInstalled && <Label>Connect Xdefi Wallet</Label>}
          {!xdefiInstalled && <Label>Install Xdefi Wallet</Label>}
          <XdefiLogoIcon />
        </Styled.ConnectOption>
        <Styled.ConnectOption
          onClick={() => setWalletMode(WalletMode.Keystore)}
        >
          <Label>Connect Keystore</Label>
          <FolderOpenOutlined />
        </Styled.ConnectOption>
        <Styled.ConnectOption onClick={() => setWalletMode(WalletMode.Create)}>
          <Label>Create Keystore</Label>
          <PlusOutlined />
        </Styled.ConnectOption>
        <Styled.ConnectOption onClick={() => setWalletMode(WalletMode.Phrase)}>
          <Label>Import Phrase</Label>
          <ImportOutlined />
        </Styled.ConnectOption>
      </Styled.MainPanel>
    )
  }, [handleConnectXDefi, xdefiInstalled])

  return (
    <Overlay
      isOpen={isConnectModalOpen}
      onDismiss={() => setIsConnectModalOpen(false)}
    >
      <Styled.ConnectContainer>
        {walletMode !== WalletMode.Select && (
          <Styled.ModalHeader>
            <Styled.ActionButton
              onClick={() => setWalletMode(WalletMode.Select)}
            >
              <ArrowLeftOutlined />
            </Styled.ActionButton>
            <Styled.ActionButton onClick={() => setIsConnectModalOpen(false)}>
              <CloseOutlined />
            </Styled.ActionButton>
          </Styled.ModalHeader>
        )}
        {walletMode === WalletMode.Select && renderMainPanel}
        {walletMode === WalletMode.Keystore && (
          <ConnectKeystoreView
            onConnect={handleConnect}
            onCreate={() => setWalletMode(WalletMode.Create)}
            loading={walletLoading}
          />
        )}
        {walletMode === WalletMode.Create && (
          <CreateKeystoreView
            onConnect={handleConnect}
            onKeystore={() => setWalletMode(WalletMode.Keystore)}
          />
        )}
        {walletMode === WalletMode.Phrase && (
          <PhraseView
            onConnect={() => {}}
            onCreate={() => setWalletMode(WalletMode.Create)}
          />
        )}
      </Styled.ConnectContainer>
    </Overlay>
  )
}

export default WalletModal
