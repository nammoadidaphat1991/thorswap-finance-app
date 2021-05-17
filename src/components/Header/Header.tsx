import React, { useCallback, useState, useEffect, useMemo } from 'react'

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
import { Label, Question } from '../UIElements'
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

  const priceLabel = useMemo(() => {
    if (isDesktopView) {
      return `1ᚱ = $${Amount.fromNormalAmount(stats?.runePriceUSD).toFixed(2)}`
    }

    return `1ᚱ=$${Amount.fromNormalAmount(stats?.runePriceUSD).toFixed(2)}`
  }, [isDesktopView, stats])

  return (
    <Styled.HeaderContainer>
      <Styled.HeaderLogo>
        <Styled.LogoWrapper>
          <Link to={HOME_ROUTE}>
            <Logo mini type="thorswap" color={themeType} />
          </Link>
        </Styled.LogoWrapper>
        <Styled.HeaderAction>
          <NetworkStatus />
          <Styled.RunePrice>
            <Label weight="bold">{priceLabel}</Label>
          </Styled.RunePrice>
        </Styled.HeaderAction>
      </Styled.HeaderLogo>

      <Styled.HeaderCenterWrapper>
        <Label color={isValidFundCaps ? 'primary' : 'warning'} weight="bold">
          {globalRunePooledStatus} {!isValidFundCaps ? '#RAISETHECAPS' : '🚀'}
        </Label>
        {isValidFundCaps && (
          <Question
            tooltip="You can provide the liquidity until Funds Cap reaches the limit."
            placement="bottom"
          />
        )}
        {!isValidFundCaps && (
          <Question
            tooltip="Funds Cap reached the limit, Please wait for the next raise moment."
            placement="bottom"
            color="warning"
          />
        )}
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
