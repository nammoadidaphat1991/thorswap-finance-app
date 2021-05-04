import React, { useMemo, useState, useCallback } from 'react'

import { PlusOutlined } from '@ant-design/icons'
import { THORChain } from '@xchainjs/xchain-thorchain'
import {
  AssetInputCard,
  Slider,
  ConfirmModal,
  Information,
  Notification,
  FancyButton,
} from 'components'
import {
  getInputAssetsForAdd,
  Amount,
  Asset,
  getAssetBalance,
  Pool,
  Price,
  Liquidity,
  AssetAmount,
  Percent,
  getEstimatedTxTime,
} from 'multichain-sdk'

import { LiquidityProvider, TxTrackerType } from 'redux/midgard/types'

import { useBalance } from 'hooks/useBalance'
import { useMimir } from 'hooks/useMimir'
import { useTxTracker } from 'hooks/useTxTracker'

import { multichain } from 'services/multichain'

import {
  TX_FEE_TOOLTIP_LABEL,
  SLIP_TOOLTIP_LABEL,
  ESTIMATED_TIME_LABEL,
  ESTIMATED_POOL_SHARE_LABEL,
} from 'settings/constants/label'

import * as Styled from './Add.style'
import { getMaxSymAmounts } from './utils'

export const AddLiquidityPanel = ({
  pool,
  pools,
  assetObj: poolAsset,
  data,
}: {
  assetObj: Asset
  pool: Pool
  pools: Pool[]
  data: LiquidityProvider
}) => {
  const { wallet, getMaxBalance } = useBalance()
  const { submitTransaction, pollTransaction, setTxFailed } = useTxTracker()

  const { isFundsCapReached } = useMimir()

  const inputAssets = useMemo(() => getInputAssetsForAdd({ wallet, pools }), [
    wallet,
    pools,
  ])

  const assetAmount = Amount.fromMidgard(data.pending_asset)
  const [runeAmount, setRuneAmount] = useState<Amount>(
    Amount.fromAssetAmount(0, 8),
  )
  const [percent, setPercent] = useState(0)
  const [visibleConfirmModal, setVisibleConfirmModal] = useState(false)

  const feeLabel = useMemo(() => {
    return '0.02 RUNE'
  }, [])

  const liquidityUnits = useMemo(() => {
    return Amount.fromMidgard(data.units)
  }, [data])

  const liquidityEntity = useMemo(() => {
    return new Liquidity(pool, liquidityUnits)
  }, [pool, liquidityUnits])

  const addLiquiditySlip = useMemo(() => {
    return (liquidityEntity.getLiquiditySlip(
      runeAmount,
      assetAmount,
    ) as Percent).toFixed(2)
  }, [liquidityEntity, assetAmount, runeAmount])

  const poolShareEst = useMemo(() => {
    return liquidityEntity.getPoolShareEst(runeAmount, assetAmount).toFixed(3)
  }, [liquidityEntity, assetAmount, runeAmount])

  const poolAssetPriceInUSD = useMemo(
    () =>
      new Price({
        baseAsset: poolAsset,
        pools,
        priceAmount: assetAmount,
      }),
    [poolAsset, assetAmount, pools],
  )

  const runeAssetPriceInUSD = useMemo(
    () =>
      new Price({
        baseAsset: Asset.RUNE(),
        pools,
        priceAmount: runeAmount,
      }),
    [runeAmount, pools],
  )

  const poolAssetBalance: Amount = useMemo(() => {
    if (wallet) {
      return getAssetBalance(poolAsset, wallet).amount
    }

    // allow max amount if wallet is not connected
    return Amount.fromAssetAmount(10 ** 3, 8)
  }, [poolAsset, wallet])

  const maxPoolAssetBalance: Amount = useMemo(() => getMaxBalance(poolAsset), [
    poolAsset,
    getMaxBalance,
  ])

  const runeBalance: Amount = useMemo(() => {
    if (wallet) {
      return getAssetBalance(Asset.RUNE(), wallet).amount
    }

    // allow max amount if wallet is not connected
    return Amount.fromAssetAmount(10 ** 3, 8)
  }, [wallet])

  const maxRuneBalance: Amount = useMemo(() => getMaxBalance(Asset.RUNE()), [
    getMaxBalance,
  ])

  const { maxSymRuneAmount } = getMaxSymAmounts({
    runeAmount: maxRuneBalance,
    assetAmount: maxPoolAssetBalance,
    pool,
  })

  const handleChangePercent = useCallback(
    (p: number) => {
      setPercent(p)
      setRuneAmount(maxSymRuneAmount.mul(p).div(100))
    },
    [maxSymRuneAmount],
  )

  const handleChangeRuneAmount = useCallback(
    (amount: Amount) => {
      const maxAmount = maxSymRuneAmount
      if (amount.gt(maxAmount)) {
        setRuneAmount(maxAmount)
      } else {
        setRuneAmount(amount)
        setPercent(amount.div(maxAmount).mul(100).assetAmount.toNumber())
      }
    },
    [maxSymRuneAmount],
  )

  const handleConfirmAdd = useCallback(async () => {
    setVisibleConfirmModal(false)
    if (wallet) {
      const runeAssetAmount = new AssetAmount(Asset.RUNE(), runeAmount)
      const poolAssetAmount = undefined

      const inAssets = []
      inAssets.push({
        asset: Asset.RUNE().toString(),
        amount: runeAmount.toSignificant(6),
      })
      // register to tx tracker
      const trackId = submitTransaction({
        type: TxTrackerType.AddLiquidity,
        submitTx: {
          inAssets,
          outAssets: [],
          poolAsset: poolAsset.ticker,
        },
      })

      try {
        const txRes = await multichain.addLiquidity(
          {
            pool,
            runeAmount: runeAssetAmount,
            assetAmount: poolAssetAmount,
          },
          'sym_rune',
        )

        const runeTxHash = txRes?.runeTx
        const assetTxHash = txRes?.assetTx

        if (runeTxHash || assetTxHash) {
          // start polling
          pollTransaction({
            type: TxTrackerType.AddLiquidity,
            uuid: trackId,
            submitTx: {
              inAssets,
              outAssets: [],
              txID: runeTxHash || assetTxHash,
              addTx: {
                runeTxID: runeTxHash,
                assetTxID: assetTxHash,
              },
              poolAsset: poolAsset.ticker,
            },
          })
        }
      } catch (error) {
        setTxFailed(trackId)
        Notification({
          type: 'error',
          message: 'Submit Transaction Failed.',
          duration: 20,
        })
        console.log(error)
      }
    }
  }, [
    wallet,
    pool,
    poolAsset,
    runeAmount,
    submitTransaction,
    pollTransaction,
    setTxFailed,
  ])

  const handleCancel = useCallback(() => {
    setVisibleConfirmModal(false)
  }, [])

  const handleAddLiquidity = useCallback(() => {
    if (!wallet) {
      Notification({
        type: 'info',
        message: 'Wallet Not Found',
        description: 'Please connect wallet',
      })
      return
    }

    if (isFundsCapReached) {
      Notification({
        type: 'info',
        message: 'Funds Cap Reached',
        description:
          'You cannot add due to 90% Funds Cap has been reached. Please try again later.',
      })
      return
    }

    setVisibleConfirmModal(true)
  }, [wallet, isFundsCapReached])

  const renderConfirmModalContent = useMemo(() => {
    const title = `${runeAmount.toSignificant(6)} RUNE`
    const estimatedTime = getEstimatedTxTime({
      chain: THORChain,
      amount: runeAmount,
    })

    return (
      <Styled.ConfirmModalContent>
        <Information title="Add" description={title} />
        <br />
        <Information
          title="Slip"
          description={addLiquiditySlip}
          tooltip={SLIP_TOOLTIP_LABEL}
        />
        <Information
          title="Pool Share Estimated"
          description={poolShareEst}
          tooltip={ESTIMATED_POOL_SHARE_LABEL}
        />
        <Information
          title="Transaction Fee"
          description={feeLabel}
          tooltip={TX_FEE_TOOLTIP_LABEL}
        />
        <Information
          title="Estimated Time"
          description={estimatedTime}
          tooltip={ESTIMATED_TIME_LABEL}
        />
      </Styled.ConfirmModalContent>
    )
  }, [runeAmount, addLiquiditySlip, poolShareEst, feeLabel])

  const isAddLiquidityValid = useMemo(() => {
    return runeAmount.gt(0)
  }, [runeAmount])

  return (
    <Styled.ContentPanel>
      <AssetInputCard
        title="Pending"
        asset={poolAsset}
        assets={inputAssets}
        amount={assetAmount}
        balance={poolAssetBalance}
        usdPrice={poolAssetPriceInUSD}
        inputProps={{ disabled: true }}
        selectDisabled
      />
      <Styled.ToolContainer>
        <Styled.SliderWrapper>
          <Slider value={percent} onChange={handleChangePercent} withLabel />
        </Styled.SliderWrapper>
        <Styled.SwitchPair>
          <PlusOutlined />
        </Styled.SwitchPair>
      </Styled.ToolContainer>
      <AssetInputCard
        title="Add To Complete"
        asset={Asset.RUNE()}
        amount={runeAmount}
        usdPrice={runeAssetPriceInUSD}
        selectDisabled
        balance={runeBalance}
        onChange={handleChangeRuneAmount}
      />

      <Styled.DetailContent>
        <Information
          title="Slip"
          description={addLiquiditySlip}
          tooltip={SLIP_TOOLTIP_LABEL}
        />
        <Information
          title="Pool Share Estimated"
          description={poolShareEst}
          tooltip={ESTIMATED_POOL_SHARE_LABEL}
        />
        <Information
          title="Transaction Fee"
          description={feeLabel}
          tooltip={TX_FEE_TOOLTIP_LABEL}
        />
      </Styled.DetailContent>

      <Styled.ConfirmButtonContainer>
        <FancyButton onClick={handleAddLiquidity} error={!isAddLiquidityValid}>
          Add Liquidity
        </FancyButton>
      </Styled.ConfirmButtonContainer>

      <ConfirmModal
        visible={visibleConfirmModal}
        onOk={handleConfirmAdd}
        onCancel={handleCancel}
      >
        {renderConfirmModalContent}
      </ConfirmModal>
    </Styled.ContentPanel>
  )
}
