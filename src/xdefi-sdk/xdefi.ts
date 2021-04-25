import {
  Provider,
  providersList,
  BTCChain,
  BNBChain,
  THORChain,
  ETHChain,
  LTCChain,
  BCHChain,
  THORCHAIN_POOL_ADDRESS,
} from './constants'
import {
  Network,
  SupportedChain,
  supportedChains,
  TxParams,
  XdefiTxParams,
} from './types'
import { assetFromString } from './utils'

declare global {
  interface Window {
    xfi: any
    ethereum: any
  }
}

export interface IXdefiClient {
  network: Network
  supportedChains: typeof supportedChains
  providers: Provider[]

  isWalletDetected(): boolean
  getAddress(chain: SupportedChain): string
}

export class XdefiClient {
  network: Network = 'testnet'

  providers = providersList

  supportedChains = supportedChains

  private xdefi: any

  private eth: any

  private btc: any

  private bnb: any

  private bch: any

  private ltc: any

  private thor: any

  constructor(network: Network) {
    this.network = network

    if (typeof window === 'object') {
      this.xdefi = window.xfi
      this.eth = window.ethereum
      this.btc = window.xfi.bitcoin
      this.bnb = window.xfi.binance
      this.bch = window.xfi.bitcoincash
      this.ltc = window.xfi.litecoin
      this.thor = window.xfi.thorchain
    }
  }

  // reload all providers
  reloadProviders = () => {
    if (typeof window === 'object') {
      this.xdefi = window.xfi
      this.eth = window.ethereum
      this.btc = window.xfi.bitcoin
      this.bnb = window.xfi.binance
      this.bch = window.xfi.bitcoincash
      this.ltc = window.xfi.litecoin
      this.thor = window.xfi.thorchain
    }
  }

  // load xdefi provider for chain
  loadProvider = (chain: SupportedChain) => {
    if (typeof window === 'object') {
      if (chain === BTCChain) this.btc = window.xfi.bitcoin
      if (chain === BNBChain) this.bnb = window.xfi.binance
      if (chain === ETHChain) this.eth = window.ethereum
      if (chain === BCHChain) this.bch = window.xfi.bitcoincash
      if (chain === LTCChain) this.ltc = window.xfi.litecoin

      this.thor = window.xfi.thorchain
    }
  }

  /**
   * get xdefi client for chain
   * @param chain supported chain network
   * @returns get chain client
   */
  getChainClient = (chain: SupportedChain) => {
    this.loadProvider(chain)

    if (chain === BTCChain) return this.btc
    if (chain === BNBChain) return this.bnb
    if (chain === ETHChain) return this.eth
    if (chain === BCHChain) return this.bch
    if (chain === LTCChain) return this.ltc

    return this.thor
  }

  /**
   * get wallet address for chain
   * @param chain supported chain network
   * @returns wallet address
   */
  getAddress = async (chain: SupportedChain): Promise<string> => {
    if (chain === ETHChain) {
      if (!this.eth) throw Error('ethereum provider does not exist')

      const accounts = await this.eth.request({
        method: 'eth_requestAccounts',
        params: [],
      })

      return accounts[0]
    }

    const chainClient = this.getChainClient(chain)

    if (!chainClient) throw Error(`${chain} provider does not exist`)

    const accounts = await chainClient.request({
      method: 'request_accounts',
      params: [],
    })

    return accounts[0]
  }

  /**
   * normal transfer
   * @param chain supported chain
   * @returns tx hash
   */
  transfer = async (txParams: TxParams): Promise<string> => {
    const { asset, amount, decimal, recipient, memo } = txParams
    const assetObj = assetFromString(asset)

    if (!assetObj) throw Error('invalid asset')
    const { chain } = assetObj

    /**
     * 1. get wallet client for chain
     * 2. get wallet address
     * 3. compose tx param
     * 4. request transfer
     */

    const chainClient = this.getChainClient(chain as SupportedChain)
    const address = await this.getAddress(chain as SupportedChain)

    const params: XdefiTxParams[] = [
      {
        from: address,
        amount: {
          amount,
          decimals: decimal,
        },
        recipient,
        memo,
      },
    ]

    const txHash = await chainClient.request({
      method: 'transfer',
      params,
    })

    return txHash
  }

  /**
   * vault transfer (normal send for btc, bnb, ltc, tch. deposit for eth, thor)
   * @param chain supported chain
   * @returns tx hash
   */
  vaultTransfer = async (txParams: TxParams): Promise<string> => {
    const { asset, amount, decimal, recipient, memo } = txParams
    const assetObj = assetFromString(asset)

    if (!assetObj) throw Error('invalid asset')
    const { chain } = assetObj

    /**
     * 1. get wallet client for chain
     * 2. get wallet address
     * 3. compose tx param
     * 4. request vault transfer
     */

    const chainClient = this.getChainClient(chain as SupportedChain)
    const address = await this.getAddress(chain as SupportedChain)

    const params: XdefiTxParams[] = [
      {
        from: address,
        amount: {
          amount,
          decimals: decimal,
        },
        recipient,
        memo,
      },
    ]

    if (chain === THORChain) {
      return this.depositTHOR([
        {
          ...params[0],
          recipient: THORCHAIN_POOL_ADDRESS,
        },
      ])
    }

    const txHash = await chainClient.request({
      method: 'transfer',
      params,
    })

    return txHash
  }

  /**
   * request thorchain deposit
   * @param params xdefi request params
   * @returns txhash string
   */
  depositTHOR = async (params: XdefiTxParams[]): Promise<string> => {
    if (!this.thor) throw Error('THORChain Provider not found')

    const txHash = await this.thor.request({
      method: 'deposit',
      params,
    })

    return txHash
  }

  /**
   * request transfer erc20
   * @param txParams xdefi request param
   * @returns txhash string
   */
  transferERC20 = async (txParams: any) => {
    const txHash = await this.eth.request({
      method: 'eth_sendTransaction',
      params: [txParams],
    })

    return txHash
  }

  /**
   * request sign erc20
   * @param txParams xdefi request param
   * @returns txhash string
   */
  signTransactionERC20 = async (txParams: any) => {
    const txHash = await this.eth.request({
      method: 'eth_signTransaction',
      params: [txParams],
    })

    return txHash
  }
}
