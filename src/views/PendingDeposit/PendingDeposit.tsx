import React, { useState, useMemo, useCallback } from 'react'

import { PanelView, FancyButton, Label } from 'components'
import { Asset, Pool } from 'multichain-sdk'

import { PendingDepositCard } from 'components/PendingDepositCard'

import { LiquidityProvider } from 'redux/midgard/types'
import { useWallet } from 'redux/wallet/hooks'

import { usePendingLP } from 'hooks/usePendingLP'

import { AddLiquidityPanel } from './Add'
import * as Styled from './PendingDeposit.style'

type Option = {
  type: 'add' | 'withdraw'
  data: LiquidityProvider
}

const PendingDepositView = () => {
  const [option, setOption] = useState<Option>()

  const { wallet } = useWallet()
  const {
    pools,
    pendingLP,
    hasPendingDeposit,
    getPendingDeposit,
  } = usePendingLP()

  const handleComplete = useCallback((data: LiquidityProvider) => {
    setOption({
      type: 'add',
      data,
    })
  }, [])
  const handleWithdraw = useCallback((data: LiquidityProvider) => {
    setOption({
      type: 'withdraw',
      data,
    })
  }, [])

  const renderPendingDeposit = useMemo(() => {
    if (!wallet) return null

    if (!hasPendingDeposit) {
      return <Label>You don't have pending deposit.</Label>
    }

    return (
      <>
        <Styled.ToolContainer>
          <FancyButton size="small" onClick={getPendingDeposit}>
            Check Pending Deposit
          </FancyButton>
        </Styled.ToolContainer>
        {Object.keys(pendingLP).map((poolIndex) => {
          const poolAsset = Asset.fromAssetString(poolIndex)
          const data = pendingLP[poolIndex]

          if (!poolAsset) return null
          return (
            <PendingDepositCard
              poolAsset={poolAsset}
              data={data}
              key={poolIndex}
              onComplete={() => handleComplete(data)}
              onWithdraw={() => handleWithdraw(data)}
            />
          )
        })}
      </>
    )
  }, [
    getPendingDeposit,
    handleComplete,
    handleWithdraw,
    pendingLP,
    hasPendingDeposit,
    wallet,
  ])

  const renderDeposit = useMemo(() => {
    if (!option || !wallet) return null

    const { data } = option
    const poolAsset = Asset.fromAssetString(data.asset)

    if (poolAsset) {
      const pool = Pool.byAsset(poolAsset, pools)

      if (pool) {
        return (
          <AddLiquidityPanel
            pools={pools}
            pool={pool}
            assetObj={poolAsset}
            data={data}
          />
        )
      }
    }
  }, [option, pools, wallet])

  return (
    <PanelView meta="Pending Deposit" poolAsset={Asset.BTC()} type="pending">
      {!wallet && <Label>Please connect wallet.</Label>}
      {renderPendingDeposit}
      {option?.type === 'add' && renderDeposit}
    </PanelView>
  )
}

export default PendingDepositView
