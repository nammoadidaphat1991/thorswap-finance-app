import {
  TxHash,
  Network,
  Fees,
  TxsPage,
  TxHistoryParams,
  Tx,
  FeeOptionKey,
} from '@xchainjs/xchain-client'
import { decryptFromKeystore, Keystore } from '@xchainjs/xchain-crypto'
import { getTokenAddress } from '@xchainjs/xchain-ethereum'
import {
  baseAmount,
  Chain,
  BTCChain,
  BNBChain,
  THORChain,
  ETHChain,
  LTCChain,
  BCHChain,
} from '@xchainjs/xchain-util'
import { MetaMaskClient, WalletStatus } from 'metamask-sdk'
import {
  MidgardV2,
  NetworkType as MidgardNetwork,
  InboundAddressesItem,
} from 'midgard-sdk'

import { XdefiClient } from '../../xdefi-sdk/xdefi'
import { Swap, Memo, Asset, AssetAmount } from '../entities'
import { getFeeRate } from '../utils/fee'
import { removeAddressPrefix } from '../utils/wallet'
import { BnbChain } from './binance'
import { BtcChain } from './bitcoin'
import { BchChain } from './bitcoinCash'
import { EthChain } from './ethereum'
import { LtcChain } from './litecoin'
import { ThorChain } from './thorchain'
import { getInboundDataByChain } from './thornode'
import {
  TxParams,
  AddLiquidityParams,
  WithdrawParams,
  Wallet,
  ChainWallet,
  supportedChains,
  SupportedChain,
  AddLiquidityTxns,
  UpgradeParams,
  WalletOption,
} from './types'

// specifying non-eth client is needed for getFees method
type NonETHChainClient = BnbChain | BtcChain | LtcChain | ThorChain

// thorchain pool address is empty string
const THORCHAIN_POOL_ADDRESS = ''

export interface IMultiChain {
  chains: typeof supportedChains
  midgard: MidgardV2
  network: string

  wallets: Wallet | null

  thor: ThorChain
  btc: BtcChain
  bnb: BnbChain
  eth: EthChain
  ltc: LtcChain
  bch: BchChain

  feeOption: FeeOptionKey

  resetClients(): void

  getPhrase(): string
  connectKeystore(phrase: string): void
  validateKeystore(keystore: Keystore, password: string): Promise<boolean>

  connectXDefiWallet(): Promise<void>
  connectAllClientsToXDefi(): Promise<void>

  getMidgard(): MidgardV2

  getChainClient(chain: Chain): void

  getInboundDataByChain(chain: Chain): Promise<InboundAddressesItem>

  getWalletByChain(chain: Chain): Promise<ChainWallet | null>
  loadAllWallets(): Promise<Wallet | null>
  getWalletAddressByChain(chain: Chain): string | null

  validateAddress({
    address,
    chain,
  }: {
    address: string
    chain: Chain
  }): boolean

  getExplorerUrl(chain: Chain): string
  getExplorerAddressUrl(chain: Chain, address: string): string
  getExplorerTxUrl(chain: Chain, txHash: string): string

  getTransactions(chain: Chain, params?: TxHistoryParams): Promise<TxsPage>
  getTransactionData(chain: Chain, txHash: string): Promise<Tx>

  setFeeOption(option: FeeOptionKey): void
  getFees(chain: Chain): Promise<Fees>

  isAssetApproved(asset: Asset): Promise<boolean>
  approveAsset(asset: Asset): Promise<TxHash | null>

  send(tx: TxParams): Promise<TxHash>
  transfer(tx: TxParams, native?: boolean): Promise<TxHash>
  swap(swap: Swap, recipient?: string): Promise<TxHash>
  addLiquidity(params: AddLiquidityParams): Promise<AddLiquidityTxns>
  withdraw(params: WithdrawParams): Promise<TxHash>
  upgrade(params: UpgradeParams): Promise<TxHash>
}

export class MultiChain implements IMultiChain {
  private phrase: string

  private xdefiClient: XdefiClient | null = null

  private metamaskClient: MetaMaskClient | null = null

  private wallet: Wallet | null = null

  public readonly chains = supportedChains

  public readonly midgard: MidgardV2

  public readonly network: Network

  public thor: ThorChain

  public btc: BtcChain

  public bnb: BnbChain

  public eth: EthChain

  public bch: BchChain

  public ltc: LtcChain

  public feeOption: FeeOptionKey = 'fast'

  constructor({
    network = 'testnet',
    phrase = '',
  }: {
    network?: Network
    phrase?: string
  }) {
    this.network = network
    this.phrase = phrase

    // create midgard client
    this.midgard = new MidgardV2(MultiChain.getMidgardNetwork(network))

    // create chain clients
    this.thor = new ThorChain({ network })
    this.bnb = new BnbChain({ network })
    this.btc = new BtcChain({ network })
    this.eth = new EthChain({ network })
    this.ltc = new LtcChain({ network })
    this.bch = new BchChain({ network })
  }

  connectXDefiWallet = async (): Promise<void> => {
    this.xdefiClient = new XdefiClient(this.network)

    if (!this.xdefiClient.isWalletDetected()) {
      throw Error('xdefi wallet not detected')
    }

    this.resetClients()

    await this.connectAllClientsToXDefi()

    this.resetWallets()
  }

  connectMetamask = async (): Promise<void> => {
    this.metamaskClient = new MetaMaskClient(this.network)

    if (
      this.metamaskClient.isWalletDetected() !== WalletStatus.MetaMaskDetected
    ) {
      throw Error('metamask wallet not detected')
    }

    await this.eth.connectMetaMask(this.metamaskClient)
    const metamaskAddress = this.eth.getClient().getAddress().toLowerCase()

    if (!this.wallet) this.initWallets()

    if (this.wallet) {
      this.wallet = {
        ...this.wallet,
        [ETHChain]: {
          address: metamaskAddress,
          balance: [],
          walletType: WalletOption.METAMASK,
        },
      }
    }
  }

  // patch client methods to use xdefi request and address
  connectAllClientsToXDefi = async () => {
    if (!this.xdefiClient) throw Error('xdefi client not found')

    await this.thor.connectXdefiWallet(this.xdefiClient)
    await this.btc.connectXdefiWallet(this.xdefiClient)
    await this.bch.connectXdefiWallet(this.xdefiClient)
    await this.ltc.connectXdefiWallet(this.xdefiClient)
    await this.bnb.connectXdefiWallet(this.xdefiClient)
    await this.eth.connectXdefiWallet(this.xdefiClient)
  }

  initWallets = () => {
    this.wallet = {
      [BTCChain]: null,
      [BNBChain]: null,
      [BCHChain]: null,
      [LTCChain]: null,
      [ETHChain]: null,
      [THORChain]: null,
    }
  }

  // reload wallet address and reset balance
  resetWallets = () => {
    this.initWallets()

    this.chains.forEach((chain: SupportedChain) => {
      const chainClient = this.getChainClient(chain)

      if (chainClient) {
        const { walletType } = chainClient

        if (walletType && this.wallet) {
          const address = removeAddressPrefix(
            chainClient.getClient().getAddress().toLowerCase(),
          )

          this.wallet[chain] = {
            address,
            balance: [],
            walletType,
          }
        }
      }
    })
  }

  resetClients = () => {
    this.phrase = ''
    this.wallet = null

    // reset all clients
    this.thor = new ThorChain({ network: this.network })
    this.bnb = new BnbChain({ network: this.network })
    this.btc = new BtcChain({ network: this.network })
    this.eth = new EthChain({ network: this.network })
    this.ltc = new LtcChain({ network: this.network })
    this.bch = new BchChain({ network: this.network })
  }

  connectKeystore = (phrase: string) => {
    this.phrase = phrase

    this.bnb.connectKeystore(phrase)
    this.btc.connectKeystore(phrase)
    this.ltc.connectKeystore(phrase)
    this.bch.connectKeystore(phrase)
    this.thor.connectKeystore(phrase)
    this.eth.connectKeystore(phrase)

    this.resetWallets()
  }

  getPhrase = () => {
    return this.phrase
  }

  // used to validate keystore and password with phrase
  validateKeystore = async (keystore: Keystore, password: string) => {
    const phrase = await decryptFromKeystore(keystore, password)

    return phrase === this.phrase
  }

  /**
   * return midgard network type
   *
   * @param network mainnet or testnet
   */
  public static getMidgardNetwork(network: Network): MidgardNetwork {
    if (network === 'testnet') return 'testnet'
    return 'chaosnet'
  }

  get wallets(): Wallet | null {
    return this.wallet
  }

  /**
   * get midgard client
   */
  getMidgard(): MidgardV2 {
    return this.midgard
  }

  getInboundDataByChain = async (
    chain: Chain,
  ): Promise<InboundAddressesItem> => {
    try {
      // for thorchain, return empty string
      if (chain === THORChain) {
        return {
          address: THORCHAIN_POOL_ADDRESS,
          halted: false,
          chain: 'THORChain',
          pub_key: '',
        }
      }

      const inboundData = await getInboundDataByChain(chain, this.network)

      return inboundData
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getChainClient = (chain: Chain) => {
    if (chain === THORChain) return this.thor
    if (chain === BNBChain) return this.bnb
    if (chain === BTCChain) return this.btc
    if (chain === ETHChain) return this.eth
    if (chain === LTCChain) return this.ltc
    if (chain === BCHChain) return this.bch

    return null
  }

  getWalletByChain = async (chain: Chain): Promise<ChainWallet | null> => {
    const chainClient = this.getChainClient(chain)

    if (!chainClient) throw new Error('invalid chain')

    try {
      const { walletType } = chainClient

      if (!walletType) return null

      const balance = (await chainClient?.loadBalance()) ?? []
      const address = removeAddressPrefix(
        chainClient.getClient().getAddress().toLowerCase(),
      )

      if (this.wallet && chain in this.wallet) {
        this.wallet = {
          ...this.wallet,
          [chain]: {
            address,
            balance,
            walletType,
          },
        }
      }

      return {
        address,
        balance,
        walletType,
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  loadAllWallets = async (): Promise<Wallet | null> => {
    try {
      await Promise.all(
        this.chains.map((chain: SupportedChain) => {
          return new Promise((resolve) => {
            this.getWalletByChain(chain)
              .then((data) => resolve(data))
              .catch((err) => {
                console.log(err)
                resolve([])
              })
          })
        }),
      )

      console.log('wallet loaded:', this.wallet)
      return this.wallet
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getWalletAddressByChain = (chain: Chain): string | null => {
    if (this.wallet && chain in this.wallet) {
      const addr = this.wallet?.[chain as SupportedChain]?.address ?? null

      if (addr) {
        return removeAddressPrefix(addr)
      }
    }

    return null
  }

  validateAddress = ({
    address,
    chain,
  }: {
    address: string
    chain: Chain
  }): boolean => {
    const chainClient = this.getChainClient(chain)
    if (!chainClient) return false

    return chainClient.getClient().validateAddress(address)
  }

  getExplorerUrl = (chain: Chain): string => {
    const chainClient = this.getChainClient(chain)
    if (!chainClient) return '#'

    return chainClient.getClient().getExplorerUrl()
  }

  getExplorerAddressUrl = (chain: Chain, address: string): string => {
    if (chain === THORChain) {
      if (this.network === 'mainnet') {
        return `https://viewblock.io/thorchain/address/${address}`
      }
      return `https://viewblock.io/thorchain/address/${address}?network=testnet`
    }

    const chainClient = this.getChainClient(chain)
    if (!chainClient) return '#'

    return chainClient.getClient().getExplorerAddressUrl(address)
  }

  getExplorerTxUrl = (chain: Chain, txHash: string): string => {
    const chainClient = this.getChainClient(chain)

    if (!chainClient) return '#'

    // add 0x suffix for eth chain
    if (chain === ETHChain) {
      if (txHash.substr(0, 2).toLowerCase() !== '0x') {
        return chainClient.getClient().getExplorerTxUrl(`0x${txHash}`)
      }
    }

    // return viewblock for thorchain txns
    if (chain === THORChain) {
      if (this.network === 'mainnet') {
        return `https://viewblock.io/thorchain/tx/${txHash}`
      }
      return `https://viewblock.io/thorchain/tx/${txHash}?network=testnet`
    }

    return chainClient.getClient().getExplorerTxUrl(txHash)
  }

  getTransactions = (
    chain: Chain,
    params?: TxHistoryParams,
  ): Promise<TxsPage> => {
    const chainClient = this.getChainClient(chain)
    if (!chainClient || !params) throw new Error('invalid chain')

    return chainClient.getClient().getTransactions(params)
  }

  getTransactionData = (chain: Chain, txHash: string): Promise<Tx> => {
    const chainClient = this.getChainClient(chain)
    if (!chainClient) throw new Error('invalid chain')

    return chainClient.getClient().getTransactionData(txHash)
  }

  setFeeOption = (option: FeeOptionKey) => {
    this.feeOption = option
  }

  getFees = (chain: Chain, tx?: TxParams): Promise<Fees> => {
    const chainClient = this.getChainClient(chain)
    if (!chainClient) throw new Error('invalid chain')

    if (chain === 'ETH' && tx) {
      const { assetAmount, recipient } = tx
      const { asset } = assetAmount
      const amount = baseAmount(assetAmount.amount.baseAmount, asset.decimal)

      const assetObj = {
        chain: asset.chain,
        symbol: asset.symbol,
        ticker: asset.ticker,
      }
      return chainClient.getClient().getFees({
        asset: assetObj,
        amount,
        recipient,
      })
    }

    return (chainClient as NonETHChainClient).getClient().getFees()
  }

  isAssetApproved = async (asset: Asset): Promise<boolean> => {
    if (asset.chain !== ETHChain || asset.isETH()) return true

    const { router } = await this.getInboundDataByChain(ETHChain)

    const assetAddress = getTokenAddress(asset.getAssetObj())

    if (router && assetAddress) {
      const isApproved = await this.eth.isApproved({
        spender: router,
        sender: assetAddress,
      })

      return isApproved
    }

    return false
  }

  approveAsset = async (asset: Asset): Promise<TxHash | null> => {
    if (asset.chain !== ETHChain || asset.isETH()) return null

    const { router } = await this.getInboundDataByChain(ETHChain)

    const assetAddress = getTokenAddress(asset.getAssetObj())

    if (router && assetAddress) {
      return this.eth.approve({
        spender: router,
        sender: assetAddress,
        feeOptionKey: this.feeOption,
      })
    }

    return null
  }

  /**
   * cross-chain transfer tx
   * @param {TxParams} tx transfer parameter
   */
  transfer = async (
    tx: TxParams & { router?: string },
    native = true,
  ): Promise<TxHash> => {
    const { chain } = tx.assetAmount.asset

    // for swap, add, withdraw tx in thorchain, send deposit tx
    if (
      chain === THORChain &&
      tx.recipient === THORCHAIN_POOL_ADDRESS &&
      native
    ) {
      return this.thor.deposit(tx)
    }

    // call deposit contract for eth chain
    if (chain === ETHChain) {
      if (tx.router) {
        return this.eth.deposit({
          ...tx,
          router: tx.router,
        })
      }
      throw new Error('Invalid ETH Router')
    }

    const chainClient = this.getChainClient(chain)
    if (chainClient) {
      try {
        return await chainClient.transfer(tx)
      } catch (error) {
        return Promise.reject(error)
      }
    } else {
      throw new Error('Chain does not exist')
    }
  }

  /**
   * normal send tx
   * @param {TxParams} tx transfer parameter
   */
  send = async (tx: TxParams): Promise<TxHash> => {
    const { chain } = tx.assetAmount.asset

    const inboundData = await this.getInboundDataByChain(chain)

    const feeRate = getFeeRate({ inboundData, feeOptionKey: this.feeOption })

    const chainClient = this.getChainClient(chain)
    if (chainClient) {
      try {
        return await chainClient.transfer({ ...tx, feeRate })
      } catch (error) {
        return Promise.reject(error)
      }
    } else {
      throw new Error('Chain does not exist')
    }
  }

  /**
   * swap assets
   * @param {Swap} swap Swap Object
   */
  swap = async (swap: Swap, recipient?: string): Promise<TxHash> => {
    /**
     * 1. check if swap has sufficient fee
     * 2. get inbound address
     * 3. get swap memo
     * 4. transfer input asset to inbound address
     */

    try {
      if (!this.wallet) {
        return await Promise.reject(new Error('Wallet not detected'))
      }

      const walletAddress = this.getWalletAddressByChain(swap.outputAsset.chain)

      if (!walletAddress) {
        return await Promise.reject(new Error('Wallet Address not detected'))
      }

      if (swap.hasInSufficientFee) {
        return await Promise.reject(new Error('Insufficient Fee'))
      }

      const recipientAddress = recipient || walletAddress

      const inboundData = await this.getInboundDataByChain(
        swap.inputAsset.chain,
      )

      const { address: poolAddress, router } = inboundData
      const feeRate = getFeeRate({ inboundData, feeOptionKey: this.feeOption })

      const memo = Memo.swapMemo(
        swap.outputAsset,
        recipientAddress,
        swap.minOutputAmount, // slip limit
      )

      return await this.transfer({
        assetAmount: swap.inputAmount,
        recipient: poolAddress,
        memo,
        router,
        feeRate: feeRate ? Number(feeRate) : undefined,
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * add liquidity to pool
   * @param {AddLiquidityParams} params
   */
  addLiquidity = async (
    params: AddLiquidityParams,
    type = 'auto',
  ): Promise<AddLiquidityTxns> => {
    /**
     * 1. get pool address
     * 2. get add liquidity memo
     * 3. check add type (Sym or Asym add)
     * 4. add liquidity to pool
     */

    try {
      const { pool, runeAmount, assetAmount } = params
      const { chain } = pool.asset

      const inboundData = await this.getInboundDataByChain(chain)
      const { address: poolAddress, router } = inboundData

      const feeRate = getFeeRate({ inboundData, feeOptionKey: this.feeOption })

      const assetAddress = this.getWalletAddressByChain(chain) || ''
      const thorAddress = this.getWalletAddressByChain(THORChain) || ''

      // used for sym deposit recovery
      if (type === 'sym_rune') {
        if (runeAmount?.gt(0)) {
          const runeTx = await this.transfer({
            assetAmount: runeAmount,
            recipient: THORCHAIN_POOL_ADDRESS,
            memo: Memo.depositMemo(pool.asset, assetAddress),
            feeRate,
          })

          return {
            runeTx,
          }
        }
        throw Error('invalid rune amount')
      } else if (type === 'sym_asset') {
        if (assetAmount?.gt(0)) {
          const assetTx = await this.transfer({
            assetAmount,
            recipient: poolAddress,
            memo: Memo.depositMemo(pool.asset, thorAddress),
            feeRate,
          })

          return {
            assetTx,
          }
        }

        throw Error('invalid asset amount')
      }

      // sym stake
      if (runeAmount && runeAmount.gt(0) && assetAmount && assetAmount.gt(0)) {
        // 1. send asset tx
        const assetTx = await this.transfer({
          assetAmount,
          recipient: poolAddress,
          memo: Memo.depositMemo(pool.asset, thorAddress),
          router,
          feeRate,
        })

        // 2. send rune tx (NOTE: recipient should be empty string)
        const runeTx = await this.transfer({
          assetAmount: runeAmount,
          recipient: THORCHAIN_POOL_ADDRESS,
          memo: Memo.depositMemo(pool.asset, assetAddress),
          feeRate,
        })

        return {
          runeTx,
          assetTx,
        }
      }

      // asym deposit for asset
      if (!runeAmount || runeAmount.lte(0)) {
        if (!assetAmount || assetAmount.lte(0)) {
          return await Promise.reject(new Error('Invalid Asset Amount'))
        }

        const assetTx = await this.transfer({
          assetAmount,
          recipient: poolAddress,
          memo: Memo.depositMemo(pool.asset),
          router,
          feeRate,
        })

        return {
          assetTx,
        }
      }

      // asym deposit for rune
      const runeTx = await this.transfer({
        assetAmount: runeAmount,
        recipient: THORCHAIN_POOL_ADDRESS,
        memo: Memo.depositMemo(pool.asset),
        feeRate,
      })

      return {
        runeTx,
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * withdraw asset from pool
   * @param {WithdrawParams} params
   */
  withdraw = async (params: WithdrawParams): Promise<TxHash> => {
    /**
     * 1. get pool address
     * 2. get withdraw memo
     * 3. transfer withdraw tx
     */

    const { pool, percent, from, to } = params

    if ((from === 'sym' && to === 'sym') || from === 'rune') {
      const memo = Memo.withdrawMemo(pool.asset, percent)

      // get thorchain pool address
      const inboundData = await this.getInboundDataByChain(THORChain)
      const { address: poolAddress } = inboundData
      const feeRate = getFeeRate({ inboundData, feeOptionKey: this.feeOption })

      const txHash = await this.transfer({
        assetAmount: AssetAmount.getMinAmountByChain(THORChain),
        recipient: poolAddress,
        memo,
        feeRate,
      })

      return txHash
    }
    if (from === 'asset') {
      const memo = Memo.withdrawMemo(pool.asset, percent)

      // get inbound address for asset chain
      const inboundData = await this.getInboundDataByChain(pool.asset.chain)
      const { address: poolAddress, router } = inboundData
      const feeRate = getFeeRate({ inboundData, feeOptionKey: this.feeOption })

      const txHash = await this.transfer({
        assetAmount: AssetAmount.getMinAmountByChain(pool.asset.chain),
        recipient: poolAddress,
        memo,
        router,
        feeRate,
      })

      return txHash
    }

    // from = sym, to = rune or asset

    if (to === 'rune') {
      const memo = Memo.withdrawMemo(pool.asset, percent, Asset.RUNE())

      // get thorchain pool address
      const inboundData = await this.getInboundDataByChain(THORChain)
      const { address: poolAddress } = inboundData
      const feeRate = getFeeRate({ inboundData, feeOptionKey: this.feeOption })

      const txHash = await this.transfer({
        assetAmount: AssetAmount.getMinAmountByChain(THORChain),
        recipient: poolAddress,
        memo,
        feeRate,
      })

      return txHash
    }

    // from = sym, to = asset
    const memo = Memo.withdrawMemo(pool.asset, percent, pool.asset)

    // get thorchain pool address
    const inboundData = await this.getInboundDataByChain(THORChain)
    const { address: poolAddress } = inboundData
    const feeRate = getFeeRate({ inboundData, feeOptionKey: this.feeOption })

    const txHash = await this.transfer({
      assetAmount: AssetAmount.getMinAmountByChain(THORChain),
      recipient: poolAddress,
      memo,
      feeRate,
    })

    return txHash
  }

  /**
   * Upgrade asset from pool
   * @param {UpgradeParams} params
   */
  upgrade = async (params: UpgradeParams): Promise<TxHash> => {
    /**
     * 1. get pool address
     * 2. get rune wallet address (BNB.RUNE or ETH.RUNE)
     * 3. get upgrade memo
     * 4. transfer upgrade tx
     */

    try {
      const { runeAmount } = params
      const { chain } = runeAmount.asset

      const inboundData = await this.getInboundDataByChain(chain)
      const { address: poolAddress, router } = inboundData
      const feeRate = getFeeRate({ inboundData, feeOptionKey: this.feeOption })

      const walletAddress = this.getWalletAddressByChain(THORChain)

      if (!walletAddress) {
        throw Error('rune wallet not found')
      }

      const memo = Memo.upgradeMemo(walletAddress)

      if (chain === BNBChain) {
        const txHash = await this.transfer({
          assetAmount: runeAmount,
          recipient: poolAddress,
          memo,
          feeRate,
        })
        return txHash
      }

      if (chain === ETHChain && router) {
        const txHash = await this.transfer({
          router,
          assetAmount: runeAmount,
          recipient: poolAddress,
          memo,
          feeRate,
        })
        return txHash
      }

      throw Error('upgrade failed')
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
