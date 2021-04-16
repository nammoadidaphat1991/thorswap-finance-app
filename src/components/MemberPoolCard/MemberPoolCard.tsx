import React, { useMemo } from 'react'

import { ChevronUp, ChevronDown } from 'react-feather'
import { Link } from 'react-router-dom'

import moment from 'moment'
import { Amount, Liquidity, Pool } from 'multichain-sdk'

import { PoolMemberData, ShareType } from 'redux/midgard/types'

import {
  getAddLiquidityRoute,
  getPoolDetailRouteFromAsset,
  getWithdrawRoute,
} from 'settings/constants'

import { AssetData } from '../Assets'
import { ExternalLink } from '../Link'
import { CoreButton, FancyButton, Information } from '../UIElements'
import * as Styled from './MemberPoolCard.style'

export type MemberPoolCardProps = {
  pool: Pool
  data: PoolMemberData
}

export const MemberPoolCard = ({ pool, data }: MemberPoolCardProps) => {
  const [collapsed, setCollapsed] = React.useState(true)

  const toggle = React.useCallback(() => {
    setCollapsed(!collapsed)
  }, [collapsed])

  const totalLiquidityObj = useMemo(() => {
    let totalUnits = 0

    Object.keys(data).map((shareType) => {
      const memPoolData = data?.[shareType as ShareType]
      totalUnits += Number(memPoolData?.liquidityUnits ?? 0)
    })

    return new Liquidity(pool, Amount.fromMidgard(totalUnits))
  }, [pool, data])

  const renderShare = useMemo(() => {
    return Object.keys(data).map((shareType) => {
      const memPoolData = data?.[shareType as ShareType]

      if (!memPoolData) return null

      const { liquidityUnits, dateLastAdded } = memPoolData

      const liquidityObj = new Liquidity(
        pool,
        Amount.fromMidgard(liquidityUnits),
      )

      const assetName = pool.asset.ticker

      return (
        <Styled.ShareBody key={shareType}>
          <Styled.ShareContent>
            <Styled.ShareTitle>
              {shareType === 'sym' && `RUNE + ${assetName} LP`}
              {shareType === 'runeAsym' && 'RUNE LP'}
              {shareType === 'assetAsym' && `${assetName} LP`}
            </Styled.ShareTitle>
            <Information
              title="Pool Share"
              description={liquidityObj.poolShare.toFixed(4)}
            />
            <Information
              title="LP Units"
              description={Amount.fromMidgard(liquidityUnits).toFixed(2)}
            />
            {shareType === 'sym' && (
              <>
                <Information
                  title="Rune Share"
                  description={`${liquidityObj.runeShare.toFixed(4)} RUNE`}
                />
                <Information
                  title={`${assetName} Share`}
                  description={`${liquidityObj.assetShare.toFixed(
                    4,
                  )} ${assetName}`}
                />
              </>
            )}
            {shareType === 'runeAsym' && (
              <Information
                title="Rune Share"
                description={`${liquidityObj
                  .getAsymRuneShare()
                  .toFixed(4)} RUNE`}
              />
            )}
            {shareType === 'assetAsym' && (
              <Information
                title={`${assetName} Share`}
                description={`${liquidityObj
                  .getAsymAssetShare()
                  .toFixed(4)} ${assetName}`}
              />
            )}
            <Information
              title="Last Added"
              description={moment
                .unix(Number(dateLastAdded))
                .format('YYYY-MM-DD')}
            />
          </Styled.ShareContent>
          <Styled.Footer>
            <Link to={getAddLiquidityRoute(pool.asset)}>
              <FancyButton size="small">Add</FancyButton>
            </Link>
            <Link to={getWithdrawRoute(pool.asset)}>
              <FancyButton size="small">Withdraw</FancyButton>
            </Link>
          </Styled.Footer>
        </Styled.ShareBody>
      )
    })
  }, [data, pool])

  return (
    <Styled.Container>
      <Styled.Header>
        <ExternalLink link={getPoolDetailRouteFromAsset(pool.asset)}>
          <AssetData asset={pool.asset} size="normal" />
        </ExternalLink>
        <Styled.HeaderRight>
          <Styled.PoolShareLabel>
            Pool Share: {totalLiquidityObj.poolShare.toFixed(4)}
          </Styled.PoolShareLabel>
          <CoreButton onClick={toggle}>
            {!collapsed ? <ChevronUp /> : <ChevronDown />}
          </CoreButton>
        </Styled.HeaderRight>
      </Styled.Header>
      {!collapsed && <Styled.CardBody>{renderShare}</Styled.CardBody>}
    </Styled.Container>
  )
}
