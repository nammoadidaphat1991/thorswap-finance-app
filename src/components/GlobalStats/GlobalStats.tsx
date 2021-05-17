import React from 'react'

import { Row, Col } from 'antd'
import { Percent, Amount } from 'multichain-sdk'

import { useGlobalState } from 'redux/hooks'
import { useMidgard } from 'redux/midgard/hooks'

import { useMimir } from 'hooks/useMimir'

import { InfoCard } from '../InfoCard'
import { InfoCardProps } from '../InfoCard/InfoCard'

export const GlobalStats: React.FC = (): JSX.Element => {
  const { stats, networkData, volume24h } = useMidgard()
  const {
    totalPooledRune,
    maxLiquidityRune,
    capPercent,
    isFundsCapReached,
  } = useMimir()
  const { runeToCurrency } = useGlobalState()

  const bondingAPYLabel = new Percent(networkData?.bondingAPY ?? 0).toFixed(2)
  const liquidityAPYLabel = new Percent(networkData?.liquidityAPY ?? 0).toFixed(
    2,
  )

  const swapVolume = Amount.fromMidgard(stats?.swapVolume)
  const addLiquidityVolume = Amount.fromMidgard(stats?.addLiquidityVolume)
  const withdrawVolume = Amount.fromMidgard(stats?.withdrawVolume)

  // const swapCount = Amount.fromNormalAmount(stats?.swapCount)
  // const addLiquidityCount = Amount.fromNormalAmount(stats?.addLiquidityCount)
  // const withdrawCount = Amount.fromNormalAmount(stats?.withdrawCount)

  const totalVolume = swapVolume.add(addLiquidityVolume).add(withdrawVolume)
  // const totalTx = swapCount.add(addLiquidityCount).add(withdrawCount)

  const statsData: InfoCardProps[] = React.useMemo(() => {
    return [
      {
        title: 'Total Liquidity',
        value: runeToCurrency(
          Amount.fromMidgard(stats?.runeDepth).mul(2),
        ).toCurrencyFormat(0),
      },
      {
        title: 'Total Volume',
        value: runeToCurrency(totalVolume).toCurrencyFormat(0),
      },
      {
        title: '24H Volume',
        value: volume24h
          ? runeToCurrency(Amount.fromMidgard(volume24h || 0)).toCurrencyFormat(
              0,
            )
          : '-',
      },
      {
        title: 'Total Rune Pooled',
        value: `${totalPooledRune.toAbbreviate(
          2,
        )} / ${maxLiquidityRune.toAbbreviate(2)}`,
      },
      {
        title: 'Funds Cap',
        value: capPercent || '-',
        tooltip: !isFundsCapReached
          ? 'You can provide the liquidity until Funds Cap reaches the limit.'
          : 'Funds Cap reached the limit, Please wait for the next raise moment.',
        status: !isFundsCapReached ? 'primary' : 'warning',
      },
      {
        title: 'Bonding APY',
        value: bondingAPYLabel,
      },
      {
        title: 'Liquidity APY',
        value: liquidityAPYLabel,
      },
      {
        title: 'Active Users',
        value: Amount.fromNormalAmount(stats?.monthlyActiveUsers).toFixed(0),
      },
    ]
  }, [
    volume24h,
    stats,
    bondingAPYLabel,
    liquidityAPYLabel,
    totalVolume,
    maxLiquidityRune,
    totalPooledRune,
    capPercent,
    runeToCurrency,
    isFundsCapReached,
  ])

  return (
    <Row gutter={[16, 16]}>
      {statsData.map((statProps, index) => {
        return (
          <Col
            key={index}
            xs={{ span: 12 }}
            sm={{ span: 12 }}
            md={{ span: 8 }}
            lg={{ span: 6 }}
            xl={{ span: 6 }}
            xxl={{ span: 3 }}
          >
            <InfoCard {...statProps} />
          </Col>
        )
      })}
    </Row>
  )
}
