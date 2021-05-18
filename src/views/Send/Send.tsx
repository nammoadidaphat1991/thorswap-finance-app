import React, { useEffect, useMemo, useState, useCallback } from 'react'

import { useHistory, useParams } from 'react-router'

import {
  ContentTitle,
  Helmet,
  AssetInputCard,
  Slider,
  Input,
  FancyButton,
  ConfirmModal,
  Information,
  Notification,
  Button,
  AssetSelect,
  Label,
  SettingsOverlay,
} from 'components'
import {
  Account,
  Amount,
  Asset,
  AssetAmount,
  Memo,
  WalletAccount,
} from 'multichain-sdk'

import { useMidgard } from 'redux/midgard/hooks'
import { useWallet } from 'redux/wallet/hooks'

import { useBalance } from 'hooks/useBalance'
import { useNetworkFee } from 'hooks/useNetworkFee'

import { multichain } from 'services/multichain'

import { getSendRoute } from 'settings/constants'

import * as Styled from './Send.style'

enum SendMode {
  NORMAL,
  EXPERT,
}

const SendView = () => {
  const { asset } = useParams<{ asset: string }>()
  const { account, keystore, accountType } = useWallet()

  const [sendAsset, setSendAsset] = useState<Asset>()

  useEffect(() => {
    const getSendAsset = async () => {
      const assetObj = Asset.fromAssetString(asset)

      if (assetObj) {
        await assetObj.setDecimal()
        setSendAsset(assetObj)
      }
    }

    getSendAsset()
  }, [asset])

  if (!sendAsset) {
    return null
  }

  if (!account || (!keystore && accountType === 'keystore')) {
    return (
      <Styled.Container>
        <Label>Please connect a wallet.</Label>
      </Styled.Container>
    )
  }

  return <Send sendAsset={sendAsset} wallet={account} />
}

const Send = ({
  sendAsset,
  wallet,
}: {
  sendAsset: Asset
  wallet: WalletAccount
}) => {
  const history = useHistory()
  const { pools } = useMidgard()
  const { getMaxBalance } = useBalance()

  const maxSpendableBalance: Amount = useMemo(() => getMaxBalance(sendAsset), [
    sendAsset,
    getMaxBalance,
  ])

  const { inboundFee, totalFeeInUSD } = useNetworkFee({ inputAsset: sendAsset })

  const poolAssets = useMemo(() => {
    const assets = pools.map((pool) => pool.asset)
    assets.push(Asset.RUNE())

    return assets
  }, [pools])

  const [sendMode, setSendMode] = useState(SendMode.NORMAL)
  const isExpertMode = useMemo(() => sendMode === SendMode.EXPERT, [sendMode])

  const [sendAmount, setSendAmount] = useState<Amount>(
    Amount.fromAssetAmount(0, 8),
  )
  const [percent, setPercent] = useState(0)
  const [recipientAddress, setRecipientAddress] = useState('')
  const [poolAddress, setPoolAddress] = useState('')

  const recipient = useMemo(
    () => (isExpertMode ? poolAddress : recipientAddress),
    [isExpertMode, poolAddress, recipientAddress],
  )

  const [memo, setMemo] = useState('')
  const [visibleConfirmModal, setVisibleConfirmModal] = useState(false)

  const [outputAsset, setOutputAsset] = useState<Asset>(sendAsset)

  const walletAssets = useMemo(() => Account.getWalletAssets(wallet), [wallet])
  const assetBalance: Amount = useMemo(() => {
    if (wallet) {
      return Account.getAssetBalance(wallet, sendAsset).amount
    }
    return Amount.fromAssetAmount(0, 8)
  }, [sendAsset, wallet])

  useEffect(() => {
    const fetchPoolAddress = async () => {
      const { address: poolAddr } = await multichain.getInboundDataByChain(
        sendAsset.chain,
      )
      setPoolAddress(poolAddr)
    }

    if (isExpertMode) {
      fetchPoolAddress()
    }
  }, [isExpertMode, sendAsset])

  const handleSelectAsset = useCallback(
    (selected: Asset) => {
      history.push(getSendRoute(selected))
    },
    [history],
  )

  const handleSelectOutputAsset = useCallback((poolAsset: Asset) => {
    setOutputAsset(poolAsset)
    setMemo('')
  }, [])

  const handleChangeSendAmount = useCallback(
    (amount: Amount) => {
      if (amount.gt(maxSpendableBalance)) {
        setSendAmount(maxSpendableBalance)
        setPercent(100)
      } else {
        setSendAmount(amount)
        setPercent(
          amount.div(maxSpendableBalance).mul(100).assetAmount.toNumber(),
        )
      }
    },
    [maxSpendableBalance],
  )

  const handleChangePercent = useCallback(
    (p: number) => {
      setPercent(p)
      const newAmount = maxSpendableBalance.mul(p).div(100)
      setSendAmount(newAmount)
    },
    [maxSpendableBalance],
  )

  const handleSelectMax = useCallback(() => {
    handleChangePercent(100)
  }, [handleChangePercent])

  const handleChangeRecipient = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const addr = e.target.value

      if (addr === 'pool') {
        setSendMode(SendMode.EXPERT)
      } else {
        setSendMode(SendMode.NORMAL)
        setPoolAddress('')
      }
      setRecipientAddress(addr)
    },
    [],
  )

  const handleChangePoolAddress = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const addr = e.target.value
      setPoolAddress(addr)
    },
    [],
  )

  const handleChangeMemo = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMemo(e.target.value)
    },
    [],
  )

  const handleConfirmSend = useCallback(async () => {
    setVisibleConfirmModal(false)

    if (sendAsset) {
      const assetAmount = new AssetAmount(sendAsset, sendAmount)

      try {
        const txHash = await multichain.send({
          assetAmount,
          recipient,
          memo,
        })

        const txURL = multichain.getExplorerTxUrl(sendAsset.chain, txHash)

        Notification({
          type: 'open',
          message: 'View Send Tx.',
          description: 'Transaction sent successfully!',
          btn: (
            <a href={txURL} target="_blank" rel="noopener noreferrer">
              View Transaction
            </a>
          ),
          duration: 20,
        })
      } catch (error) {
        Notification({
          type: 'error',
          message: 'Send Transaction Failed.',
          description: error?.toString(),
          duration: 20,
        })
      }
    }
  }, [sendAsset, sendAmount, recipient, memo])

  const handleCancelSend = useCallback(() => {
    setVisibleConfirmModal(false)
  }, [])

  const handleSend = useCallback(() => {
    if (
      !isExpertMode &&
      !multichain.validateAddress({
        chain: sendAsset.chain,
        address: recipient,
      })
    ) {
      Notification({
        type: 'warning',
        message: `Recipient Address is not valid ${sendAsset.chain} Address, please check your address again.`,
        duration: 20,
      })
    } else {
      setVisibleConfirmModal(true)
    }
  }, [isExpertMode, sendAsset, recipient])

  const handleSelectDepositMemo = useCallback(() => {
    setMemo(Memo.depositMemo(sendAsset))
  }, [sendAsset])

  const handleSelectSwapMemo = useCallback(() => {
    if (outputAsset) {
      const address = Account.getChainAddress(wallet, outputAsset.chain) || ''
      setMemo(Memo.swapMemo(outputAsset, address))
    }
  }, [outputAsset, wallet])

  const renderConfirmModalContent = useMemo(() => {
    return (
      <Styled.ConfirmModalContent>
        <Information
          title="Send"
          description={`${sendAmount.toSignificant(
            6,
          )} ${sendAsset.ticker.toUpperCase()}`}
        />
        <Information
          title="Recipient"
          description={`${recipientAddress.substr(
            0,
            3,
          )}...${recipientAddress.substr(-3)}`}
        />
        <Information
          title="Transaction Fee"
          description={`${inboundFee.toCurrencyFormat()} (${totalFeeInUSD.toCurrencyFormat(
            2,
          )})`}
          tooltip="Gas fee to send the transaction, There's no extra charges from THORChain Protocol"
        />
      </Styled.ConfirmModalContent>
    )
  }, [sendAmount, inboundFee, sendAsset, totalFeeInUSD, recipientAddress])

  const title = useMemo(() => `${sendAsset.ticker} (${sendAsset.type})`, [
    sendAsset,
  ])

  return (
    <Styled.Container>
      <Helmet title={`Send ${title}`} content={`Send ${title}`} />
      <ContentTitle justifyContent="space-between" hasPadding>
        <Label size="large" weight="bold">
          Send {title}
        </Label>
        <SettingsOverlay />
      </ContentTitle>
      <Styled.ContentPanel>
        <AssetInputCard
          title="send"
          asset={sendAsset}
          assets={walletAssets}
          amount={sendAmount}
          balance={assetBalance}
          onChange={handleChangeSendAmount}
          onSelect={handleSelectAsset}
          onMax={handleSelectMax}
          wallet={wallet || undefined}
        />
        <Slider value={percent} onChange={handleChangePercent} withLabel />

        {isExpertMode && (
          <Styled.PoolSelect>
            <Label size="big" align="center">
              Output Asset
            </Label>
            <AssetSelect
              asset={outputAsset}
              assets={poolAssets}
              onSelect={handleSelectOutputAsset}
            />
          </Styled.PoolSelect>
        )}
        <Styled.FormItem>
          <Styled.FormLabel>Recipient</Styled.FormLabel>
          <Input
            typevalue="ghost"
            sizevalue="big"
            value={recipientAddress}
            onChange={handleChangeRecipient}
            placeholder="Recipient"
          />
        </Styled.FormItem>

        {isExpertMode && (
          <Styled.FormItem>
            <Styled.FormLabel>Pool Address</Styled.FormLabel>
            <Input
              typevalue="ghost"
              sizevalue="big"
              value={poolAddress}
              onChange={handleChangePoolAddress}
              placeholder="Pool Address"
            />
          </Styled.FormItem>
        )}

        {isExpertMode && (
          <Styled.FormItem>
            <Styled.FormLabel>Select Memo Type</Styled.FormLabel>
            <Styled.MemoTypes>
              <Button
                sizevalue="small"
                color="primary"
                typevalue="outline"
                onClick={handleSelectDepositMemo}
              >
                Deposit
              </Button>
              <Button
                sizevalue="small"
                color="primary"
                typevalue="outline"
                onClick={handleSelectSwapMemo}
              >
                Swap
              </Button>
            </Styled.MemoTypes>
          </Styled.FormItem>
        )}
        <Styled.FormItem>
          <Styled.FormLabel>Memo</Styled.FormLabel>
          <Input
            typevalue="ghost"
            sizevalue="big"
            value={memo}
            onChange={handleChangeMemo}
            placeholder="Memo"
          />
        </Styled.FormItem>

        <Styled.FormItem>
          <Information
            title="Transaction Fee"
            description={`${inboundFee.toCurrencyFormat()} (${totalFeeInUSD.toCurrencyFormat(
              2,
            )})`}
            tooltip="Gas fee to send the transaction, There's no extra charges from THORChain Protocol"
          />
        </Styled.FormItem>

        <Styled.ConfirmButtonContainer>
          <FancyButton onClick={handleSend} error={false}>
            Send
          </FancyButton>
        </Styled.ConfirmButtonContainer>
      </Styled.ContentPanel>
      <ConfirmModal
        visible={visibleConfirmModal}
        onOk={handleConfirmSend}
        onCancel={handleCancelSend}
      >
        {renderConfirmModalContent}
      </ConfirmModal>
    </Styled.Container>
  )
}

export default SendView
