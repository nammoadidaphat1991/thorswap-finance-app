import React from 'react'

import { Row, Col } from 'antd'
import { Helmet, StatsCard } from 'components'
import { Percent, Amount } from 'multichain-sdk'

import { useGlobalState } from 'redux/hooks'
import { useMidgard } from 'redux/midgard/hooks'

import { useMimir } from 'hooks/useMimir'

import * as Styled from './StatisticsView.style'

const StatisticsView: React.FC = (): JSX.Element => {
  const { stats, networkData, lastBlock } = useMidgard()
  const { maxLiquidityRune } = useMimir()
  const { runeToCurrency } = useGlobalState()

  const bondingAPYLabel = new Percent(networkData?.bondingAPY ?? 0).toFixed(2)
  const liquidityAPYLabel = new Percent(networkData?.liquidityAPY ?? 0).toFixed(
    2,
  )

  const swapVolume = Amount.fromMidgard(stats?.swapVolume)
  const addLiquidityVolume = Amount.fromMidgard(stats?.addLiquidityVolume)
  const withdrawVolume = Amount.fromMidgard(stats?.withdrawVolume)

  const swapCount = Amount.fromNormalAmount(stats?.swapCount)
  const addLiquidityCount = Amount.fromNormalAmount(stats?.addLiquidityCount)
  const withdrawCount = Amount.fromNormalAmount(stats?.withdrawCount)

  const totalVolume = swapVolume.add(addLiquidityVolume).add(withdrawVolume)
  const totalTx = swapCount.add(addLiquidityCount).add(withdrawCount)

  const networkStatsData = React.useMemo(() => {
    return [
      {
        title: 'Bonding APY',
        value: bondingAPYLabel,
      },
      {
        title: 'Total Reserve',
        value: runeToCurrency(
          Amount.fromMidgard(networkData?.totalReserve),
        ).toCurrencyFormat(0),
      },
      {
        title: 'Block Reward',
        value: runeToCurrency(
          Amount.fromMidgard(networkData?.blockRewards?.blockReward),
        ).toCurrencyFormat(2),
      },
      {
        title: 'Active Node Count',
        value: Amount.fromNormalAmount(networkData?.activeNodeCount).toFixed(0),
      },
      {
        title: 'Standby Node Count',
        value: Amount.fromNormalAmount(networkData?.standbyNodeCount).toFixed(
          0,
        ),
      },
      {
        title: 'Pool Activation Countdown',
        value: Amount.fromNormalAmount(
          networkData?.poolActivationCountdown,
        ).toFixed(0),
      },
      {
        title: 'Current Block Height',
        value: Amount.fromNormalAmount(lastBlock?.[0]?.thorchain).toFixed(0),
      },
      {
        title: 'Next Churn Height',
        value: Amount.fromNormalAmount(networkData?.nextChurnHeight).toFixed(0),
      },
    ]
  }, [lastBlock, networkData, bondingAPYLabel, runeToCurrency])

  const volumeStatsData = React.useMemo(() => {
    return [
      {
        title: 'Total Volume',
        value: runeToCurrency(totalVolume).toCurrencyFormat(0),
      },
      {
        title: 'Swap Volume',
        value: runeToCurrency(
          Amount.fromMidgard(stats?.swapVolume),
        ).toCurrencyFormat(0),
      },
      {
        title: 'Add Liquidity Volume',
        value: runeToCurrency(
          Amount.fromMidgard(stats?.addLiquidityVolume),
        ).toCurrencyFormat(0),
      },
      {
        title: 'Withdraw Volume',
        value: runeToCurrency(
          Amount.fromMidgard(stats?.withdrawVolume),
        ).toCurrencyFormat(0),
      },
    ]
  }, [stats, totalVolume, runeToCurrency])

  const liquidityStatsData = React.useMemo(() => {
    return [
      {
        title: 'Total Liquidity',
        value: runeToCurrency(
          Amount.fromMidgard(stats?.runeDepth).mul(2),
        ).toCurrencyFormat(0),
      },
      {
        title: 'Total RUNE Pooled',
        value: `${Amount.fromMidgard(networkData?.totalPooledRune).toFixed(
          0,
        )} RUNE`,
      },
      {
        title: 'Max RUNE Liquidity',
        value: `${maxLiquidityRune?.toFixed(0) ?? 'N/A'} RUNE`,
      },
      {
        title: 'Liquidity APY',
        value: liquidityAPYLabel,
      },
    ]
  }, [stats, networkData, maxLiquidityRune, liquidityAPYLabel, runeToCurrency])

  const userStatsData = React.useMemo(() => {
    return [
      {
        title: 'Total Tx',
        value: totalTx.toFixed(),
      },
      {
        title: 'Swap Count',
        value: Amount.fromNormalAmount(stats?.swapCount).toFixed(0),
      },
      {
        title: 'Unique Swapper Count',
        value: Amount.fromNormalAmount(stats?.uniqueSwapperCount).toFixed(0),
      },
      {
        title: 'Swap Count 24H',
        value: Amount.fromNormalAmount(stats?.swapCount24h).toFixed(0),
      },
      {
        title: 'Swap Count 30D',
        value: Amount.fromNormalAmount(stats?.swapCount30d).toFixed(0),
      },
      {
        title: 'Add Liquidity Count',
        value: Amount.fromNormalAmount(stats?.addLiquidityCount).toFixed(0),
      },
      {
        title: 'Withdraw Count',
        value: Amount.fromNormalAmount(stats?.withdrawCount).toFixed(0),
      },
      {
        title: 'Monthly Active Users',
        value: Amount.fromNormalAmount(stats?.monthlyActiveUsers).toFixed(0),
      },
      {
        title: 'Daily Active Users',
        value: Amount.fromNormalAmount(stats?.dailyActiveUsers).toFixed(0),
      },
    ]
  }, [stats, totalTx])

  return (
    <Styled.Container>
      <Helmet title="Stats" content="Stats" />
      <Styled.Section>
        <Styled.SectionTitle weight="bold" color="primary" size="large">
          Volume
        </Styled.SectionTitle>
        <Row gutter={[16, 16]}>
          {volumeStatsData.map((statProps, index) => {
            return (
              <Col
                key={index}
                xs={{ span: 24 }}
                sm={{ span: 12 }}
                md={{ span: 8 }}
                lg={{ span: 8 }}
                xl={{ span: 4 }}
              >
                <StatsCard {...statProps} />
              </Col>
            )
          })}
        </Row>
      </Styled.Section>
      <Styled.Section>
        <Styled.SectionTitle weight="bold" color="primary" size="large">
          Liquidity
        </Styled.SectionTitle>
        <Row gutter={[16, 16]}>
          {liquidityStatsData.map((statProps, index) => {
            return (
              <Col
                key={index}
                xs={{ span: 24 }}
                sm={{ span: 12 }}
                md={{ span: 8 }}
                lg={{ span: 8 }}
                xl={{ span: 4 }}
              >
                <StatsCard {...statProps} />
              </Col>
            )
          })}
        </Row>
      </Styled.Section>
      <Styled.Section>
        <Styled.SectionTitle weight="bold" color="primary" size="large">
          Network
        </Styled.SectionTitle>
        <Row gutter={[16, 16]}>
          {networkStatsData.map((statProps, index) => {
            return (
              <Col
                key={index}
                xs={{ span: 24 }}
                sm={{ span: 12 }}
                md={{ span: 8 }}
                lg={{ span: 8 }}
                xl={{ span: 4 }}
              >
                <StatsCard {...statProps} />
              </Col>
            )
          })}
        </Row>
      </Styled.Section>
      <Styled.Section>
        <Styled.SectionTitle weight="bold" color="primary" size="large">
          Users, Transactions
        </Styled.SectionTitle>
        <Row gutter={[16, 16]}>
          {userStatsData.map((statProps, index) => {
            return (
              <Col
                key={index}
                xs={{ span: 24 }}
                sm={{ span: 12 }}
                md={{ span: 8 }}
                lg={{ span: 8 }}
                xl={{ span: 4 }}
              >
                <StatsCard {...statProps} />
              </Col>
            )
          })}
        </Row>
      </Styled.Section>
    </Styled.Container>
  )
}

export default StatisticsView
