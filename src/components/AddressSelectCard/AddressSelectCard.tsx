import React, { useCallback, useMemo, useState } from 'react'

import { ExternalLink } from 'react-feather'

import { CopyOutlined, EditOutlined, LockOutlined } from '@ant-design/icons'
import { Chain } from '@xchainjs/xchain-util'
import copy from 'copy-to-clipboard'
import { capitalize } from 'lodash'
import { SupportedChain } from 'multichain-sdk'

import { useWallet } from 'redux/wallet/hooks'

import { multichain } from 'services/multichain'

import { truncateAddress } from 'helpers/string'

import {
  CoreButton,
  Notification,
  Label,
  Tooltip,
  WalletIcon,
} from '../UIElements'
import * as Styled from './AddressSelectCard.style'

export type Props = {
  title: string
  chain: Chain
  chainAddr: string
  address: string
  onAddressChange: (address: string) => void
}

export const AddressSelectCard: React.FC<Props> = (
  props: Props,
): JSX.Element => {
  const {
    // AssetInput Props
    title,
    address,
    chain,
    chainAddr,
    onAddressChange,
    ...otherProps
  } = props

  const { wallet } = useWallet()
  const [isEditable, setEditable] = useState(false)
  const truncatedAddr = useMemo(
    () => (address ? truncateAddress(address) : ''),
    [address],
  )
  const accountUrl = useMemo(
    () => multichain.getExplorerAddressUrl(chain, address),
    [chain, address],
  )
  const isValidAddress = useMemo(
    () =>
      multichain.validateAddress({
        chain,
        address,
      }),
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

  const handleAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onAddressChange(e.target.value)
    },
    [onAddressChange],
  )

  const renderRecipientIcon = () => {
    if (!address) return <></>

    const walletType = wallet?.[chain as SupportedChain]?.walletType
    if (address === chainAddr && walletType) {
      return (
        <Tooltip placement="top" tooltip={capitalize(walletType as string)}>
          <WalletIcon size={16} walletType={walletType} />
        </Tooltip>
      )
    }

    return <Label>(Edited)</Label>
  }

  return (
    <Styled.CardWrapper {...otherProps}>
      <Styled.CardHeader>
        <Styled.CardTitle>
          <span className="card-title">{title}</span>
          {renderRecipientIcon()}
        </Styled.CardTitle>
        <Styled.ActionWrapper>
          {isEditable ? (
            <Tooltip placement="top" tooltip="Lock">
              <CoreButton onClick={() => setEditable(false)}>
                <LockOutlined />
              </CoreButton>
            </Tooltip>
          ) : (
            <Tooltip placement="top" tooltip="Edit">
              <CoreButton onClick={() => setEditable(true)}>
                <EditOutlined />
              </CoreButton>
            </Tooltip>
          )}
          <Tooltip placement="top" tooltip="Copy">
            <CoreButton onClick={handleCopyAddress}>
              <CopyOutlined />
            </CoreButton>
          </Tooltip>
          <Tooltip placement="top" tooltip="Go to account">
            <a href={accountUrl} target="_blank" rel="noopener noreferrer">
              <Styled.ToolWrapper>
                <ExternalLink />
              </Styled.ToolWrapper>
            </a>
          </Tooltip>
        </Styled.ActionWrapper>
      </Styled.CardHeader>
      <Styled.CardContent>
        <Styled.AddressInput
          sizevalue="big"
          isError={!!address && !isValidAddress}
          value={isEditable ? address : truncatedAddr}
          placeholder="Recipient Address Here"
          onChange={handleAddressChange}
          disabled={!isEditable}
        />
      </Styled.CardContent>
    </Styled.CardWrapper>
  )
}
