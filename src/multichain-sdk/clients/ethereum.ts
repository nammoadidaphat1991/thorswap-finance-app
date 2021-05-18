import { BigNumber as BN } from '@ethersproject/bignumber'
import { hexlify } from '@ethersproject/bytes'
import { toUtf8Bytes } from '@ethersproject/strings'
import { TxHash, Balance, Network } from '@xchainjs/xchain-client'
import {
  Client as EthClient,
  ETHAddress,
  getTokenAddress,
  ApproveParams as ClientApproveParams,
  estimateDefaultFeesWithGasPricesAndLimits,
  TxOverrides,
} from '@xchainjs/xchain-ethereum'
import {
  assetToString,
  baseAmount,
  Chain,
  ETHChain,
  AssetETH,
} from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'

import { ETH_DECIMAL } from 'multichain-sdk/constants'

import { XdefiClient } from '../../xdefi-sdk'
import {
  ETHERSCAN_API_KEY,
  ETHPLORER_API_KEY,
  INFURA_PROJECT_ID,
} from '../config'
import {
  SIMPLE_GAS_COST_VALUE,
  BASE_TOKEN_GAS_COST_VALUE,
} from '../constants/amount'
import { erc20ABI } from '../constants/erc20.abi'
import { ETHAssets } from '../constants/erc20Assets'
import { TCRopstenAbi } from '../constants/thorchain-ropsten.abi'
import { AmountType, Amount, Asset, AssetAmount } from '../entities'
import { Wallet, WalletOption } from './account'
import { IClient } from './client'
import { TxParams, ApproveParams, DepositParams } from './types'

// from https://github.com/MetaMask/metamask-extension/blob/ee205b893fe61dc4736efc576e0663189a9d23da/ui/app/pages/send/send.constants.js#L39
// and based on recommendations of https://ethgasstation.info/blog/gas-limit/
export const SIMPLE_GAS_COST: ethers.BigNumber = BN.from(SIMPLE_GAS_COST_VALUE)
export const BASE_TOKEN_GAS_COST: ethers.BigNumber = BN.from(
  BASE_TOKEN_GAS_COST_VALUE,
)

export interface IEthChain extends IClient {
  getClient(): EthClient
  getERC20AssetDecimal(asset: Asset): Promise<number>
  isApproved({ spender, sender }: ApproveParams): Promise<boolean>
  approve({ spender, sender }: ApproveParams): Promise<TxHash>
}

export class EthChain implements IEthChain {
  private balances: AssetAmount[] = []

  private client: EthClient

  public readonly chain: Chain

  public wallet: Wallet | null

  constructor({ network = 'testnet' }: { network?: Network }) {
    this.chain = ETHChain

    this.client = new EthClient({
      network,
      phrase: '',
      etherscanApiKey: ETHERSCAN_API_KEY,
      ethplorerApiKey: ETHPLORER_API_KEY,
      infuraCreds: { projectId: INFURA_PROJECT_ID },
    })

    this.wallet = null
  }

  /**
   * get xchain-binance client
   */
  getClient(): EthClient {
    return this.client
  }

  /**
   * Wallet Management
   */
  connectKeystore = (phrase: string) => {
    this.client = new EthClient({
      network: this.client.getNetwork(),
      phrase,
      etherscanApiKey: ETHERSCAN_API_KEY,
      ethplorerApiKey: ETHPLORER_API_KEY,
      infuraCreds: { projectId: INFURA_PROJECT_ID },
    })

    const address = this.client.getAddress()

    // add wallet
    this.wallet = new Wallet({
      address,
      chain: ETHChain,
      type: WalletOption.KEYSTORE,
    })
  }

  disconnectKeystore = () => {
    this.client.purgeClient()

    if (this.wallet?.type === WalletOption.KEYSTORE) {
      this.wallet = null
    }
  }

  connectXdefiWallet = async (xdefiClient: XdefiClient) => {
    if (!xdefiClient) throw Error('xdefi client not found')

    /**
     * 1. load chain provider
     * 2. patch getAddress method
     * 3. patch eth wallet object
     * 4. patch approve method
     * 5. patch transfer method
     * 6. patch call method
     */
    xdefiClient.loadProvider(ETHChain)

    const mockPhrase =
      'image rally need wedding health address purse army antenna leopard sea gain'
    const network = this.client.getNetwork()
    this.client = new EthClient({
      network,
      phrase: mockPhrase,
      etherscanApiKey: ETHERSCAN_API_KEY,
      ethplorerApiKey: ETHPLORER_API_KEY,
      infuraCreds: { projectId: INFURA_PROJECT_ID },
    })

    const address = await xdefiClient.getAddress(ETHChain)
    this.client.getAddress = () => address

    // patch eth wallet
    const ethWallet = this.client.getWallet()
    ethWallet.getAddress = async () => address
    ethWallet.sendTransaction = (unsignedTx) => {
      const txParam = unsignedTx
      txParam.value = hexlify(BN.from(unsignedTx.value || 0))
      return xdefiClient
        .transferERC20(txParam)
        .then((hash: string) => ({ hash }))
    }
    ethWallet.signTransaction = (unsignedTx) => {
      const txParam = unsignedTx
      txParam.value = hexlify(BN.from(txParam.value || 0))

      return xdefiClient.signTransactionERC20(txParam)
    }

    this.client.getWallet = () => {
      return ethWallet
    }

    // patch approve
    this.client.approve = async (approveParams: ClientApproveParams) => {
      const { spender, sender, amount, feeOptionKey } = approveParams

      const gasPrice =
        feeOptionKey &&
        BN.from(
          (
            await this.client
              .estimateGasPrices()
              .then((prices) => prices[feeOptionKey])
              .catch(() => {
                const {
                  gasPrices,
                } = estimateDefaultFeesWithGasPricesAndLimits()
                return gasPrices[feeOptionKey]
              })
          )
            .amount()
            .toFixed(),
        )
      const gasLimit = await this.client
        .estimateApprove({ spender, sender, amount })
        .catch(() => undefined)

      const txAmount = amount
        ? BN.from(amount.amount().toFixed())
        : BN.from(2).pow(256).sub(1)
      const contract = new ethers.Contract(sender, erc20ABI)
      const unsignedTx = await contract.populateTransaction.approve(
        spender,
        txAmount,
        {
          from: address,
          gasPrice,
          gasLimit,
        },
      )
      unsignedTx.from = address

      const txHash = await xdefiClient.transferERC20(unsignedTx)

      return txHash
    }

    this.client.transfer = async ({
      asset,
      memo,
      amount,
      recipient,
      feeOptionKey,
      gasPrice,
      gasLimit,
    }) => {
      try {
        const txAmount = BN.from(amount.amount().toFixed())

        let assetAddress
        if (asset && assetToString(asset) !== assetToString(AssetETH)) {
          assetAddress = getTokenAddress(asset)
        }

        const isETHAddress = assetAddress === ETHAddress

        // feeOptionKey
        const defaultGasLimit: ethers.BigNumber = isETHAddress
          ? SIMPLE_GAS_COST
          : BASE_TOKEN_GAS_COST

        let overrides: TxOverrides = {
          gasLimit: gasLimit || defaultGasLimit,
          gasPrice: gasPrice && BN.from(gasPrice.amount().toFixed()),
        }

        // override `overrides` if `feeOptionKey` is provided
        if (feeOptionKey) {
          const gasPriceValue = await this.client
            .estimateGasPrices()
            .then((prices) => prices[feeOptionKey])
            .catch(
              () =>
                estimateDefaultFeesWithGasPricesAndLimits().gasPrices[
                  feeOptionKey
                ],
            )
          const gasLimitValue = await this.client
            .estimateGasLimit({ asset, recipient, amount, memo })
            .catch(() => defaultGasLimit)

          overrides = {
            gasLimit: gasLimitValue,
            gasPrice: BN.from(gasPriceValue.amount().toFixed()),
          }
        }

        let txResult
        if (assetAddress && !isETHAddress) {
          // Transfer ERC20
          const contract = new ethers.Contract(assetAddress, erc20ABI)
          const unsignedTx = await contract.populateTransaction.transfer(
            recipient,
            txAmount,
            { ...overrides },
          )
          unsignedTx.from = address

          txResult = await xdefiClient.transferERC20(unsignedTx)
        } else {
          // Transfer ETH
          const transactionRequest = {
            from: address,
            to: recipient,
            value: txAmount,
            ...overrides,
            data: memo ? toUtf8Bytes(memo) : undefined,
          }
          txResult = await xdefiClient.transferERC20(transactionRequest)
        }

        return txResult.hash || txResult
      } catch (error) {
        return Promise.reject(error)
      }
    }

    this.client.call = async (
      routerAddress: string,
      abi: ethers.ContractInterface,
      func: string,
      params: Array<any>,
    ) => {
      try {
        if (!routerAddress) {
          return await Promise.reject(new Error('address must be provided'))
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()

        const contract = new ethers.Contract(
          routerAddress,
          abi,
          provider,
        ).connect(signer)
        return contract[func](...params)
      } catch (error) {
        return Promise.reject(error)
      }
    }

    // add wallet
    this.wallet = new Wallet({
      address,
      chain: ETHChain,
      type: WalletOption.XDEFI,
    })
  }

  loadBalance = async (): Promise<Wallet | null> => {
    try {
      const address = this.client.getAddress()
      const ethBalance = await this.client.getProvider().getBalance(address)

      let balances: Balance[] = await this.client.getBalance(
        this.client.getAddress(),
        this.client.getNetwork() === 'testnet' ? ETHAssets : undefined,
      )

      balances = balances.filter((balance: Balance) => balance.amount.gt(0))

      const walletBalances = await Promise.all(
        balances.map(async (data: Balance) => {
          const { asset, amount } = data

          const assetObj = new Asset(asset.chain, asset.symbol)

          // set asset decimal
          await assetObj.setDecimal(amount.decimal)

          const amountObj = assetObj.isETH()
            ? new Amount(
                new BigNumber(ethBalance.toString()),
                AmountType.BASE_AMOUNT,
                assetObj.decimal,
              )
            : new Amount(
                amount.amount(),
                AmountType.BASE_AMOUNT,
                assetObj.decimal,
              )

          return new AssetAmount(assetObj, amountObj)
        }),
      )

      this.wallet?.setBalance(walletBalances)

      return this.wallet
    } catch (error) {
      return Promise.reject(error)
    }
  }

  hasAmountInBalance = async (assetAmount: AssetAmount): Promise<boolean> => {
    try {
      await this.loadBalance()

      const assetBalance = this.wallet?.balance.find((data: AssetAmount) =>
        data.asset.eq(assetAmount.asset),
      )

      if (!assetBalance) return false

      return assetBalance.amount.gte(assetAmount.amount)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getAssetBalance = async (asset: Asset): Promise<AssetAmount> => {
    try {
      await this.loadBalance()

      const assetBalance = this.wallet?.balance.find((data: AssetAmount) =>
        data.asset.eq(asset),
      )

      if (!assetBalance)
        return new AssetAmount(asset, Amount.fromAssetAmount(0, asset.decimal))

      return assetBalance
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * transfer on binance chain
   * @param {TxParams} tx transfer parameter
   */
  transfer = async (tx: TxParams): Promise<TxHash> => {
    // use xchainjs-client standard internally
    try {
      const {
        assetAmount,
        recipient,
        memo,
        feeRate,
        feeOptionKey = 'fast',
      } = tx
      const { asset } = assetAmount
      const amount = baseAmount(assetAmount.amount.baseAmount, asset.decimal)

      // estimate gas limit
      const defaultGasLimit: ethers.BigNumber = asset.isETH()
        ? SIMPLE_GAS_COST
        : BASE_TOKEN_GAS_COST

      const gasLimit = await this.client
        .estimateGasLimit({ asset, recipient, amount, memo })
        .catch(() => defaultGasLimit)

      const feeParam = feeRate
        ? {
            gasLimit,
            gasPrice: baseAmount(
              parseUnits(String(feeRate), 'gwei').toString(),
              ETH_DECIMAL,
            ),
          }
        : { feeOptionKey }

      const txHash = await this.client.transfer({
        asset: asset.getAssetObj(),
        amount,
        recipient,
        memo,
        gasLimit,
        ...feeParam,
      })

      return txHash
    } catch (error) {
      return Promise.reject(error)
    }
  }

  deposit = async (params: DepositParams): Promise<TxHash> => {
    const {
      assetAmount,
      recipient,
      memo,
      feeRate,
      feeOptionKey = 'fast',
      router,
    } = params

    const { asset } = assetAmount

    // deposit base amount
    const amount = assetAmount.amount.baseAmount
      .integerValue(BigNumber.ROUND_DOWN)
      .toFixed()

    const checkSummedAddress = this.getCheckSumAddress(asset)

    // get gas amount based on the fee option
    const gasPrice = feeRate
      ? parseUnits(String(feeRate), 'gwei').toString()
      : (await this.client.estimateGasPrices())[feeOptionKey]
          .amount()
          .toFixed(0)

    const contractParams = [
      recipient, // vault address
      checkSummedAddress, // asset checksum address
      amount, // deposit amount
      memo,
      asset.isETH()
        ? {
            from: this.client.getAddress(),
            value: amount,
            gasPrice,
          }
        : { gasPrice },
    ]

    if (!router) {
      throw Error('invalid router')
    }

    const res: any = await this.client.call(
      router,
      TCRopstenAbi,
      'deposit',
      contractParams,
    )

    return res?.hash ?? ''
  }

  /**
   * @param param0 approve params
   * @returns approved status
   */
  isApproved = async ({ spender, sender }: ApproveParams): Promise<boolean> => {
    return this.client.isApproved(spender, sender, baseAmount(1, ETH_DECIMAL))
  }

  /**
   * @param param0 approve params
   * @returns approved status
   */
  approve = async ({
    spender,
    sender,
    feeOptionKey = 'fast',
  }: ApproveParams): Promise<TxHash> => {
    const response = await this.client.approve({
      spender,
      sender,
      feeOptionKey,
    })

    return response.hash
  }

  /**
   * get decimal for ERC20 token
   * @param asset ERC20 token
   * @returns decimal number
   */
  getERC20AssetDecimal = async (asset: Asset): Promise<number> => {
    if (asset.chain === 'ETH') {
      if (asset.symbol === 'ETH') {
        return ETH_DECIMAL
      }

      const assetAddress = asset.symbol.slice(asset.ticker.length + 1)
      const strip0x = assetAddress.substr(2)
      const checkSummedAddress = ethers.utils.getAddress(strip0x)
      const tokenContract = new ethers.Contract(
        checkSummedAddress,
        erc20ABI,
        this.client.getWallet(),
      )
      const tokenDecimals = await tokenContract.decimals()

      return tokenDecimals.toNumber()
    }
    throw new Error('invalid eth chain')
  }

  getCheckSumAddress = (asset: Asset): string => {
    if (asset.isETH()) return ETHAddress

    const assetAddress = getTokenAddress(asset.getAssetObj())

    if (assetAddress) {
      return ethers.utils.getAddress(assetAddress.toLowerCase())
    }

    throw new Error('invalid eth asset address')
  }
}
