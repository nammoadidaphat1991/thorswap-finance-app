import React, { useCallback, useMemo } from 'react'

import { useHistory } from 'react-router'

import { Account } from 'multichain-sdk'

import { useApp } from 'redux/app/hooks'
import { useWallet } from 'redux/wallet/hooks'

import {
  SWAP_ROUTE,
  UPGRADE_RUNE_ROUTE,
  ADD_LIQUIDITY_ROUTE,
  WITHDRAW_ROUTE,
  LIQUIDITY_ROUTE,
} from 'settings/constants'

import { Footer } from '../Footer'
import { Header } from '../Header'
import { Alert } from '../UIElements'
import WalletModal from '../WalletModal'
import * as Styled from './Layout.style'

export type Props = {
  transparent?: boolean
  children: React.ReactNode
}

export const Layout = (props: Props) => {
  const { children, transparent = false } = props

  const history = useHistory()
  const { account } = useWallet()
  const { showAnnouncement, setReadStatus } = useApp()

  const oldRune: string | null = useMemo(() => {
    if (account) {
      const runesToUpgrade = Account.getRuneToUpgrade(account)

      if (runesToUpgrade.length > 0) {
        const oldRuneChain = `${runesToUpgrade?.[0]?.chain ?? ''} ${
          runesToUpgrade?.[1]?.chain ?? ''
        }`
        return `Click to upgrade ${oldRuneChain} RUNE to Native RUNE.`
      }
    }

    return null
  }, [account])
  const handleUpgrade = useCallback(() => {
    history.push(UPGRADE_RUNE_ROUTE)
  }, [history])

  const isTxPage = useMemo(() => {
    const { pathname } = window.location

    return (
      pathname.includes(SWAP_ROUTE) ||
      pathname.includes(ADD_LIQUIDITY_ROUTE) ||
      pathname.includes(WITHDRAW_ROUTE) ||
      pathname.includes(LIQUIDITY_ROUTE)
    )
  }, [])

  return (
    <Styled.LayoutWrapper>
      {showAnnouncement && (
        <Alert
          message="Chaosnet is still in BETA, Take your own Risk. Always back up your wallet and do not play with large funds. Bookmark app.thorswap.finance to be safe."
          type="warning"
          showIcon
          closable
          onClose={() => setReadStatus(true)}
        />
      )}
      <Header />
      <Styled.ContentWrapper transparent={transparent}>
        {isTxPage && oldRune && (
          <Styled.NotifyWrapper>
            <Styled.Notify onClick={handleUpgrade}>{oldRune}</Styled.Notify>
          </Styled.NotifyWrapper>
        )}
        {children}
      </Styled.ContentWrapper>
      <Footer />
      <WalletModal />
    </Styled.LayoutWrapper>
  )
}
