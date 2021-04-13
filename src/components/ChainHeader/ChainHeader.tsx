import React, { useCallback, useMemo, useState } from 'react'

import { ExternalLink } from 'react-feather'

import { CopyOutlined, SyncOutlined, QrcodeOutlined } from '@ant-design/icons'
import { chainToString, Chain } from '@xchainjs/xchain-util'
import copy from 'copy-to-clipboard'

import { multichain } from 'services/multichain'

import { QRCodeModal } from '../Modals'
import { CoreButton, Tooltip } from '../UIElements'
import * as Styled from './ChainHeader.style'

export type ChainHeaderProps = {
  chain: Chain
  address: string
  totalPrice?: string
  onReload?: () => void
  walletLoading?: boolean
}

type QrCodeData = {
  chain: string
  address: string
}

export const ChainHeader = (props: ChainHeaderProps) => {
  const { chain, address, onReload, walletLoading = false } = props

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

  return (
    <Styled.Container>
      <Styled.ChainInfo>
        <Styled.InfoLabel weight="bold" color="primary">
          {chainToString(chain)}
        </Styled.InfoLabel>
        <Tooltip placement="top" tooltip="Reload">
          <CoreButton onClick={onReload}>
            <Styled.ToolWrapper>
              <SyncOutlined spin={walletLoading} />
            </Styled.ToolWrapper>
          </CoreButton>
        </Tooltip>
        {/* <Styled.InfoLabel weight="bold">
          Total: ${totalPrice} USD
        </Styled.InfoLabel> */}
      </Styled.ChainInfo>
      <Styled.Address onClick={handleCopyAddress}>
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
      <Styled.Tools>
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
