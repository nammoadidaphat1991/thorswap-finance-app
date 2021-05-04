import React, { useMemo } from 'react'

import {
  ChevronUp,
  ChevronDown,
  ExternalLink as ExternalLinkIcon,
} from 'react-feather'

import { Asset, Amount } from 'multichain-sdk'

import { LiquidityProvider } from 'redux/midgard/types'

import { multichain } from 'services/multichain'

import { getPoolDetailRouteFromAsset } from 'settings/constants'

import { AssetData } from '../Assets'
import { ExternalLink } from '../Link'
import { CoreButton, FancyButton, Information } from '../UIElements'
import * as Styled from './PendingDepositCard.style'

export type PendingDepositCardProps = {
  poolAsset: Asset
  data: LiquidityProvider
  onComplete: () => void
  onWithdraw: () => void
}

export const PendingDepositCard = ({
  data,
  poolAsset,
  onComplete,
  onWithdraw,
}: PendingDepositCardProps) => {
  const [collapsed, setCollapsed] = React.useState(true)

  const assetName = poolAsset.ticker
  const pendingRune = Amount.fromMidgard(data.pending_rune)
  const pendingAsset = Amount.fromMidgard(data.pending_asset)
  const pendingTxFullUrl = data.pending_tx_Id
    ? multichain.getExplorerTxUrl(poolAsset.chain, data.pending_tx_Id)
    : '#'

  const title = useMemo(() => {
    if (pendingAsset.gt(0)) {
      return `Pending ${pendingAsset.toSignificant(6)} ${assetName}`
    }

    return `Pending ${pendingRune.toSignificant(6)} RUNE`
  }, [assetName, pendingRune, pendingAsset])

  const solution = useMemo(() => {
    if (pendingAsset.gt(0)) {
      return 'Transaction must be completed by adding RUNE symmetrically'
    }

    return `Transaction must be completed by adding ${assetName} symmetrically`
  }, [assetName, pendingAsset])

  const toggle = React.useCallback(() => {
    setCollapsed(!collapsed)
  }, [collapsed])

  const renderDetails = useMemo(() => {
    return (
      <Styled.ShareContent>
        <Styled.ShareTitle>{`RUNE + ${assetName} LP`}</Styled.ShareTitle>
        {pendingRune.gt(0) && (
          <Information
            title="Pending RUNE"
            description={Amount.fromMidgard(data.pending_rune).toSignificant(6)}
          />
        )}
        {pendingAsset.gt(0) && (
          <Information
            title="Pending Asset"
            description={Amount.fromMidgard(data.pending_asset).toSignificant(
              6,
            )}
          />
        )}
        <Information
          title="RUNE Added"
          description={Amount.fromMidgard(
            data.rune_deposit_value,
          ).toSignificant(6)}
        />
        <Information
          title="Asset Added"
          description={Amount.fromMidgard(
            data.asset_deposit_value,
          ).toSignificant(6)}
        />
        <Information
          title="LP Units"
          description={Amount.fromMidgard(data.units).toFixed(2)}
        />
        <Information
          title="Last Added Height"
          description={Amount.fromNormalAmount(data.last_add_height).toFixed(0)}
        />
        <Information
          title="TIP: Add Sym RUNE to complete"
          description=""
          tooltip={`${solution}, Pending Liquidity is deposited automatically after 7 days of period`}
        />
      </Styled.ShareContent>
    )
  }, [assetName, data, pendingRune, pendingAsset, solution])

  return (
    <Styled.Container>
      <Styled.Header>
        <ExternalLink link={getPoolDetailRouteFromAsset(poolAsset)}>
          <AssetData asset={poolAsset} size="normal" />
        </ExternalLink>
        <Styled.HeaderRight>
          <Styled.PoolShareLabel>{title}</Styled.PoolShareLabel>
          <ExternalLink link={pendingTxFullUrl}>
            <CoreButton>
              <ExternalLinkIcon />
            </CoreButton>
          </ExternalLink>
          <CoreButton onClick={toggle}>
            {!collapsed ? <ChevronUp /> : <ChevronDown />}
          </CoreButton>
        </Styled.HeaderRight>
      </Styled.Header>
      {!collapsed && <Styled.CardBody>{renderDetails}</Styled.CardBody>}

      <Styled.Footer>
        <FancyButton onClick={onComplete} size="small">
          Complete
        </FancyButton>
        <FancyButton onClick={onWithdraw} size="small">
          Withdraw
        </FancyButton>
      </Styled.Footer>
    </Styled.Container>
  )
}
