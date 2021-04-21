import React, { useEffect, useMemo, useState, useCallback } from 'react'

import { useParams } from 'react-router'

import { THORChain } from '@xchainjs/xchain-thorchain'
import {
  PanelView,
  Slider,
  ConfirmModal,
  Information,
  Notification,
  FancyButton,
  LiquidityTypeOption,
  LiquidityType,
  MemberPoolData,
  Label,
  PoolShareTypeSelect,
  Panel,
} from 'components'
import {
  Amount,
  Asset,
  Pool,
  Price,
  Liquidity,
  Percent,
  AmountType,
  SupportedChain,
} from 'multichain-sdk'

import { useMidgard } from 'redux/midgard/hooks'
import {
  PoolMemberData,
  PoolShareType,
  TxTrackerType,
} from 'redux/midgard/types'
import { useWallet } from 'redux/wallet/hooks'

import { useTxTracker } from 'hooks/useTxTracker'

import { multichain } from 'services/multichain'

import * as Styled from './Withdraw.style'

const WithdrawView = () => {
  const { asset } = useParams<{ asset: string }>()
  const [assetObj, setAssetObj] = useState<Asset>()
  const [pool, setPool] = useState<Pool>()

  const {
    pools,
    poolLoading,
    loadMemberDetailsByChain,
    chainMemberDetails,
  } = useMidgard()

  useEffect(() => {
    if (!pool) return
    loadMemberDetailsByChain(pool.asset.chain as SupportedChain)
  }, [loadMemberDetailsByChain, pool])

  const poolMemberData: PoolMemberData | null = useMemo(() => {
    if (!pool) return null
    return (
      chainMemberDetails?.[pool.asset.chain]?.[pool.asset.toString()] ?? null
    )
  }, [chainMemberDetails, pool])

  useEffect(() => {
    if (!poolLoading && pools.length && assetObj) {
      const assetPool = Pool.byAsset(assetObj, pools)

      if (assetPool) {
        setPool(assetPool)
      }
    }
  }, [pools, poolLoading, assetObj])

  useEffect(() => {
    const getAssetEntity = async () => {
      if (!asset) {
        return
      }
      const assetEntity = Asset.fromAssetString(asset)

      if (assetEntity) {
        if (assetEntity.isRUNE()) return

        await assetEntity.setDecimal()

        setAssetObj(assetEntity)
      }
    }

    getAssetEntity()
  }, [asset])

  if (
    pool &&
    pools.length &&
    poolMemberData &&
    Object.keys(poolMemberData).length
  ) {
    const shares = []
    if (poolMemberData.sym) shares.push(PoolShareType.SYM)
    if (poolMemberData.runeAsym) shares.push(PoolShareType.RUNE_ASYM)
    if (poolMemberData.assetAsym) shares.push(PoolShareType.ASSET_ASYM)

    return (
      <WithdrawPanel
        pool={pool}
        shareTypes={shares}
        pools={pools}
        poolMemberData={poolMemberData}
      />
    )
  }

  return (
    <Panel>
      <Label>You don't have LP to withdraw</Label>
    </Panel>
  )
}

const WithdrawPanel = ({
  poolMemberData,
  pool,
  pools,
  shareTypes,
}: {
  poolMemberData: PoolMemberData
  shareTypes: PoolShareType[]
  pool: Pool
  pools: Pool[]
}) => {
  const [lpType, setLPType] = useState(shareTypes[0])

  const { wallet } = useWallet()
  const { submitTransaction, pollTransaction, setTxFailed } = useTxTracker()

  const poolAsset = useMemo(() => pool.asset, [pool])

  const defaultLiquidityType =
    lpType === PoolShareType.SYM
      ? LiquidityTypeOption.SYMMETRICAL
      : PoolShareType.RUNE_ASYM
      ? LiquidityTypeOption.RUNE
      : LiquidityTypeOption.ASSET

  const [liquidityType, setLiquidityType] = useState(defaultLiquidityType)

  const [percent, setPercent] = useState(0)
  const [visibleConfirmModal, setVisibleConfirmModal] = useState(false)

  const memberPoolData = useMemo(() => {
    if (lpType === PoolShareType.RUNE_ASYM) return poolMemberData.runeAsym
    if (lpType === PoolShareType.ASSET_ASYM) return poolMemberData.assetAsym
    if (lpType === PoolShareType.SYM) return poolMemberData.sym

    return null
  }, [poolMemberData, lpType])

  const liquidityEntity = useMemo(() => {
    if (!memberPoolData) return null
    const { liquidityUnits } = memberPoolData

    return new Liquidity(pool, Amount.fromMidgard(liquidityUnits))
  }, [pool, memberPoolData])

  const { runeAmount, assetAmount } = useMemo(() => {
    if (!liquidityEntity) {
      return {
        runeAmount: Amount.fromMidgard(0),
        assetAmount: Amount.fromMidgard(0),
      }
    }

    if (liquidityType === LiquidityTypeOption.SYMMETRICAL) {
      return liquidityEntity.getSymWithdrawAmount(
        new Percent(percent, AmountType.BASE_AMOUNT),
      )
    }

    if (liquidityType === LiquidityTypeOption.RUNE) {
      const amount = liquidityEntity.getAsymRuneWithdrawAmount(
        new Percent(percent, AmountType.BASE_AMOUNT),
      )

      return {
        runeAmount: amount,
        assetAmount: Amount.fromMidgard(0),
      }
    }

    const amount = liquidityEntity.getAsymAssetWithdrawAmount(
      new Percent(percent, AmountType.BASE_AMOUNT),
    )

    return {
      runeAmount: Amount.fromMidgard(0),
      assetAmount: amount,
    }
  }, [liquidityType, percent, liquidityEntity])

  const runePriceInUSD = useMemo(
    () =>
      new Price({
        baseAsset: Asset.RUNE(),
        pools,
        priceAmount: runeAmount,
      }),
    [runeAmount, pools],
  )

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
        if (lpType === PoolShareType.SYM) {
          if (liquidityType === LiquidityTypeOption.SYMMETRICAL) {
            const outAssets = [
              {
                asset: Asset.RUNE().toString(),
                amount: runeAmount.toSignificant(6),
              },
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
              uuid: trackId,
              submitTx: {
                inAssets: [],
                outAssets,
                poolAsset: poolAssetString,
                txID,
                withdrawChain: THORChain,
              },
            })
          } else if (liquidityType === LiquidityTypeOption.RUNE) {
            const outAssets = [
              {
                asset: Asset.RUNE().toString(),
                amount: runeAmount.toSignificant(6),
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
              to: 'rune',
            })

            // start polling
            pollTransaction({
              uuid: trackId,
              submitTx: {
                inAssets: [],
                outAssets,
                txID,
                poolAsset: poolAssetString,
                withdrawChain: THORChain,
              },
            })
          } else if (liquidityType === LiquidityTypeOption.ASSET) {
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
              to: 'asset',
            })

            // start polling
            pollTransaction({
              uuid: trackId,
              submitTx: {
                inAssets: [],
                outAssets,
                txID,
                poolAsset: poolAssetString,
                withdrawChain: THORChain,
              },
            })
          }
        } else if (lpType === PoolShareType.ASSET_ASYM) {
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
            from: 'asset',
            to: 'asset',
          })

          // start polling
          pollTransaction({
            uuid: trackId,
            submitTx: {
              inAssets: [],
              outAssets,
              txID,
              poolAsset: poolAssetString,
              withdrawChain: pool.asset.chain,
            },
          })
        } else if (lpType === PoolShareType.RUNE_ASYM) {
          const outAssets = [
            {
              asset: Asset.RUNE().toString(),
              amount: runeAmount.toSignificant(6),
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
            from: 'rune',
            to: 'rune',
          })

          // start polling
          pollTransaction({
            uuid: trackId,
            submitTx: {
              inAssets: [],
              outAssets,
              txID,
              poolAsset: poolAssetString,
              withdrawChain: THORChain,
            },
          })
        }
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
    liquidityType,
    lpType,
    wallet,
    pool,
    percent,
    runeAmount,
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
        {lpType === PoolShareType.SYM && (
          <Information
            title="Withdraw"
            description={`${assetAmount.toSignificant(
              6,
            )} ${poolAsset.ticker.toUpperCase()}, ${runeAmount.toSignificant(
              6,
            )} RUNE`}
          />
        )}
        {lpType === PoolShareType.ASSET_ASYM && (
          <Information
            title="Withdraw"
            description={`${assetAmount.toSignificant(
              6,
            )} ${poolAsset.ticker.toUpperCase()}`}
          />
        )}
        {lpType === PoolShareType.RUNE_ASYM && (
          <Information
            title="Withdraw"
            description={`${runeAmount.toSignificant(6)} RUNE`}
          />
        )}
        <Information
          title="Network Fee"
          description="0.02 RUNE"
          tooltip="Gas fee used for submitting the transaction using the thorchain protocol"
        />
      </Styled.ConfirmModalContent>
    )
  }, [assetAmount, runeAmount, poolAsset, lpType])

  const title = useMemo(() => `Withdraw ${poolAsset.ticker} Liquidity`, [
    poolAsset,
  ])

  const disabledOption = useMemo(() => {
    if (lpType === PoolShareType.RUNE_ASYM)
      return [LiquidityTypeOption.SYMMETRICAL, LiquidityTypeOption.ASSET]
    if (lpType === PoolShareType.ASSET_ASYM)
      return [LiquidityTypeOption.SYMMETRICAL, LiquidityTypeOption.RUNE]
    return []
  }, [lpType])

  if (!wallet) {
    return (
      <PanelView meta={title} poolAsset={poolAsset} type="withdraw">
        <Label>Please connect wallet.</Label>
      </PanelView>
    )
  }

  if (!memberPoolData) {
    return (
      <PanelView meta={title} poolAsset={poolAsset} type="withdraw">
        <Label>You don't have any {poolAsset.ticker} liquidity.</Label>
      </PanelView>
    )
  }

  return (
    <PanelView meta={title} poolAsset={poolAsset} type="withdraw">
      <Styled.WithdrawHeader>
        <Styled.WithdrawHeaderRow>
          <Styled.HeaderLabel>WITHDRAW: </Styled.HeaderLabel>
          <LiquidityType
            poolAsset={poolAsset}
            selected={liquidityType}
            onSelect={setLiquidityType}
            disable={disabledOption}
          />
        </Styled.WithdrawHeaderRow>
        <Styled.WithdrawHeaderRow>
          <Styled.HeaderLabel>FROM: </Styled.HeaderLabel>
          <PoolShareTypeSelect
            poolAsset={poolAsset}
            selected={lpType}
            onSelect={setLPType}
            shareTypes={shareTypes}
          />
        </Styled.WithdrawHeaderRow>
      </Styled.WithdrawHeader>
      <MemberPoolData data={memberPoolData} shareType={lpType} pool={pool} />
      <Styled.ToolContainer>
        <Styled.SliderWrapper>
          <Slider value={percent} onChange={handleChangePercent} withLabel />
        </Styled.SliderWrapper>
      </Styled.ToolContainer>

      <Styled.DetailContent>
        {liquidityType !== LiquidityTypeOption.ASSET && (
          <Information
            title="RUNE"
            description={`${runeAmount.toSignificant(
              6,
            )} RUNE ($${runePriceInUSD.toSignificant(6)})`}
            tooltip="You are withdrawing RUNE from the liquidity"
          />
        )}
        {liquidityType !== LiquidityTypeOption.RUNE && (
          <Information
            title={poolAsset.ticker}
            description={`${assetAmount.toSignificant(6)} ${
              poolAsset.ticker
            } ($${assetPriceInUSD.toSignificant(6)})`}
            tooltip="You are withdrawing ASSET from the liquidity"
          />
        )}
        <Information
          title="Network Fee"
          description="0.02 RUNE"
          tooltip="Gas fee used for submitting the transaction using the thorchain protocol"
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
    </PanelView>
  )
}

export default WithdrawView
