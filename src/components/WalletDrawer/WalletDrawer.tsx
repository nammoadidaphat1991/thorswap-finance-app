import React, { useCallback, useState } from 'react'

import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router'

import { SyncOutlined, EyeOutlined } from '@ant-design/icons'
import { SupportedChain, Asset } from 'multichain-sdk'

import { useWallet } from 'redux/wallet/hooks'

import { getSendRoute } from 'settings/constants'

import { BalanceView } from '../BalanceView'
import { PhraseModal } from '../Modals'
import { CoreButton } from '../UIElements/CoreButton'
import { Label } from '../UIElements/Label'
import { Drawer } from './WalletDrawer.style'
import * as Styled from './WalletDrawer.style'

export type WalletDrawerProps = {
  visible: boolean
  onClose?: () => void
}

export const WalletDrawer = (props: WalletDrawerProps) => {
  const { visible, onClose = () => {} } = props

  const [showPhraseModal, setShowPhraseModal] = useState(false)

  const history = useHistory()
  const dispatch = useDispatch()

  const {
    loadAllWallets,
    getWalletByChain,
    walletLoading,
    wallet,
    chainWalletLoading,
    walletType,
    disconnectWallet,
  } = useWallet()

  const handleRefresh = useCallback(() => {
    if (wallet) {
      dispatch(loadAllWallets())
    }
  }, [wallet, loadAllWallets, dispatch])

  const handleReloadChain = useCallback(
    (chain: SupportedChain) => {
      if (wallet) {
        dispatch(getWalletByChain(chain))
      }
    },
    [wallet, dispatch, getWalletByChain],
  )

  const handleSendAsset = useCallback(
    (asset: Asset) => {
      history.push(getSendRoute(asset))
    },
    [history],
  )

  return (
    <Drawer
      visible={visible}
      onClose={onClose}
      placement="right"
      maskStyle={{ opacity: 0, zIndex: 0 }}
      closable={false}
      width={350}
    >
      <Styled.ActionHeader>
        {(wallet || walletLoading) && (
          <Styled.Refresh onClick={handleRefresh}>
            <SyncOutlined spin={walletLoading} />
          </Styled.Refresh>
        )}
        {wallet && (
          <Styled.HeaderAction>
            {walletType === 'keystore' && (
              <CoreButton onClick={() => setShowPhraseModal(true)}>
                <EyeOutlined />
                <Label size="big" color="primary">
                  Phrase
                </Label>
              </CoreButton>
            )}
            <CoreButton onClick={disconnectWallet}>
              <Label size="big" color="warning">
                Disconnect
              </Label>
            </CoreButton>
          </Styled.HeaderAction>
        )}
      </Styled.ActionHeader>

      {!wallet && !walletLoading && (
        <Styled.WarningLabel>Please connect wallet.</Styled.WarningLabel>
      )}
      {wallet && (
        <BalanceView
          wallet={wallet}
          chainWalletLoading={chainWalletLoading}
          onReloadChain={handleReloadChain}
          onSendAsset={handleSendAsset}
        />
      )}
      {wallet && (
        <PhraseModal
          visible={showPhraseModal}
          onCancel={() => setShowPhraseModal(false)}
        />
      )}
    </Drawer>
  )
}
