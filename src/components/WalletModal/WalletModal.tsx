import React, { useCallback, useState, useMemo } from 'react'

import {
  PlusOutlined,
  ImportOutlined,
  ArrowLeftOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { Keystore as KeystoreType } from '@xchainjs/xchain-crypto'
import { WalletStatus } from 'metamask-sdk'

import { useWallet } from 'redux/wallet/hooks'

import { metamask } from 'services/metamask'
import { xdefi } from 'services/xdefi'

import { FolderIcon, MetaMaskLogoIcon, XdefiLogoIcon } from '../Icons'
import { Overlay, Label } from '../UIElements'
import ConnectKeystoreView from './ConnectKeystore'
import CreateKeystoreView from './CreateKeystore'
import PhraseView from './Phrase'
import * as Styled from './WalletModal.style'

enum WalletMode {
  'Keystore' = 'Keystore',
  'Create' = 'Create',
  'Phrase' = 'Phrase',
  'MetaMask' = 'MetaMask',
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

  const metamaskStatus = useMemo(() => metamask.isWalletDetected(), [])
  const xdefiInstalled = useMemo(() => xdefi.isWalletDetected(), [])

  const handleConnect = useCallback(
    async (keystore: KeystoreType, phrase: string) => {
      await unlockWallet(keystore, phrase)

      setIsConnectModalOpen(false)
    },
    [unlockWallet, setIsConnectModalOpen],
  )

  const handleConnectMetaMask = useCallback(async () => {
    if (metamaskStatus === WalletStatus.NoWeb3Provider) {
      window.open('https://metamask.io')
    } else if (metamaskStatus === WalletStatus.XdefiDetected) {
    } else {
    }
  }, [metamaskStatus])

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
        <Styled.ConnectOption onClick={handleConnectMetaMask}>
          {metamaskStatus === WalletStatus.MetaMaskDetected && (
            <Label>Connect MetaMask Wallet</Label>
          )}
          {metamaskStatus === WalletStatus.XdefiDetected && (
            <Label>Uninstall Xdefi Wallet First</Label>
          )}
          {metamaskStatus === WalletStatus.NoWeb3Provider && (
            <Label>Install MetaMask Wallet</Label>
          )}
          <MetaMaskLogoIcon />
        </Styled.ConnectOption>
        <Styled.ConnectOption onClick={handleConnectXDefi}>
          {xdefiInstalled && <Label>Connect Xdefi Wallet</Label>}
          {!xdefiInstalled && <Label>Install Xdefi Wallet</Label>}
          <XdefiLogoIcon className="xdefi-logo" />
        </Styled.ConnectOption>
        <Styled.ConnectOption
          onClick={() => setWalletMode(WalletMode.Keystore)}
        >
          <Label>Connect Keystore</Label>
          <FolderIcon />
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
  }, [
    metamaskStatus,
    xdefiInstalled,
    handleConnectMetaMask,
    handleConnectXDefi,
  ])

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
