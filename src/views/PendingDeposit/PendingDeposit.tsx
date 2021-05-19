import React, { useState, useMemo, useCallback } from 'react'

import { THORChain } from '@xchainjs/xchain-thorchain'
import {
  PanelView,
  FancyButton,
  Label,
  ConfirmModal,
  Information,
  Notification,
} from 'components'
import { Asset, Pool, Amount, Percent } from 'multichain-sdk'

import { PendingDepositCard } from 'components/PendingDepositCard'

import { LiquidityProvider, TxTrackerType } from 'redux/midgard/types'
import { useWallet } from 'redux/wallet/hooks'

import { usePendingLP } from 'hooks/usePendingLP'
import { useTxTracker } from 'hooks/useTxTracker'

import { multichain } from 'services/multichain'

import { TX_FEE_TOOLTIP_LABEL } from 'settings/constants/label'

import { AddLiquidityPanel } from './Add'
import * as Styled from './PendingDeposit.style'

type Option = {
  type: 'add' | 'withdraw'
  data: LiquidityProvider
}

const PendingDepositView = () => {
  const { wallet } = useWallet()
  const { submitTransaction, pollTransaction, setTxFailed } = useTxTracker()
  const [option, setOption] = useState<Option>()

  const [visibleConfirmModal, setVisibleConfirmModal] = useState(false)

  const {
    pools,
    pendingLP,
    pendingLPLoading,
    hasPendingDeposit,
    getPendingDeposit,
  } = usePendingLP()

  const poolAsset = useMemo(() => {
    if (!option) return null

    const { data } = option
    return Asset.fromAssetString(data.asset)
  }, [option])
  const pool = useMemo(() => {
    if (!poolAsset) return null
    return Pool.byAsset(poolAsset, pools)
  }, [poolAsset, pools])

  const handleComplete = useCallback((data: LiquidityProvider) => {
    setOption({
      type: 'add',
      data,
    })
  }, [])

  const handleWithdrawLiquidity = useCallback(() => {
    if (wallet) {
      setVisibleConfirmModal(true)
    } else {
      Notification({
        type: 'info',
        message: 'Wallet Not Found',
        description: 'Please connect wallet',
      })
    }
  }, [wallet])

  const handleWithdraw = useCallback(
    (data: LiquidityProvider) => {
      setOption({
        type: 'withdraw',
        data,
      })
      handleWithdrawLiquidity()
    },
    [handleWithdrawLiquidity],
  )

  const renderPendingDeposit = useMemo(() => {
    if (!wallet) return null

    if (!hasPendingDeposit) {
      return (
        <>
          <Styled.ToolContainer>
            <FancyButton
              size="small"
              onClick={getPendingDeposit}
              loading={pendingLPLoading}
            >
              Check Pending Deposit
            </FancyButton>
          </Styled.ToolContainer>
          <br />
          <Label>You don't have any pending deposit.</Label>
          <Label>It takes some time for the pending deposit to show up.</Label>
        </>
      )
    }

    return (
      <>
        <Styled.ToolContainer>
          <FancyButton
            size="small"
            onClick={getPendingDeposit}
            loading={pendingLPLoading}
          >
            Check Pending Deposit
          </FancyButton>
        </Styled.ToolContainer>
        {Object.keys(pendingLP).map((poolIndex) => {
          const poolAssetObj = Asset.fromAssetString(poolIndex)
          const data = pendingLP[poolIndex]

          if (!poolAssetObj) return null
          return (
            <PendingDepositCard
              poolAsset={poolAssetObj}
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
    pendingLPLoading,
    hasPendingDeposit,
    wallet,
  ])

  const renderDeposit = useMemo(() => {
    if (!option || !wallet || !poolAsset || !pool) return null

    const { data } = option

    return (
      <AddLiquidityPanel
        pools={pools}
        pool={pool}
        assetObj={poolAsset}
        data={data}
      />
    )
  }, [option, pools, pool, poolAsset, wallet])

  const pendingAsset = useMemo(() => {
    if (!option) return null
    const { data } = option
    if (Number(data.pending_asset) > 0) {
      return poolAsset
    }

    return Asset.RUNE()
  }, [option, poolAsset])

  const assetAmount = useMemo(() => {
    if (!option) return null
    const { data } = option
    if (Number(data.pending_asset) > 0) {
      return Amount.fromMidgard(option.data.pending_asset)
    }

    return Amount.fromMidgard(option.data.pending_rune)
  }, [option])

  const handleConfirmWithdraw = useCallback(async () => {
    if (!poolAsset || !assetAmount || !pool) return null

    setVisibleConfirmModal(false)
    if (wallet && pendingAsset) {
      const poolAssetString = poolAsset.toString()
      let trackId = ''
      try {
        const outAssets = [
          {
            asset: pendingAsset.toString(),
            amount: assetAmount.toSignificant(6),
          },
        ]

        // register to tx tracker
        trackId = submitTransaction({
          type: TxTrackerType.Withdraw,
          submitTx: {
            inAssets: [],
            outAssets,
            poolAsset: poolAssetString,
          },
        })

        const txID = await multichain.withdraw({
          pool,
          percent: new Percent(100),
          from: 'sym',
          to: 'sym',
        })

        // start polling
        pollTransaction({
          type: TxTrackerType.Withdraw,
          uuid: trackId,
          submitTx: {
            inAssets: [],
            outAssets,
            poolAsset: poolAssetString,
            txID,
            withdrawChain: THORChain,
          },
        })
      } catch (error) {
        console.log(error)
        setTxFailed(trackId)

        Notification({
          type: 'error',
          message: 'Submit Transaction Failed.',
          duration: 20,
        })
      }
    }
  }, [
    wallet,
    pool,
    poolAsset,
    pendingAsset,
    assetAmount,
    submitTransaction,
    pollTransaction,
    setTxFailed,
  ])

  const handleCancel = useCallback(() => {
    setVisibleConfirmModal(false)
  }, [])

  const renderWithdrawConfirmModalContent = useMemo(() => {
    if (!assetAmount || !pendingAsset) return null

    return (
      <Styled.ConfirmModalContent>
        <Information
          title="Withdraw"
          description={`Pending ${assetAmount.toSignificant(
            6,
          )} ${pendingAsset.ticker.toUpperCase()}`}
        />
        <Information
          title="Transaction Fee"
          description="0.02 RUNE"
          tooltip={TX_FEE_TOOLTIP_LABEL}
        />
      </Styled.ConfirmModalContent>
    )
  }, [pendingAsset, assetAmount])

  return (
    <PanelView meta="Pending Deposit" poolAsset={Asset.BTC()} type="pending">
      {!wallet && <Label>Please connect wallet.</Label>}
      {renderPendingDeposit}
      {option?.type === 'add' && renderDeposit}
      <ConfirmModal
        visible={visibleConfirmModal}
        onOk={handleConfirmWithdraw}
        onCancel={handleCancel}
        inputAssets={[Asset.RUNE()]}
      >
        {renderWithdrawConfirmModalContent}
      </ConfirmModal>
    </PanelView>
  )
}

export default PendingDepositView
