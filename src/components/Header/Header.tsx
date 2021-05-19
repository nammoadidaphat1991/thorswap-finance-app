import React, { useCallback, useState, useMemo } from 'react'

import { Link } from 'react-router-dom'

import { Grid } from 'antd'
import { Asset, Amount, hasConnectedWallet } from 'multichain-sdk'

import { CurrencySelector } from 'components/CurrencySelector'

import { useApp } from 'redux/app/hooks'
import { useGlobalState } from 'redux/hooks'
import { useMidgard } from 'redux/midgard/hooks'
import { useWallet } from 'redux/wallet/hooks'

import { HOME_ROUTE } from 'settings/constants'
import { currencyIndexAssets } from 'settings/constants/currency'

import { Logo } from '../Logo'
import { Navbar } from '../Navbar'
import { NetworkStatus } from '../NetworkStatus'
import { Refresh } from '../Refresh'
import { ThemeSwitch } from '../ThemeSwitch'
import { TxManager } from '../TxManager'
import { Label } from '../UIElements'
import { WalletDrawer } from '../WalletDrawer'
import * as Styled from './Header.style'

export const Header = () => {
  const { themeType, baseCurrencyAsset, setBaseCurrency } = useApp()
  const { wallet, isWalletLoading, setIsConnectModalOpen } = useWallet()
  const { refreshPage } = useGlobalState()
  const { stats } = useMidgard()

  const [drawerVisible, setDrawerVisible] = useState(false)

  const isDesktopView = Grid.useBreakpoint()?.sm ?? false

  const isConnected = useMemo(() => hasConnectedWallet(wallet), [wallet])

  const handleClickWalletBtn = useCallback(() => {
    if (!isConnected && !isWalletLoading) {
      setIsConnectModalOpen(true)
    } else {
      setDrawerVisible(true)
    }
  }, [isConnected, isWalletLoading, setIsConnectModalOpen])

  const handleCloseDrawer = useCallback(() => {
    setDrawerVisible(false)
  }, [])

  const handleSelectCurrency = useCallback(
    (baseAsset: Asset) => {
      setBaseCurrency(baseAsset)
    },
    [setBaseCurrency],
  )

  const priceLabel = useMemo(() => {
    if (isDesktopView) {
      return `1ᚱ = $${Amount.fromNormalAmount(stats?.runePriceUSD).toFixed(2)}`
    }

    return `1ᚱ=$${Amount.fromNormalAmount(stats?.runePriceUSD).toFixed(2)}`
  }, [isDesktopView, stats])

  return (
    <Styled.HeaderContainer>
      <Styled.HeaderLeft>
        <Styled.LogoWrapper>
          <Link to={HOME_ROUTE}>
            <Logo mini type="thorswap" color={themeType} />
          </Link>
        </Styled.LogoWrapper>
        <Navbar />
      </Styled.HeaderLeft>

      <Styled.HeaderAction>
        <Styled.RunePrice>
          <Label weight="bold">{priceLabel}</Label>
        </Styled.RunePrice>
        {isDesktopView && <NetworkStatus />}
        <Styled.ToolWrapper>
          <CurrencySelector
            selected={baseCurrencyAsset}
            currencies={currencyIndexAssets}
            onSelect={handleSelectCurrency}
          />
        </Styled.ToolWrapper>
        {isDesktopView && <ThemeSwitch />}
        <Styled.WalletBtn
          onClick={handleClickWalletBtn}
          connected={isConnected}
          loading={isWalletLoading}
        />
        <WalletDrawer visible={drawerVisible} onClose={handleCloseDrawer} />
        <Refresh onRefresh={refreshPage} />
        <TxManager />
      </Styled.HeaderAction>
    </Styled.HeaderContainer>
  )
}
