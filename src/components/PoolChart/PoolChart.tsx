import React, { useEffect, useMemo, useState } from 'react'

import { useDispatch } from 'react-redux'

import { Grid } from 'antd'
import { Pool, Amount, Asset } from 'multichain-sdk'

import { useApp } from 'redux/app/hooks'
import { useGlobalState } from 'redux/hooks'
import { useMidgard } from 'redux/midgard/hooks'

import { Chart } from '../Chart'
import { ChartDetail, ChartValues, ChartData } from '../Chart/types'

export type PoolChartProps = {
  pool: Pool
}

export const PoolChart = ({ pool, ...otherProps }: PoolChartProps) => {
  const dispatch = useDispatch()
  const isDesktopView = Grid.useBreakpoint()?.md ?? true

  const { baseCurrency } = useApp()
  const { runeToCurrency } = useGlobalState()

  const {
    getPoolHistory,
    swapHistory,
    swapHistoryLoading,
    depthHistory,
    depthHistoryLoading,
    liquidityHistory,
    liquidityHistoryLoading,
  } = useMidgard()

  const isLoading = useMemo(
    () => depthHistoryLoading || liquidityHistoryLoading || swapHistoryLoading,
    [depthHistoryLoading, liquidityHistoryLoading, swapHistoryLoading],
  )

  useEffect(() => {
    getPoolHistory(pool.asset.toString())
  }, [dispatch, getPoolHistory, pool])

  const [chartIndex, setChartIndex] = useState('Liquidity')
  const chartIndexes = useMemo(
    () =>
      isDesktopView
        ? ['Liquidity', 'Volume', 'Price']
        : ['Liquidity', 'Volume'],
    [isDesktopView],
  )

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

    chartIndexes.forEach((index) => {
      initialData[index] = {
        values: defaultChartValues,
        loading: true,
      }
    })

    return initialData
  }, [chartIndexes])

  const chartData: ChartData = useMemo(() => {
    if (isLoading || !depthHistory || !liquidityHistory || !swapHistory) {
      return initialChartData
    }

    const depthData = depthHistory.intervals || []
    const liquidityData = liquidityHistory.intervals || []
    const swapData = swapHistory.intervals || []

    const priceChart: ChartDetail[] = []
    const volumeChart: ChartDetail[] = []
    const liquidityChart: ChartDetail[] = []

    depthData.forEach((data, index) => {
      const liquidityValue = liquidityData[index]
      const swapValues = swapData[index]
      const time = Number(data?.startTime ?? 0)

      const swapValue = Amount.fromMidgard(swapValues?.totalVolume)
      const addValue = Amount.fromMidgard(liquidityValue?.addLiquidityVolume)
      const withdrawValue = Amount.fromMidgard(liquidityValue?.withdrawVolume)

      const total = swapValue.add(addValue).add(withdrawValue)
      const liquidity = Amount.fromMidgard(data?.runeDepth).mul(2)
      const usdPrice = Amount.fromNormalAmount(data?.assetPriceUSD)

      priceChart.push({
        time,
        value: usdPrice.assetAmount.toString(),
      })
      volumeChart.push({
        time,
        value: runeToCurrency(total).toFixedRaw(0),
      })
      liquidityChart.push({
        time,
        value: runeToCurrency(liquidity).toFixedRaw(0),
      })
    })

    return {
      Volume: {
        values: volumeChart,
        unit: chartValueUnit,
        type: 'bar',
      },
      Liquidity: {
        values: liquidityChart,
        unit: chartValueUnit,
      },
      Price: {
        values: priceChart,
        unit: '$',
      },
    }
  }, [
    depthHistory,
    liquidityHistory,
    swapHistory,
    isLoading,
    initialChartData,
    runeToCurrency,
    chartValueUnit,
  ])

  return (
    <Chart
      chartIndexes={chartIndexes}
      chartData={chartData}
      selectedIndex={chartIndex}
      selectChart={setChartIndex}
      {...otherProps}
    />
  )
}
