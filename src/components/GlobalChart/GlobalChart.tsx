import React, { useEffect, useMemo, useState } from 'react'

import { Grid, Row, Col } from 'antd'
import { Amount } from 'multichain-sdk'

import { Label } from 'components/UIElements'

// import { useApp } from 'redux/app/hooks'
// import { useGlobalState } from 'redux/hooks'
import { useMidgard } from 'redux/midgard/hooks'

import { Chart } from '../Chart'
import { ChartDetail, ChartValues, ChartData } from '../Chart/types'

// display volume and earning time series graph
export const GlobalChart = () => {
  const isDesktopView = Grid.useBreakpoint()?.md ?? true

  // const { baseCurrency } = useApp()
  // const { runeToCurrency } = useGlobalState()

  const {
    getGlobalHistory,
    isGlobalHistoryLoading,
    earningsHistory,
    swapHistory,
    liquidityHistory,
  } = useMidgard()

  useEffect(() => {
    getGlobalHistory()
  }, [getGlobalHistory])

  const [volumeChartIndex, setVolumeChartIndex] = useState('Total')
  const [liquidityChartIndex, setLiquidityChartIndex] = useState('Rune Price')
  const volumeChartIndexes = useMemo(
    () =>
      isDesktopView ? ['Total', 'Swap', 'Add', 'Withdraw'] : ['Total', 'Swap'],
    [isDesktopView],
  )
  const liquidityChartIndexes = useMemo(
    () =>
      isDesktopView
        ? ['Rune Price', 'Liquidity Earning']
        : ['Rune Price', 'Liquidity Earning'],
    [isDesktopView],
  )

  const chartValueUnit = 'ᚱ'
  // const chartValueUnit = useMemo(() => {
  //   const baseCurrencyAsset = Asset.fromAssetString(baseCurrency)
  //   if (!baseCurrencyAsset) return 'ᚱ'
  //   if (baseCurrencyAsset?.isRUNE()) return 'ᚱ'
  //   if (baseCurrencyAsset?.ticker === 'USD') return '$'

  //   return baseCurrencyAsset.ticker
  // }, [baseCurrency])

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

      swapVolume.push({
        time,
        value: swapValue.assetAmount.toString(),
      })
      addVolume.push({
        time,
        value: addValue.assetAmount.toString(),
      })
      withdrawVolume.push({
        time,
        value: withdrawValue.assetAmount.toString(),
      })
      totalVolume.push({
        time,
        value: total.assetAmount.toString(),
      })
    })

    return {
      Total: {
        values: totalVolume,
        unit: chartValueUnit,
      },
      Swap: {
        values: swapVolume,
        unit: chartValueUnit,
      },
      Add: {
        values: addVolume,
        unit: chartValueUnit,
      },
      Withdraw: {
        values: withdrawVolume,
        unit: chartValueUnit,
      },
    }
  }, [
    swapHistory,
    liquidityHistory,
    isGlobalHistoryLoading,
    initialChartData,
    chartValueUnit,
  ])

  const liquidityChartData: ChartData = useMemo(() => {
    if (isGlobalHistoryLoading || !earningsHistory) {
      return initialChartData
    }

    const earningsData = earningsHistory.intervals || []

    const runePrice: ChartDetail[] = []
    const liquidityEarning: ChartDetail[] = []

    earningsData.forEach((data) => {
      const time = Number(data?.startTime ?? 0)

      runePrice.push({
        time,
        value: Amount.fromNormalAmount(data?.runePriceUSD).toFixed(2),
      })
      liquidityEarning.push({
        time,
        value: Amount.fromMidgard(data?.liquidityEarnings).toFixed(2),
      })
    })

    return {
      'Rune Price': {
        values: runePrice,
        unit: '$',
      },
      'Liquidity Earning': {
        values: liquidityEarning,
        unit: chartValueUnit,
      },
    }
  }, [
    earningsHistory,
    isGlobalHistoryLoading,
    initialChartData,
    chartValueUnit,
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
