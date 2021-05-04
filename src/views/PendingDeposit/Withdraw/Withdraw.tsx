import React, { useMemo, useState, useCallback } from 'react'

import { THORChain } from '@xchainjs/xchain-thorchain'
import {
  Slider,
  ConfirmModal,
  Information,
  Notification,
  FancyButton,
  Label,
} from 'components'
import { Amount, Pool, Percent, Price } from 'multichain-sdk'

import { LiquidityProvider, TxTrackerType } from 'redux/midgard/types'
import { useWallet } from 'redux/wallet/hooks'

import { useTxTracker } from 'hooks/useTxTracker'

import { multichain } from 'services/multichain'

import { TX_FEE_TOOLTIP_LABEL } from 'settings/constants/label'

import * as Styled from './Withdraw.style'

export const WithdrawPanel = ({
  pool,
  pools,
  data,
}: {
  pool: Pool
  pools: Pool[]
  data: LiquidityProvider
}) => {
  const { wallet } = useWallet()
  const { submitTransaction, pollTransaction, setTxFailed } = useTxTracker()

  const poolAsset = useMemo(() => pool.asset, [pool])

  const [percent, setPercent] = useState(0)
  const [visibleConfirmModal, setVisibleConfirmModal] = useState(false)

  const assetAmount = useMemo(() => {
    return Amount.fromMidgard(data.pending_asset).mul(percent).div(100)
  }, [data, percent])

  const assetPriceInUSD = useMemo(
    () =>
      new Price({
        baseAsset: pool.asset,
        pools,
        priceAmount: assetAmount,
      }),
    [pool, assetAmount, pools],
  )

  const handleChangePercent = useCallback((p: number) => {
    setPercent(p)
  }, [])

  const handleConfirmWithdraw = useCallback(async () => {
    setVisibleConfirmModal(false)
    if (wallet) {
      const poolAssetString = pool.asset.toString()
      let trackId = ''
      try {
        const outAssets = [
          {
            asset: pool.asset.toString(),
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
          percent: new Percent(percent),
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
    percent,
    assetAmount,
    submitTransaction,
    pollTransaction,
    setTxFailed,
  ])

  const handleCancel = useCallback(() => {
    setVisibleConfirmModal(false)
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

  const renderConfirmModalContent = useMemo(() => {
    return (
      <Styled.ConfirmModalContent>
        <Information
          title="Withdraw"
          description={`Pending ${assetAmount.toSignificant(
            6,
          )} ${poolAsset.ticker.toUpperCase()}`}
        />
        <Information
          title="Transaction Fee"
          description="0.02 RUNE"
          tooltip="Gas fee used for submitting the transaction using the thorchain protocol"
        />
      </Styled.ConfirmModalContent>
    )
  }, [assetAmount, poolAsset])

  const title = useMemo(() => `Withdraw Pending ${poolAsset.ticker}`, [
    poolAsset,
  ])

  return (
    <Styled.ContentPanel>
      <Label>{title}</Label>
      <Styled.ToolContainer>
        <Styled.SliderWrapper>
          <Slider value={percent} onChange={handleChangePercent} withLabel />
        </Styled.SliderWrapper>
      </Styled.ToolContainer>

      <Styled.DetailContent>
        <Information
          title={poolAsset.ticker}
          description={`${assetAmount.toSignificant(6)} ${
            poolAsset.ticker
          } (${assetPriceInUSD.toCurrencyFormat(2)})`}
          tooltip="You are withdrawing Pending Asset from the liquidity"
        />
        <Information
          title="Transaction Fee"
          description="0.02 RUNE"
          tooltip={TX_FEE_TOOLTIP_LABEL}
        />
      </Styled.DetailContent>
      {wallet && (
        <Styled.ConfirmButtonContainer>
          <FancyButton onClick={handleWithdrawLiquidity}>Withdraw</FancyButton>
        </Styled.ConfirmButtonContainer>
      )}
      <ConfirmModal
        visible={visibleConfirmModal}
        onOk={handleConfirmWithdraw}
        onCancel={handleCancel}
      >
        {renderConfirmModalContent}
      </ConfirmModal>
    </Styled.ContentPanel>
  )
}
