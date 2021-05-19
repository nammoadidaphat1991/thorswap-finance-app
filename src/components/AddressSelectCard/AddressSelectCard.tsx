import React, { useCallback, useMemo, useState } from 'react'

import { ExternalLink } from 'react-feather'

import { CopyOutlined, EditOutlined, LockOutlined } from '@ant-design/icons'
import { Chain } from '@xchainjs/xchain-util'
import {
  CoreButton,
  Notification,
  Label,
  Tooltip,
  WalletIcon,
} from 'components'
import copy from 'copy-to-clipboard'
import { capitalize } from 'lodash'

import { useWallet } from 'redux/wallet/hooks'

import { multichain } from 'services/multichain'

import { truncateAddress } from 'helpers/string'

import {
  CardWrapper,
  CardHeader,
  CardTitle,
  CardContent,
  AddressInput,
  ActionWrapper,
  ToolWrapper,
} from './AddressSelectCard.style'

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

  const { walletType } = useWallet()
  const [isEditable, setEditable] = useState(false)
  const truncatedAddr = useMemo(
    () => (address ? truncateAddress(address) : 'N/A'),
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
    if (address === chainAddr) {
      return (
        <Tooltip placement="top" tooltip={capitalize(walletType as string)}>
          <WalletIcon size={16} walletType={walletType} />
        </Tooltip>
      )
    }

    return <Label>(Edited)</Label>
  }

  return (
    <CardWrapper {...otherProps}>
      <CardHeader>
        <CardTitle>
          <span className="card-title">{title}</span>
          {renderRecipientIcon()}
        </CardTitle>
        <ActionWrapper>
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
              <ToolWrapper>
                <ExternalLink />
              </ToolWrapper>
            </a>
          </Tooltip>
        </ActionWrapper>
      </CardHeader>
      <CardContent>
        <AddressInput
          sizevalue="big"
          isError={!isValidAddress}
          value={isEditable ? address : truncatedAddr}
          onChange={handleAddressChange}
          disabled={!isEditable}
        />
      </CardContent>
    </CardWrapper>
  )
}
