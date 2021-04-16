import React from 'react'

import { ChevronUp, ChevronDown } from 'react-feather'

import { SyncOutlined } from '@ant-design/icons'
import { chainToString } from '@xchainjs/xchain-util'
import { Asset, Pool, SupportedChain } from 'multichain-sdk'

import { useMidgard } from 'redux/midgard/hooks'
import { PoolMemberData, ChainMemberData } from 'redux/midgard/types'

import { MemberPoolCard } from '../MemberPoolCard'
import { CoreButton } from '../UIElements'
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
  const { pools } = useMidgard()
  const [collapsed, setCollapsed] = React.useState(true)

  const toggle = React.useCallback(() => {
    setCollapsed(!collapsed)
  }, [collapsed])

  return (
    <Styled.Container>
      <Styled.Header>
        <Styled.ChainLabel>{chainToString(chain)}</Styled.ChainLabel>
        <Styled.HeaderRight>
          <CoreButton>
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
