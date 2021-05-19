import React from 'react'

import { WalletOption } from 'multichain-sdk'

import {
  MetaMaskLogoIcon,
  LedgerIcon,
  FolderIcon,
  XdefiLogoIcon,
} from 'components/Icons'

import { IconWrapper } from './WalletIcon.style'

export type WalletIconProps = {
  walletType: WalletOption
  size?: number
}

export const WalletIcon: React.FC<WalletIconProps> = (props): JSX.Element => {
  const { walletType, size = 24, ...otherProps } = props

  const getWalletIcon = () => {
    if (walletType === WalletOption.METAMASK) return <MetaMaskLogoIcon />
    if (walletType === WalletOption.LEDGER) return <LedgerIcon />
    if (walletType === WalletOption.KEYSTORE) return <FolderIcon />
    if (walletType === WalletOption.XDEFI) return <XdefiLogoIcon />

    return <></>
  }

  return (
    <IconWrapper size={size} {...otherProps}>
      {getWalletIcon()}
    </IconWrapper>
  )
}
