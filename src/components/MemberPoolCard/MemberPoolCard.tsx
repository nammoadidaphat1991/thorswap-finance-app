import React, { useMemo } from 'react'

import { ChevronUp, ChevronDown } from 'react-feather'
import { Link } from 'react-router-dom'

import { MemberPool } from 'midgard-sdk'
import moment from 'moment'
import { Amount, Asset, Liquidity, Percent, Pool } from 'multichain-sdk'

import { ExternalLink } from 'components/Link'

import { useMidgard } from 'redux/midgard/hooks'

import {
  getAddLiquidityRoute,
  getPoolDetailRouteFromAsset,
  getWithdrawRoute,
} from 'settings/constants'

import { AssetData } from '../Assets'
import { CoreButton, FancyButton, Information } from '../UIElements'
import * as Styled from './MemberPoolCard.style'

export type MemberPoolCardProps = {
  data: MemberPool
}

export const MemberPoolCard = ({ data }: MemberPoolCardProps) => {
  const { pools } = useMidgard()
  const {
    pool: poolName,
    liquidityUnits,
    runeAdded,
    assetAdded,
    dateLastAdded,
  } = data
  const [collapsed, setCollapsed] = React.useState(true)

  const toggle = React.useCallback(() => {
    setCollapsed(!collapsed)
  }, [collapsed])

  const poolAsset = Asset.fromAssetString(poolName)

  const poolShare: Percent = useMemo(() => {
    if (!poolAsset) return new Percent(0)

    const pool = Pool.byAsset(poolAsset, pools)

    if (!pool) return new Percent(0)

    return new Liquidity(pool, Amount.fromMidgard(liquidityUnits)).poolShare
  }, [liquidityUnits, poolAsset, pools])

  if (!poolAsset) return null

  return (
    <Styled.Container>
      <Styled.Header>
        <ExternalLink link={getPoolDetailRouteFromAsset(poolAsset)}>
          <AssetData asset={poolAsset} size="normal" />
        </ExternalLink>
        <Styled.HeaderRight>
          <Styled.PoolShareLabel>{poolShare.toFixed(4)}</Styled.PoolShareLabel>
          <CoreButton onClick={toggle}>
            {!collapsed ? <ChevronUp /> : <ChevronDown />}
          </CoreButton>
        </Styled.HeaderRight>
      </Styled.Header>
      {!collapsed && (
        <>
          <Styled.Content>
            <Information
              title="Pooled Rune"
              description={`${Amount.fromMidgard(runeAdded).toFixed(4)} RUNE`}
            />
            <Information
              title="Pooled Asset"
              description={`${Amount.fromMidgard(assetAdded).toFixed(4)} ${
                poolAsset.ticker
              }`}
            />
            <Information
              title="LP Units"
              description={Amount.fromMidgard(liquidityUnits).toFixed(2)}
            />
            <Information
              title="Last Added"
              description={moment
                .unix(Number(dateLastAdded))
                .format('YYYY-MM-DD')}
            />
          </Styled.Content>
          <Styled.Footer>
            <Link to={getAddLiquidityRoute(poolAsset)}>
              <FancyButton size="small">Add</FancyButton>
            </Link>
            <Link to={getWithdrawRoute(poolAsset)}>
              <FancyButton size="small">Withdraw</FancyButton>
            </Link>
          </Styled.Footer>
        </>
      )}
    </Styled.Container>
  )
}
