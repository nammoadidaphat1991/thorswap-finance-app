import React, { useEffect, useMemo, useState, useCallback } from 'react'

import { PlusOutlined } from '@ant-design/icons'
import {
  PanelView,
  AssetInputCard,
  Slider,
  ConfirmModal,
  Information,
  Notification,
  FancyButton,
  Label,
  Panel,
} from 'components'
import {
  getNonPoolAssets,
  Amount,
  Asset,
  getAssetBalance,
  Pool,
  Price,
  AssetAmount,
  Wallet,
} from 'multichain-sdk'

import { useMidgard } from 'redux/midgard/hooks'
import { TxTrackerType } from 'redux/midgard/types'
import { useWallet } from 'redux/wallet/hooks'

import { useMimir } from 'hooks/useMimir'
import useTransactionFee from 'hooks/useTransactionFee'
import { useTxTracker } from 'hooks/useTxTracker'

import { multichain } from 'services/multichain'

import * as Styled from './Create.style'

const CreateLiquidityView = () => {
  const { pools, poolLoading } = useMidgard()
  const { wallet } = useWallet()

  const availableAssets = useMemo(() => getNonPoolAssets({ wallet, pools }), [
    wallet,
    pools,
  ])

  if (!wallet) {
    return (
      <Panel>
        <Label>Please connect wallet.</Label>
      </Panel>
    )
  }

  if (availableAssets.length && pools.length && !poolLoading) {
    return (
      <CreateLiquidityPanel
        pools={pools}
        wallet={wallet}
        inputAssets={availableAssets}
      />
    )
  }

  if (!availableAssets.length && pools.length && !poolLoading) {
    return (
      <Panel>
        <Label>You don't have asset to create a new pool.</Label>
      </Panel>
    )
  }

  return null
}

const CreateLiquidityPanel = ({
  pools,
  inputAssets,
  wallet,
}: {
  pools: Pool[]
  wallet: Wallet
  inputAssets: Asset[]
}) => {
  const { submitTransaction, pollTransaction } = useTxTracker()

  const { isFundsCapReached } = useMimir()

  const [inputAsset, setInputAsset] = useState(inputAssets[0])

  const [assetAmount, setAssetAmount] = useState<Amount>(
    Amount.fromAssetAmount(0, 8),
  )
  const [runeAmount, setRuneAmount] = useState<Amount>(
    Amount.fromAssetAmount(0, 8),
  )
  const [percent, setPercent] = useState(0)
  const [visibleConfirmModal, setVisibleConfirmModal] = useState(false)
  const [visibleApproveModal, setVisibleApproveModal] = useState(false)

  const [isApproved, setApproved] = useState<boolean | null>(null)

  const networkFee = useTransactionFee(inputAsset)

  useEffect(() => {
    const checkApproved = async () => {
      const approved = await multichain.isAssetApproved(inputAsset)
      setApproved(approved)
    }

    if (wallet) {
      checkApproved()
    }
  }, [inputAsset, wallet])

  const inputAssetPriceInUSD = useMemo(
    () =>
      new Price({
        baseAsset: inputAsset,
        pools,
        priceAmount: assetAmount,
      }),
    [inputAsset, assetAmount, pools],
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

  const inputAssetBalance: Amount = useMemo(() => {
    if (wallet) {
      return getAssetBalance(inputAsset, wallet).amount
    }

    // allow max amount if wallet is not connected
    return Amount.fromAssetAmount(10 ** 3, 8)
  }, [inputAsset, wallet])

  const runeBalance: Amount = useMemo(() => {
    if (wallet) {
      return getAssetBalance(Asset.RUNE(), wallet).amount
    }

    // allow max amount if wallet is not connected
    return Amount.fromAssetAmount(10 ** 3, 8)
  }, [wallet])

  const handleSelectInputAsset = useCallback((inputAssetData: Asset) => {
    setInputAsset(inputAssetData)
  }, [])

  const handleChangeAssetAmount = useCallback(
    (amount: Amount) => {
      if (amount.gt(inputAssetBalance)) {
        setAssetAmount(inputAssetBalance)
        setPercent(100)
      } else {
        setAssetAmount(amount)
        setPercent(
          amount.div(inputAssetBalance).mul(100).assetAmount.toNumber(),
        )
      }
    },
    [inputAssetBalance],
  )

  const handleChangePercent = useCallback(
    (p: number) => {
      setPercent(p)
      setAssetAmount(inputAssetBalance.mul(p).div(100))
    },
    [inputAssetBalance],
  )

  const handleSelectAssetMax = useCallback(() => {
    handleChangePercent(100)
  }, [handleChangePercent])

  const handleChangeRuneAmount = useCallback(
    (amount: Amount) => {
      if (amount.gt(runeBalance)) {
        setRuneAmount(runeBalance)
      } else {
        setRuneAmount(amount)
      }
    },
    [runeBalance],
  )

  const handleConfirmAdd = useCallback(async () => {
    setVisibleConfirmModal(false)
    if (wallet) {
      const runeAssetAmount = new AssetAmount(Asset.RUNE(), runeAmount)
      const inputAssetAmount = new AssetAmount(inputAsset, assetAmount)

      const inAssets = []
      inAssets.push({
        asset: Asset.RUNE().toString(),
        amount: runeAmount.toFixed(2),
      })

      inAssets.push({
        asset: inputAsset.toString(),
        amount: assetAmount.toFixed(3),
      })

      // register to tx tracker
      const trackId = submitTransaction({
        type: TxTrackerType.AddLiquidity,
        submitTx: {
          inAssets,
          outAssets: [],
        },
      })

      const pool = new Pool(
        inputAsset,
        Amount.fromMidgard(0),
        Amount.fromMidgard(0),
        {} as any,
      )

      const txRes = await multichain.addLiquidity({
        pool,
        runeAmount: runeAssetAmount,
        assetAmount: inputAssetAmount,
      })

      console.log('tx res', txRes)

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
          },
        })
      }
    }
  }, [
    wallet,
    inputAsset,
    runeAmount,
    assetAmount,
    submitTransaction,
    pollTransaction,
  ])

  const handleCancel = useCallback(() => {
    setVisibleConfirmModal(false)
  }, [])

  const handleConfirmApprove = useCallback(async () => {
    setVisibleApproveModal(false)

    if (wallet) {
      const txHash = await multichain.approveAsset(inputAsset)

      if (txHash) {
        console.log('txhash', txHash)
        const txURL = multichain.getExplorerTxUrl(inputAsset.chain, txHash)

        Notification({
          type: 'open',
          message: 'View Approve Tx.',
          description: 'Transaction submitted successfully!',
          btn: (
            <a href={txURL} target="_blank" rel="noopener noreferrer">
              View Transaction
            </a>
          ),
          duration: 20,
        })
      }
    }
  }, [inputAsset, wallet])

  const handleCreatePool = useCallback(() => {
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

  const handleApprove = useCallback(() => {
    if (wallet) {
      setVisibleApproveModal(true)
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
          title="Add"
          description={`${assetAmount.toFixed()} ${inputAsset.ticker.toUpperCase()}, ${runeAmount.toFixed()} RUNE`}
        />
        <Information
          title="Pool Share Estimated"
          description="100%"
          tooltip="Your pool share percentage after providing the liquidity."
        />
        <Information
          title="Transaction Fee"
          description={networkFee}
          tooltip="Gas fee used for submitting the transaction using the thorchain protocol"
        />
      </Styled.ConfirmModalContent>
    )
  }, [assetAmount, runeAmount, inputAsset, networkFee])

  const renderApproveModal = useMemo(() => {
    return (
      <Styled.ConfirmModalContent>
        <Information
          title="Add"
          description={`${assetAmount.toFixed()} ${inputAsset.ticker.toUpperCase()}, ${runeAmount.toFixed()} RUNE`}
        />
        <Information
          title="Approve Transaction"
          description={`${inputAsset.ticker.toUpperCase()}`}
        />
        <Information
          title="Transaction Fee"
          description={networkFee}
          tooltip="Gas fee used for submitting the transaction using the thorchain protocol"
        />
      </Styled.ConfirmModalContent>
    )
  }, [inputAsset, assetAmount, runeAmount, networkFee])

  const isAddLiquidityValid = useMemo(() => {
    return runeAmount.gt(0) && assetAmount.gt(0)
  }, [runeAmount, assetAmount])

  const title = useMemo(() => `Create ${inputAsset.ticker} Pool`, [inputAsset])

  return (
    <PanelView meta={title} poolAsset={inputAsset} type="add">
      <AssetInputCard
        title="Add"
        asset={inputAsset}
        assets={inputAssets}
        amount={assetAmount}
        balance={inputAssetBalance}
        onChange={handleChangeAssetAmount}
        onSelect={handleSelectInputAsset}
        onMax={handleSelectAssetMax}
        usdPrice={inputAssetPriceInUSD}
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
        title="Add"
        asset={Asset.RUNE()}
        amount={runeAmount}
        usdPrice={runeAssetPriceInUSD}
        selectDisabled={false}
        balance={runeBalance}
        onChange={handleChangeRuneAmount}
      />

      <Styled.DetailContent>
        <Information
          title="Transaction Fee"
          description={networkFee}
          tooltip="Gas fee used for submitting the transaction using the thorchain protocol"
        />
      </Styled.DetailContent>

      {isApproved !== null && wallet && (
        <Styled.ConfirmButtonContainer>
          {!isApproved && (
            <Styled.ApproveBtn onClick={handleApprove}>
              Approve
            </Styled.ApproveBtn>
          )}
          <FancyButton disabled={!isApproved} onClick={handleCreatePool}>
            Add
          </FancyButton>
        </Styled.ConfirmButtonContainer>
      )}
      {!wallet && (
        <Styled.ConfirmButtonContainer>
          <FancyButton onClick={handleCreatePool} error={!isAddLiquidityValid}>
            Create Pool
          </FancyButton>
        </Styled.ConfirmButtonContainer>
      )}

      <ConfirmModal
        visible={visibleConfirmModal}
        onOk={handleConfirmAdd}
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

export default CreateLiquidityView
