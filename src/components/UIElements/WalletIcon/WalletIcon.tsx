import React from 'react'

import {
  MetaMaskLogoIcon,
  LedgerIcon,
  FolderIcon,
  XdefiLogoIcon,
} from 'components/Icons'

import { Props } from './types'
import { IconWrapper } from './WalletIcon.style'

export const WalletIcon: React.FC<Props> = (props: Props): JSX.Element => {
  const { walletType, size = 24, ...otherProps } = props

  const getWalletIcon = () => {
    if (walletType === 'metamask') return <MetaMaskLogoIcon />
    if (walletType === 'ledger') return <LedgerIcon />
    if (walletType === 'keystore') return <FolderIcon />
    if (walletType === 'xdefi') return <XdefiLogoIcon />

    return <></>
  }

  return (
    <IconWrapper size={size} {...otherProps}>
      {getWalletIcon()}
    </IconWrapper>
  )
}
