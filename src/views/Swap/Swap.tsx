import React, { useEffect, useMemo, useState, useCallback } from 'react'

import { useHistory, useParams } from 'react-router'

import { SwapOutlined } from '@ant-design/icons'
import {
  PanelView,
  AssetInputCard,
  Slider,
  ConfirmModal,
  Information,
  Notification,
  IconButton,
  FancyButton,
  PriceRate,
} from 'components'
import {
  getInputAssets,
  Amount,
  Asset,
  AssetAmount,
  getWalletAddressByChain,
  Swap,
  Percent,
  Price,
  getAssetBalance,
  getEstimatedTxTime,
  SupportedChain,
} from 'multichain-sdk'

import { useApp } from 'redux/app/hooks'
import { useMidgard } from 'redux/midgard/hooks'
import { TxTrackerStatus, TxTrackerType } from 'redux/midgard/types'

import { useApprove } from 'hooks/useApprove'
import { useBalance } from 'hooks/useBalance'
import { useNetworkFee } from 'hooks/useNetworkFee'
import { useTxTracker } from 'hooks/useTxTracker'

import { multichain } from 'services/multichain'

import { getSwapRoute } from 'settings/constants'
import {
  TX_FEE_TOOLTIP_LABEL,
  SLIP_TOOLTIP_LABEL,
  ESTIMATED_TIME_LABEL,
  MIN_RECEIVED_LABEL,
} from 'settings/constants/label'

import * as Styled from './Swap.style'
import { Pair } from './types'
import { getSwapPair } from './utils'

const SwapView = () => {
  const { pair } = useParams<{ pair: string }>()
  const [swapPair, setSwapPair] = useState<Pair>()

  useEffect(() => {
    const getPair = async () => {
      const swapPairData = await getSwapPair(pair)

      if (swapPairData) {
        setSwapPair(swapPairData)
      }
    }

    getPair()
  }, [pair])

  if (swapPair) {
    const { inputAsset, outputAsset } = swapPair
    return <SwapPage inputAsset={inputAsset} outputAsset={outputAsset} />
  }

  return null
}

const SwapPage = ({ inputAsset, outputAsset }: Pair) => {
  const history = useHistory()
  const { wallet, getMaxBalance } = useBalance()
  const { pools: allPools, poolLoading } = useMidgard()
  const { slippageTolerance } = useApp()
  const { submitTransaction, pollTransaction, setTxFailed } = useTxTracker()
  const { isApproved, assetApproveStatus } = useApprove(inputAsset, !!wallet)

  const { inboundFee, outboundFee, totalFee } = useNetworkFee({
    inputAsset,
    outputAsset,
  })

  const pools = useMemo(
    () => allPools.filter((data) => data.detail.status === 'available'),
    [allPools],
  )
  const poolAssets = useMemo(() => {
    const assets = pools.map((pool) => pool.asset)
    assets.push(Asset.RUNE())

    return assets
  }, [pools])

  const inputAssets = useMemo(() => getInputAssets({ wallet, pools }), [
    wallet,
    pools,
  ])

  const [inputAmount, setInputAmount] = useState<Amount>(
    Amount.fromAssetAmount(0, 8),
  )
  const [percent, setPercent] = useState(0)
  const [recipient, setRecipient] = useState('')
  const [visibleConfirmModal, setVisibleConfirmModal] = useState(false)
  const [visibleApproveModal, setVisibleApproveModal] = useState(false)

  // NOTE: temporary disable BTC->ERC20 swap for memo issue
  const isSwapSupported = useMemo(() => {
    if (
      inputAsset.isBTC() &&
      outputAsset.chain === 'ETH' &&
      !outputAsset.isETH()
    ) {
      return false
    }

    return true
  }, [inputAsset, outputAsset])

  const swap: Swap | null = useMemo(() => {
    if (poolLoading) return null

    try {
      const inputAssetAmount = new AssetAmount(inputAsset, inputAmount)

      const inboundFeeInInputAsset = new AssetAmount(
        inputAsset,
        Amount.fromAssetAmount(
          inboundFee.totalPriceIn(inputAsset, pools).price,
          inputAsset.decimal,
        ),
      )

      const outboundFeeInOutputAsset = outboundFee
        ? new AssetAmount(
            outputAsset,
            Amount.fromAssetAmount(
              outboundFee.totalPriceIn(outputAsset, pools).price,
              outputAsset.decimal,
            ),
          )
        : new AssetAmount(
            outputAsset,
            Amount.fromAssetAmount(0, outputAsset.decimal),
          )

      return new Swap({
        inputAsset,
        outputAsset,
        pools,
        amount: inputAssetAmount,
        slip: slippageTolerance,
        fee: {
          inboundFee: inboundFeeInInputAsset,
          outboundFee: outboundFeeInOutputAsset,
        },
      })
    } catch (error) {
      console.log(error)
      return null
    }
  }, [
    inputAsset,
    outputAsset,
    pools,
    inputAmount,
    slippageTolerance,
    poolLoading,
    inboundFee,
    outboundFee,
  ])

  const outputAmount: Amount = useMemo(() => {
    if (swap) {
      return swap.outputAmountAfterFee.amount
    }

    return Amount.fromAssetAmount(0, 8)
  }, [swap])

  const slipPercent: Percent = useMemo(
    () => (swap ? swap.slip : new Percent(0)),
    [swap],
  )

  const minReceive: Amount = useMemo(
    () => (swap ? swap.minOutputAmount : Amount.fromAssetAmount(0, 8)),
    [swap],
  )

  const inputAssetPriceInUSD = useMemo(
    () =>
      new Price({
        baseAsset: inputAsset,
        pools,
        priceAmount: inputAmount,
      }),
    [inputAsset, inputAmount, pools],
  )

  const outputAssetPriceInUSD = useMemo(
    () =>
      new Price({
        baseAsset: outputAsset,
        pools,
        priceAmount: outputAmount,
      }),
    [outputAsset, outputAmount, pools],
  )

  useEffect(() => {
    if (wallet) {
      const address = getWalletAddressByChain(wallet, outputAsset.chain)
      setRecipient(address || '')
    }
  }, [wallet, outputAsset])

  const maxInputBalance: Amount = useMemo(() => {
    return getMaxBalance(inputAsset)
  }, [inputAsset, getMaxBalance])

  const inputAssetBalance: Amount = useMemo(() => {
    if (!wallet) {
      // allow max amount for emulation if wallet is not connected
      return Amount.fromAssetAmount(10 ** 3, 8)
    }

    return getAssetBalance(inputAsset, wallet)
  }, [inputAsset, wallet])

  const handleSelectInputAsset = useCallback(
    (input: Asset) => {
      history.push(getSwapRoute(input, outputAsset))
    },
    [history, outputAsset],
  )

  const handleSelectOutputAsset = useCallback(
    (output: Asset) => {
      history.push(getSwapRoute(inputAsset, output))
    },
    [history, inputAsset],
  )

  const handleSwitchPair = useCallback(() => {
    history.push(getSwapRoute(outputAsset, inputAsset))
  }, [history, inputAsset, outputAsset])

  const handleChangeInputAmount = useCallback(
    (amount: Amount) => {
      if (amount.gt(maxInputBalance)) {
        setInputAmount(maxInputBalance)
        setPercent(100)
      } else {
        setInputAmount(amount)
        setPercent(amount.div(maxInputBalance).mul(100).assetAmount.toNumber())
      }
    },
    [maxInputBalance],
  )

  const handleChangePercent = useCallback(
    (p: number) => {
      setPercent(p)
      const newAmount = maxInputBalance.mul(p).div(100)
      setInputAmount(newAmount)
    },
    [maxInputBalance],
  )

  const handleSelectMax = useCallback(() => {
    handleChangePercent(100)
  }, [handleChangePercent])

  const handleConfirm = useCallback(async () => {
    setVisibleConfirmModal(false)

    if (wallet && swap) {
      // register to tx tracker
      const trackId = submitTransaction({
        type: TxTrackerType.Swap,
        submitTx: {
          inAssets: [
            {
              asset: swap.inputAsset.toString(),
              amount: swap.inputAmount.toSignificant(6),
            },
          ],
          outAssets: [
            {
              asset: swap.outputAsset.toString(),
              amount: swap.outputAmountAfterFee.toSignificant(6),
            },
          ],
        },
      })

      try {
        const txHash = await multichain.swap(swap, recipient)

        // start polling
        pollTransaction({
          type: TxTrackerType.Swap,
          uuid: trackId,
          submitTx: {
            inAssets: [
              {
                asset: swap.inputAsset.toString(),
                amount: swap.inputAmount.toSignificant(6),
              },
            ],
            outAssets: [
              {
                asset: swap.outputAsset.toString(),
                amount: swap.outputAmountAfterFee.toSignificant(6),
              },
            ],
            txID: txHash,
          },
        })
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
  }, [wallet, swap, recipient, submitTransaction, pollTransaction, setTxFailed])

  const handleCancel = useCallback(() => {
    setVisibleConfirmModal(false)
  }, [])

  const handleConfirmApprove = useCallback(async () => {
    setVisibleApproveModal(false)

    if (wallet) {
      // register to tx tracker
      const trackId = submitTransaction({
        type: TxTrackerType.Approve,
        submitTx: {
          inAssets: [
            {
              asset: inputAsset.toString(),
              amount: '0', // not needed for approve tx
            },
          ],
        },
      })

      try {
        const txHash = await multichain.approveAsset(inputAsset)
        console.log('approve txhash', txHash)
        if (txHash) {
          // start polling
          pollTransaction({
            type: TxTrackerType.Swap,
            uuid: trackId,
            submitTx: {
              inAssets: [
                {
                  asset: inputAsset.toString(),
                  amount: '0', // not needed for approve tx
                },
              ],
              txID: txHash,
            },
          })
        }
      } catch (error) {
        setTxFailed(trackId)
        Notification({
          type: 'open',
          message: 'Approve Failed.',
          duration: 20,
        })
        console.log(error)
      }
    }
  }, [inputAsset, wallet, setTxFailed, submitTransaction, pollTransaction])

  const handleSwap = useCallback(() => {
    if (wallet && swap) {
      if (!isSwapSupported) {
        Notification({
          type: 'info',
          message: 'Bitcoin -> ERC20 Swap is suspended for temporary.',
        })
        return
      }

      if (swap.hasInSufficientFee) {
        Notification({
          type: 'info',
          message: 'Swap Insufficient Fee',
          description: 'Input amount is not enough to cover the fee',
        })
        return
      }

      setVisibleConfirmModal(true)
    } else {
      Notification({
        type: 'info',
        message: 'Wallet Not Found',
        description: 'Please connect wallet',
      })
    }
  }, [wallet, swap, isSwapSupported])

  const handleApprove = useCallback(() => {
    if (wallet && swap) {
      setVisibleApproveModal(true)
    } else {
      Notification({
        type: 'info',
        message: 'Wallet Not Found',
        description: 'Please connect wallet',
      })
    }
  }, [wallet, swap])

  const isValidSwap = useMemo(() => swap?.isValid() ?? { valid: false }, [swap])
  const isValidSlip = useMemo(() => swap?.isSlipValid() ?? true, [swap])

  const btnLabel = useMemo(() => {
    if (isValidSwap.valid) return 'Swap'

    return isValidSwap?.msg ?? 'Swap'
  }, [isValidSwap])

  const estimatedTime = useMemo(
    () =>
      getEstimatedTxTime({
        chain: inputAsset.chain as SupportedChain,
        amount: inputAmount,
      }),
    [inputAsset, inputAmount],
  )

  const renderConfirmModalContent = useMemo(() => {
    return (
      <Styled.ConfirmModalContent>
        <Information
          title="Send"
          description={`${inputAmount.toSignificant(
            6,
          )} ${inputAsset.ticker.toUpperCase()}`}
        />
        <Information
          title="Receive"
          description={`${outputAmount.toSignificant(
            6,
          )} ${outputAsset.ticker.toUpperCase()}`}
        />
        <br />
        <Information
          title="Slip"
          description={slipPercent.toFixed(3)}
          error={!isValidSlip}
          tooltip={SLIP_TOOLTIP_LABEL}
        />
        <Information
          title="Minimum Received"
          description={`${minReceive.toSignificant(
            6,
          )} ${outputAsset.ticker.toUpperCase()}`}
          tooltip={MIN_RECEIVED_LABEL}
        />
        <Information
          title="Transaction Fee"
          description={inboundFee.toCurrencyFormat()}
          tooltip={TX_FEE_TOOLTIP_LABEL}
        />
        <Information
          title="Network Fee"
          description={outboundFee?.toCurrencyFormat() ?? ''}
          tooltip="Thorchain network fee used to pay outbound transaction"
        />
        <Information
          title="Total Fee"
          description={totalFee?.toCurrencyFormat() ?? ''}
          tooltip="Sum of both transaction fee and network fee"
        />
        <Information
          title="Estimated Time"
          description={estimatedTime}
          tooltip={ESTIMATED_TIME_LABEL}
        />
      </Styled.ConfirmModalContent>
    )
  }, [
    inputAmount,
    outputAmount,
    inputAsset,
    outputAsset,
    slipPercent,
    isValidSlip,
    minReceive,
    inboundFee,
    outboundFee,
    totalFee,
    estimatedTime,
  ])

  const renderApproveModal = useMemo(() => {
    return (
      <Styled.ConfirmModalContent>
        <Information
          title={`Approve ${inputAsset.ticker.toUpperCase()}`}
          description=""
        />
        <Information
          title="Transaction Fee"
          description={inboundFee.toCurrencyFormat()}
          tooltip={TX_FEE_TOOLTIP_LABEL}
        />
      </Styled.ConfirmModalContent>
    )
  }, [inboundFee, inputAsset])

  const title = useMemo(
    () => `Swap ${inputAsset.ticker} >> ${outputAsset.ticker}`,
    [inputAsset, outputAsset],
  )
  const poolAsset = useMemo(
    () => (inputAsset.isRUNE() ? outputAsset : inputAsset),
    [inputAsset, outputAsset],
  )

  return (
    <PanelView meta={title} poolAsset={poolAsset} type="swap">
      <AssetInputCard
        title="send"
        asset={inputAsset}
        assets={inputAssets}
        amount={inputAmount}
        balance={inputAssetBalance}
        onChange={handleChangeInputAmount}
        onSelect={handleSelectInputAsset}
        onMax={handleSelectMax}
        usdPrice={inputAssetPriceInUSD}
      />
      <Styled.ToolContainer>
        <Styled.SliderWrapper>
          <Slider value={percent} onChange={handleChangePercent} withLabel />
        </Styled.SliderWrapper>
        <Styled.SwitchPair>
          <IconButton onClick={handleSwitchPair}>
            <SwapOutlined />
          </IconButton>
        </Styled.SwitchPair>
      </Styled.ToolContainer>
      <AssetInputCard
        title="receive"
        asset={outputAsset}
        assets={poolAssets}
        amount={outputAmount}
        onSelect={handleSelectOutputAsset}
        inputProps={{ disabled: true }}
        usdPrice={outputAssetPriceInUSD}
      />

      <Styled.SwapInfo>
        <PriceRate
          price={swap?.price}
          inputAsset={swap?.inputAsset}
          outputAsset={swap?.outputAsset}
        />
        <Information
          title="Slip"
          description={slipPercent.toFixed(3)}
          error={!isValidSlip}
          tooltip={SLIP_TOOLTIP_LABEL}
        />
        <Information
          title="Minimum Received"
          description={`${minReceive.toSignificant(
            6,
          )} ${outputAsset.ticker.toUpperCase()}`}
          tooltip={MIN_RECEIVED_LABEL}
        />

        <br />
        <Information
          title="Transaction Fee"
          description={inboundFee.toCurrencyFormat()}
          tooltip={TX_FEE_TOOLTIP_LABEL}
        />
        <Information
          title="Network Fee"
          description={outboundFee?.toCurrencyFormat() ?? ''}
          tooltip="Estimated network fee used to pay outbound transaction"
        />
        <Information
          title="Total Fee"
          description={totalFee?.toCurrencyFormat() ?? ''}
          tooltip="Sum of both transaction fee and network fee"
        />
      </Styled.SwapInfo>

      {isApproved !== null && wallet && (
        <Styled.ConfirmButtonContainer>
          {!isApproved && (
            <Styled.ApproveBtn
              onClick={handleApprove}
              error={!isValidSwap.valid}
              disabled={
                assetApproveStatus === TxTrackerStatus.Pending ||
                assetApproveStatus === TxTrackerStatus.Submitting
              }
              loading={
                assetApproveStatus === TxTrackerStatus.Pending ||
                assetApproveStatus === TxTrackerStatus.Submitting
              }
            >
              Approve
            </Styled.ApproveBtn>
          )}
          <FancyButton
            disabled={!isApproved}
            onClick={handleSwap}
            error={!isValidSwap.valid}
          >
            {btnLabel}
          </FancyButton>
        </Styled.ConfirmButtonContainer>
      )}
      {!wallet && (
        <Styled.ConfirmButtonContainer>
          <FancyButton onClick={handleSwap} error={!isValidSwap.valid}>
            {btnLabel}
          </FancyButton>
        </Styled.ConfirmButtonContainer>
      )}

      <ConfirmModal
        visible={visibleConfirmModal}
        onOk={handleConfirm}
        onCancel={handleCancel}
      >
        {renderConfirmModalContent}
      </ConfirmModal>
      <ConfirmModal
        visible={visibleApproveModal}
        onOk={handleConfirmApprove}
        onCancel={() => setVisibleApproveModal(false)}
      >
        {renderApproveModal}
      </ConfirmModal>
    </PanelView>
  )
}

export default SwapView
