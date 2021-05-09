import React, { useEffect, useMemo, useState } from 'react'

import { Grid, Row, Col } from 'antd'
import { Amount, Asset } from 'multichain-sdk'

import { Label } from 'components/UIElements'

import { useApp } from 'redux/app/hooks'
import { useGlobalState } from 'redux/hooks'
import { useMidgard } from 'redux/midgard/hooks'

import { Chart } from '../Chart'
import { ChartDetail, ChartValues, ChartData } from '../Chart/types'

// display volume and earning time series graph
export const GlobalChart = () => {
  const isDesktopView = Grid.useBreakpoint()?.md ?? true

  const { baseCurrency } = useApp()
  const { runeToCurrency } = useGlobalState()

  const {
    getGlobalHistory,
    isGlobalHistoryLoading,
    earningsHistory,
    swapHistory,
    liquidityHistory,
    tvlHistory,
  } = useMidgard()

  useEffect(() => {
    getGlobalHistory()
  }, [getGlobalHistory])

  const [volumeChartIndex, setVolumeChartIndex] = useState('Total')
  const [liquidityChartIndex, setLiquidityChartIndex] = useState('Liquidity')
  const volumeChartIndexes = useMemo(
    () =>
      isDesktopView ? ['Total', 'Swap', 'Add', 'Withdraw'] : ['Total', 'Swap'],
    [isDesktopView],
  )
  const liquidityChartIndexes = useMemo(
    () =>
      isDesktopView
        ? ['Liquidity', 'LP Earning', 'Bonding Earning', '$RUNE Price']
        : ['Liquidity'],
    [isDesktopView],
  )

  // const chartValueUnit = 'ᚱ'
  const chartValueUnit = useMemo(() => {
    const baseCurrencyAsset = Asset.fromAssetString(baseCurrency)
    if (!baseCurrencyAsset) return 'ᚱ'

    if (baseCurrencyAsset?.isRUNE()) return 'ᚱ'
    if (baseCurrencyAsset?.ticker === 'USD') return '$'

    return baseCurrencyAsset.ticker
  }, [baseCurrency])

  const initialChartData = useMemo(() => {
    const initialData: ChartData = {}
    const defaultChartValues: ChartValues = []

    const chartIndexes = [...volumeChartIndexes, ...liquidityChartIndexes]

    chartIndexes.forEach((chartIndex) => {
      initialData[chartIndex] = {
        values: defaultChartValues,
        loading: true,
      }
    })

    return initialData
  }, [volumeChartIndexes, liquidityChartIndexes])

  const volumeChartData: ChartData = useMemo(() => {
    if (isGlobalHistoryLoading || !swapHistory || !liquidityHistory) {
      return initialChartData
    }

    const swapData = swapHistory.intervals || []
    const liquidityData = liquidityHistory.intervals || []

    const totalVolume: ChartDetail[] = []
    const swapVolume: ChartDetail[] = []
    const addVolume: ChartDetail[] = []
    const withdrawVolume: ChartDetail[] = []

    swapData.forEach((data, index) => {
      const liquidityValue = liquidityData[index]
      const time = Number(data?.startTime ?? 0)

      const swapValue = Amount.fromMidgard(data?.totalVolume)
      const addValue = Amount.fromMidgard(liquidityValue?.addLiquidityVolume)
      const withdrawValue = Amount.fromMidgard(liquidityValue?.withdrawVolume)

      const total = swapValue.add(addValue).add(withdrawValue)

      totalVolume.push({
        time,
        value: runeToCurrency(total).toFixedRaw(0),
      })
      swapVolume.push({
        time,
        value: runeToCurrency(swapValue).toFixedRaw(0),
      })
      addVolume.push({
        time,
        value: runeToCurrency(addValue).toFixedRaw(0),
      })
      withdrawVolume.push({
        time,
        value: runeToCurrency(withdrawValue).toFixedRaw(0),
      })
    })

    return {
      Total: {
        values: totalVolume,
        unit: chartValueUnit,
        type: 'bar',
      },
      Swap: {
        values: swapVolume,
        unit: chartValueUnit,
        type: 'bar',
      },
      Add: {
        values: addVolume,
        unit: chartValueUnit,
        type: 'bar',
      },
      Withdraw: {
        values: withdrawVolume,
        unit: chartValueUnit,
        type: 'bar',
      },
    }
  }, [
    swapHistory,
    liquidityHistory,
    isGlobalHistoryLoading,
    initialChartData,
    chartValueUnit,
    runeToCurrency,
  ])

  const liquidityChartData: ChartData = useMemo(() => {
    if (isGlobalHistoryLoading || !earningsHistory || !liquidityHistory) {
      return initialChartData
    }

    const earningsData = earningsHistory.intervals || []
    const tvlData = tvlHistory?.intervals || []

    // const tvl: ChartDetail[] = []
    const runePrice: ChartDetail[] = []
    const liquidityEarning: ChartDetail[] = []
    const liquidity: ChartDetail[] = []
    // const ILPaid: ChartDetail[] = []
    const bondingEarnings: ChartDetail[] = []

    earningsData.forEach((data, index) => {
      const time = Number(data?.startTime ?? 0)

      // midgard reponse doesn't match the type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tvlValue: any = tvlData[index]

      liquidity.push({
        time,
        value: Amount.fromMidgard(tvlValue?.totalRuneDepth)
          .mul(Amount.fromNormalAmount(tvlValue?.runePriceUSD))
          .toFixed(0),
      })

      // tvl.push({
      //   time,
      //   value: Amount.fromMidgard(tvlValue?.totalValueLocked)
      //     .mul(Amount.fromMidgard(tvlValue?.runePriceUSD))
      //     .toFixed(0),
      // })

      // ILPaid.push({
      //   time,
      //   value: runeToCurrency(
      //     Amount.fromMidgard(liquidityValue?.impermanentLossProtectionPaid),
      //   ).toFixedRaw(0),
      // })

      bondingEarnings.push({
        time,
        value: runeToCurrency(
          Amount.fromMidgard(data?.bondingEarnings),
        ).toFixedRaw(0),
      })

      runePrice.push({
        time,
        value: Amount.fromNormalAmount(data?.runePriceUSD).toFixed(2),
      })
      liquidityEarning.push({
        time,
        value: runeToCurrency(
          Amount.fromMidgard(data?.liquidityEarnings),
        ).toFixedRaw(0),
      })
    })

    return {
      // tvl: {
      //   values: tvl,
      //   unit: '$',
      // },
      Liquidity: {
        values: liquidity,
        unit: '$',
      },
      'LP Earning': {
        values: liquidityEarning,
        unit: chartValueUnit,
      },
      // 'IL Paid': {
      //   values: ILPaid,
      //   unit: chartValueUnit,
      // },
      'Bonding Earning': {
        values: bondingEarnings,
        unit: chartValueUnit,
      },
      '$RUNE Price': {
        values: runePrice,
        unit: '$',
      },
    }
  }, [
    tvlHistory,
    liquidityHistory,
    earningsHistory,
    isGlobalHistoryLoading,
    initialChartData,
    chartValueUnit,
    runeToCurrency,
  ])

  return (
    <Row gutter={[12, 12]}>
      <Col xs={24} md={12}>
        <Label size="big" color="primary">
          Volume
        </Label>
        <Chart
          chartIndexes={volumeChartIndexes}
          chartData={volumeChartData}
          selectedIndex={volumeChartIndex}
          selectChart={setVolumeChartIndex}
        />
      </Col>
      <Col xs={24} md={12}>
        <Label size="big" color="primary">
          Liquidity
        </Label>
        <Chart
          chartIndexes={liquidityChartIndexes}
          chartData={liquidityChartData}
          selectedIndex={liquidityChartIndex}
          selectChart={setLiquidityChartIndex}
        />
      </Col>
    </Row>
  )
}
