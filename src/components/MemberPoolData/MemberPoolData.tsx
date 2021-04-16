import React from 'react'

import { MemberPool } from 'midgard-sdk'
import moment from 'moment'
import { Amount, Pool, Liquidity } from 'multichain-sdk'

import { ExternalLink } from 'components/Link'

import { PoolShareType } from 'redux/midgard/types'

import { getPoolDetailRouteFromAsset } from 'settings/constants'

import { AssetData } from '../Assets'
import { Information, Label } from '../UIElements'
import * as Styled from './MemberPoolData.style'

export type MemberPoolDataProps = {
  pool: Pool
  data: MemberPool
  shareType: PoolShareType
}

export const MemberPoolData = ({
  data,
  shareType,
  pool,
}: MemberPoolDataProps) => {
  const { liquidityUnits, dateLastAdded } = data

  const liquidityObj = new Liquidity(pool, Amount.fromMidgard(liquidityUnits))

  const assetName = pool.asset.ticker

  return (
    <Styled.Container>
      <Styled.Header>
        <ExternalLink link={getPoolDetailRouteFromAsset(pool.asset)}>
          <AssetData asset={pool.asset} size="normal" />
        </ExternalLink>
        <Styled.HeaderRight>
          <Label>Pool Share: {liquidityObj.poolShare.toFixed(4)}</Label>
        </Styled.HeaderRight>
      </Styled.Header>
      <Styled.Content>
        {shareType === PoolShareType.SYM && (
          <>
            <Information
              title="Rune Share"
              description={`${liquidityObj.runeShare.toFixed(4)} RUNE`}
            />
            <Information
              title={`${assetName} Share`}
              description={`${liquidityObj.assetShare.toFixed(4)} ${assetName}`}
            />
          </>
        )}
        {shareType === PoolShareType.RUNE_ASYM && (
          <Information
            title="Rune Share"
            description={`${liquidityObj.getAsymRuneShare().toFixed(4)} RUNE`}
          />
        )}
        {shareType === PoolShareType.ASSET_ASYM && (
          <Information
            title={`${assetName} Share`}
            description={`${liquidityObj
              .getAsymAssetShare()
              .toFixed(4)} ${assetName}`}
          />
        )}
        <Information
          title="LP Units"
          description={Amount.fromMidgard(liquidityUnits).toFixed(2)}
        />
        <Information
          title="Last Added"
          description={moment.unix(Number(dateLastAdded)).format('YYYY-MM-DD')}
        />
      </Styled.Content>
    </Styled.Container>
  )
}
