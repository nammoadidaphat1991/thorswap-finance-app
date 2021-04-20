import React, { useMemo } from 'react'

import { ChevronUp, ChevronDown } from 'react-feather'

import { SyncOutlined, AreaChartOutlined } from '@ant-design/icons'
import { chainToString } from '@xchainjs/xchain-util'
import { Asset, Pool, SupportedChain } from 'multichain-sdk'

import { useMidgard } from 'redux/midgard/hooks'
import { PoolMemberData, ChainMemberData } from 'redux/midgard/types'

import { multichain } from 'services/multichain'

import { getRuneYieldInfoRoute } from 'settings/constants'

import { ExternalButtonLink } from '../Link'
import { MemberPoolCard } from '../MemberPoolCard'
import { CoreButton, Tooltip } from '../UIElements'
import * as Styled from './ChainMemberPoolCard.style'

export type ChainMemberPoolCardProps = {
  chain: SupportedChain
  data: ChainMemberData
  loading: boolean
}

export const ChainMemberPoolCard = ({
  chain,
  data,
  loading,
}: ChainMemberPoolCardProps) => {
  const { pools, loadMemberDetailsByChain } = useMidgard()
  const [collapsed, setCollapsed] = React.useState(false)

  const toggle = React.useCallback(() => {
    setCollapsed(!collapsed)
  }, [collapsed])

  const chainWalletAddress = useMemo(() => {
    return multichain.getWalletAddressByChain(chain) || '#'
  }, [chain])

  return (
    <Styled.Container>
      <Styled.Header>
        <Styled.ChainLabel>{chainToString(chain)}</Styled.ChainLabel>
        <Styled.HeaderRight>
          <ExternalButtonLink
            link={getRuneYieldInfoRoute({
              chain,
              address: chainWalletAddress,
            })}
          >
            <Tooltip tooltip="View on RUNEYield.info ↗" placement="top">
              <Styled.YieldInfo>
                <AreaChartOutlined />
              </Styled.YieldInfo>
            </Tooltip>
          </ExternalButtonLink>
          <CoreButton onClick={() => loadMemberDetailsByChain(chain)}>
            <Styled.ToolWrapper>
              <SyncOutlined spin={loading} />
            </Styled.ToolWrapper>
          </CoreButton>
          <CoreButton onClick={toggle}>
            {!collapsed ? <ChevronUp /> : <ChevronDown />}
          </CoreButton>
        </Styled.HeaderRight>
      </Styled.Header>
      {!collapsed &&
        Object.keys(data).map((poolStr: string) => {
          const poolMemberData = data[poolStr] as PoolMemberData

          const poolAsset = Asset.fromAssetString(poolStr)
          if (!poolAsset) return null

          const pool = Pool.byAsset(poolAsset, pools)

          if (!pool) return null

          return (
            <MemberPoolCard pool={pool} data={poolMemberData} key={poolStr} />
          )
        })}
    </Styled.Container>
  )
}
