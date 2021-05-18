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
  Amount,
  Asset,
  Account,
  Pool,
  Price,
  Liquidity,
  AssetAmount,
  Percent,
  getEstimatedTxTime,
  SupportedChain,
} from 'multichain-sdk'

import { LiquidityProvider, TxTrackerType } from 'redux/midgard/types'

import { useBalance } from 'hooks/useBalance'
import { useMimir } from 'hooks/useMimir'
import { useNetworkFee } from 'hooks/useNetworkFee'
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
  const { account, getMaxBalance } = useBalance()
  const { submitTransaction, pollTransaction, setTxFailed } = useTxTracker()

  const { isFundsCapReached } = useMimir()

  const { inboundFee: inboundAssetFee } = useNetworkFee({
    inputAsset: pool.asset,
  })

  const { inboundFee: inboundRuneFee } = useNetworkFee({
    inputAsset: Asset.RUNE(),
  })

  const isAssetPending = useMemo(() => Number(data.pending_asset) > 0, [data])

  const pendingAmount = useMemo(() => {
    if (Number(data.pending_asset) > 0) {
      return Amount.fromMidgard(data.pending_asset)
    }

    return Amount.fromMidgard(data.pending_rune)
  }, [data])

  const [assetAmount, setAssetAmount] = useState<Amount>(
    isAssetPending ? pendingAmount : Amount.fromAssetAmount(0, 8),
  )
  const [runeAmount, setRuneAmount] = useState<Amount>(
    !isAssetPending ? pendingAmount : Amount.fromAssetAmount(0, 8),
  )
  const [percent, setPercent] = useState(0)
  const [visibleConfirmModal, setVisibleConfirmModal] = useState(false)

  const feeLabel = useMemo(() => {
    if (!isAssetPending) {
      return `${inboundRuneFee.toCurrencyFormat()} (${inboundRuneFee
        .totalPriceIn(Asset.USD(), pools)
        .toCurrencyFormat(2)})`
    }

    return `${inboundAssetFee.toCurrencyFormat()} (${inboundAssetFee
      .totalPriceIn(Asset.USD(), pools)
      .toCurrencyFormat(2)})`
  }, [isAssetPending, inboundAssetFee, inboundRuneFee, pools])

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
    if (account) {
      return Account.getAssetBalance(account, poolAsset).amount
    }

    // allow max amount if wallet is not connected
    return Amount.fromAssetAmount(10 ** 3, 8)
  }, [poolAsset, account])

  const maxPoolAssetBalance: Amount = useMemo(
    () => (isAssetPending ? pendingAmount : getMaxBalance(poolAsset)),
    [poolAsset, getMaxBalance, isAssetPending, pendingAmount],
  )

  const runeBalance: Amount = useMemo(() => {
    if (account) {
      return Account.getAssetBalance(account, Asset.RUNE()).amount
    }

    // allow max amount if wallet is not connected
    return Amount.fromAssetAmount(10 ** 3, 8)
  }, [account])

  const maxRuneBalance: Amount = useMemo(
    () => (!isAssetPending ? pendingAmount : getMaxBalance(Asset.RUNE())),
    [getMaxBalance, isAssetPending, pendingAmount],
  )

  const { maxSymAssetAmount, maxSymRuneAmount } = getMaxSymAmounts({
    runeAmount: maxRuneBalance,
    assetAmount: maxPoolAssetBalance,
    pool,
  })

  const handleChangePercent = useCallback(
    (p: number) => {
      setPercent(p)

      if (isAssetPending) {
        setRuneAmount(maxSymRuneAmount.mul(p).div(100))
      } else {
        setAssetAmount(maxSymAssetAmount.mul(p).div(100))
      }
    },
    [maxSymRuneAmount, maxSymAssetAmount, isAssetPending],
  )

  const handleChangePendingAmount = useCallback(
    (amount: Amount) => {
      if (isAssetPending) {
        const maxAmount = maxSymRuneAmount
        if (amount.gt(maxAmount)) {
          setRuneAmount(maxAmount)
        } else {
          setRuneAmount(amount)
          setPercent(amount.div(maxAmount).mul(100).assetAmount.toNumber())
        }
      } else {
        const maxAmount = maxSymAssetAmount
        if (amount.gt(maxAmount)) {
          setAssetAmount(maxAmount)
        } else {
          setAssetAmount(amount)
          setPercent(amount.div(maxAmount).mul(100).assetAmount.toNumber())
        }
      }
    },
    [isAssetPending, maxSymRuneAmount, maxSymAssetAmount],
  )

  const handleConfirmAdd = useCallback(async () => {
    setVisibleConfirmModal(false)
    if (account) {
      if (isAssetPending) {
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
      } else {
        const runeAssetAmount = undefined
        const poolAssetAmount = new AssetAmount(poolAsset, assetAmount)

        const inAssets = []
        inAssets.push({
          asset: poolAsset.toString(),
          amount: assetAmount.toSignificant(6),
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
            'sym_asset',
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
    }
  }, [
    isAssetPending,
    account,
    pool,
    poolAsset,
    runeAmount,
    assetAmount,
    submitTransaction,
    pollTransaction,
    setTxFailed,
  ])

  const handleCancel = useCallback(() => {
    setVisibleConfirmModal(false)
  }, [])

  const handleAddLiquidity = useCallback(() => {
    if (!account) {
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
  }, [account, isFundsCapReached])

  const renderConfirmModalContent = useMemo(() => {
    const title = isAssetPending
      ? `${runeAmount.toSignificant(6)} RUNE`
      : `${assetAmount.toSignificant(6)} ${poolAsset.ticker}`
    const estimatedTime = isAssetPending
      ? getEstimatedTxTime({
          chain: THORChain,
          amount: runeAmount,
        })
      : getEstimatedTxTime({
          chain: poolAsset.chain as SupportedChain,
          amount: assetAmount,
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
  }, [
    runeAmount,
    addLiquiditySlip,
    poolShareEst,
    feeLabel,
    isAssetPending,
    poolAsset,
    assetAmount,
  ])

  const isAddLiquidityValid = useMemo(() => {
    return runeAmount.gt(0)
  }, [runeAmount])

  return (
    <Styled.ContentPanel>
      <AssetInputCard
        title="Pending"
        asset={poolAsset}
        amount={assetAmount}
        balance={poolAssetBalance}
        usdPrice={poolAssetPriceInUSD}
        inputProps={{ disabled: isAssetPending }}
        wallet={account || undefined}
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
        onChange={handleChangePendingAmount}
        wallet={account || undefined}
        inputProps={{ disabled: !isAssetPending }}
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
