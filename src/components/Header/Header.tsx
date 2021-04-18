import React, { useCallback, useState, useEffect } from 'react'

import { Link } from 'react-router-dom'

import { Grid } from 'antd'
import { Asset, Amount } from 'multichain-sdk'

import { CurrencySelector } from 'components/CurrencySelector'

import { useApp } from 'redux/app/hooks'
import { useGlobalState } from 'redux/hooks'
import { useMidgard } from 'redux/midgard/hooks'
import { useWallet } from 'redux/wallet/hooks'

import useNetwork from 'hooks/useNetwork'

import { HOME_ROUTE } from 'settings/constants'
import { currencyIndexAssets } from 'settings/constants/currency'

import { Logo } from '../Logo'
import { NetworkStatus } from '../NetworkStatus'
import { Refresh } from '../Refresh'
import { ThemeSwitch } from '../ThemeSwitch'
import { TxManager } from '../TxManager'
import { Label } from '../UIElements'
import { WalletDrawer } from '../WalletDrawer'
import * as Styled from './Header.style'

export const Header = () => {
  const { themeType, baseCurrencyAsset, setBaseCurrency } = useApp()
  const { wallet, walletLoading, setIsConnectModalOpen } = useWallet()
  const { refreshPage } = useGlobalState()
  const { isValidFundCaps, globalRunePooledStatus } = useNetwork()
  const { stats } = useMidgard()

  const [drawerVisible, setDrawerVisible] = useState(false)

  const isDesktopView = Grid.useBreakpoint()?.sm ?? false

  const isConnected = !!wallet

  useEffect(() => {
    refreshPage()
  }, [refreshPage])

  const handleClickWalletBtn = useCallback(() => {
    if (!isConnected && !walletLoading) {
      setIsConnectModalOpen(true)
    } else {
      setDrawerVisible(true)
    }
  }, [isConnected, walletLoading, setIsConnectModalOpen])

  const handleCloseDrawer = useCallback(() => {
    setDrawerVisible(false)
  }, [])

  const handleSelectCurrency = useCallback(
    (baseAsset: Asset) => {
      setBaseCurrency(baseAsset)
    },
    [setBaseCurrency],
  )

  const runeLabel = isDesktopView ? 'RUNE' : '1ᚱ'

  return (
    <Styled.HeaderContainer>
      <Styled.HeaderLogo>
        <Styled.LogoWrapper>
          <Link to={HOME_ROUTE}>
            <Logo mini={!isDesktopView} type="thorswap" color={themeType} />
          </Link>
        </Styled.LogoWrapper>
        <Styled.HeaderAction>
          <NetworkStatus />
          <Styled.RunePrice>
            <Label weight="bold">
              {runeLabel} ={' '}
              {`$${Amount.fromNormalAmount(stats?.runePriceUSD).toFixed(2)}`}
            </Label>
          </Styled.RunePrice>
        </Styled.HeaderAction>
      </Styled.HeaderLogo>

      <Styled.HeaderCenterWrapper>
        <Label weight="bold">
          {globalRunePooledStatus} {!isValidFundCaps && '(Funds Cap Reached)'}
        </Label>
      </Styled.HeaderCenterWrapper>

      <Styled.HeaderAction>
        <Styled.ToolWrapper>
          <CurrencySelector
            selected={baseCurrencyAsset}
            currencies={currencyIndexAssets}
            onSelect={handleSelectCurrency}
          />
        </Styled.ToolWrapper>
        <ThemeSwitch />
        <Styled.WalletBtn
          onClick={handleClickWalletBtn}
          connected={isConnected}
          loading={walletLoading}
        />
        <WalletDrawer visible={drawerVisible} onClose={handleCloseDrawer} />
        <Refresh onRefresh={refreshPage} />
        <TxManager />
      </Styled.HeaderAction>
    </Styled.HeaderContainer>
  )
}
