import React, { useCallback, useMemo, useState } from 'react'

import { ExternalLink } from 'react-feather'

import { CopyOutlined, SyncOutlined, QrcodeOutlined } from '@ant-design/icons'
import { chainToString, Chain } from '@xchainjs/xchain-util'
import copy from 'copy-to-clipboard'
import { WalletOption } from 'multichain-sdk'

import { multichain } from 'services/multichain'

import { QRCodeModal } from '../Modals'
import { CoreButton, Tooltip, Notification, WalletIcon } from '../UIElements'
import * as Styled from './ChainHeader.style'

export type ChainHeaderProps = {
  chain: Chain
  address: string
  totalPrice?: string
  onReload?: () => void
  viewPhrase?: () => void
  walletLoading?: boolean
  walletType: WalletOption
}

type QrCodeData = {
  chain: string
  address: string
}

export const ChainHeader = (props: ChainHeaderProps) => {
  const {
    chain,
    address,
    walletType,
    viewPhrase = () => {},
    onReload,
    walletLoading = false,
  } = props

  const [qrCode, setQrcode] = useState<QrCodeData>()

  const miniAddress = useMemo(
    () => `${address.slice(0, 3)}...${address.slice(-3)}`,
    [address],
  )

  const accountUrl = useMemo(
    () => multichain.getExplorerAddressUrl(chain, address),
    [chain, address],
  )

  const handleCopyAddress = useCallback(() => {
    copy(address)

    Notification({
      type: 'info',
      message: 'Address Copied',
      duration: 3,
      placement: 'bottomRight',
    })
  }, [address])

  const handleViewQRCode = useCallback(
    (text: string) => {
      setQrcode({
        chain: chainToString(chain),
        address: text,
      })
    },
    [chain],
  )

  const handleClickWalletIcon = useCallback(() => {
    if (walletType === WalletOption.KEYSTORE) {
      viewPhrase()
    }
  }, [viewPhrase, walletType])

  return (
    <Styled.Container>
      <Styled.ChainInfo>
        <Tooltip placement="top" tooltip="Reload">
          <CoreButton onClick={onReload}>
            <Styled.ToolWrapper>
              <SyncOutlined spin={walletLoading} />
            </Styled.ToolWrapper>
          </CoreButton>
        </Tooltip>
        <Tooltip
          placement="top"
          tooltip={
            walletType !== WalletOption.KEYSTORE
              ? `${walletType} Connected`
              : 'View Phrase'
          }
        >
          <CoreButton onClick={handleClickWalletIcon}>
            <Styled.WalletType>
              <WalletIcon walletType={walletType} />
            </Styled.WalletType>
          </CoreButton>
        </Tooltip>
        <Styled.InfoLabel weight="bold" color="primary">
          {chainToString(chain)}
        </Styled.InfoLabel>
        {/* <Styled.InfoLabel weight="bold">
          Total: ${totalPrice} USD
        </Styled.InfoLabel> */}
      </Styled.ChainInfo>
      <Styled.Tools>
        <Styled.Address>
          <Tooltip placement="top" tooltip="Copy">
            <CoreButton onClick={handleCopyAddress}>
              <Styled.AddressLabel weight="bold">
                {miniAddress}
              </Styled.AddressLabel>
            </CoreButton>
          </Tooltip>
          <Tooltip placement="top" tooltip="Copy">
            <CoreButton onClick={handleCopyAddress}>
              <CopyOutlined />
            </CoreButton>
          </Tooltip>
          <Tooltip placement="top" tooltip="QRCode">
            <CoreButton onClick={() => handleViewQRCode(address)}>
              <QrcodeOutlined />
            </CoreButton>
          </Tooltip>
        </Styled.Address>
        <Tooltip placement="top" tooltip="Go to account">
          <a href={accountUrl} target="_blank" rel="noopener noreferrer">
            <Styled.ToolWrapper>
              <ExternalLink />
            </Styled.ToolWrapper>
          </a>
        </Tooltip>
      </Styled.Tools>
      <QRCodeModal
        visible={!!qrCode}
        chain={qrCode?.chain ?? ''}
        text={qrCode?.address ?? ''}
        onCancel={() => setQrcode(undefined)}
      />
    </Styled.Container>
  )
}
