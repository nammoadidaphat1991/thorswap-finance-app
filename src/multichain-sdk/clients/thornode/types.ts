export type ThornodeNetwork = 'mainnet' | 'testnet'

export interface InboundAddressesItem {
  /**
   *
   * @type {string}
   * @memberof InboundAddressesItem
   */
  address: string
  /**
   *
   * @type {string}
   * @memberof InboundAddressesItem
   */
  chain: string
  /**
   *
   * @type {string}
   * @memberof InboundAddressesItem
   */
  gas_rate?: string
  /**
   * indicate whether this chain has halted
   * @type {boolean}
   * @memberof InboundAddressesItem
   */
  halted: boolean
  /**
   *
   * @type {string}
   * @memberof InboundAddressesItem
   */
  pub_key: string
  /**
   *
   * @type {string}
   * @memberof InboundAddressesItem
   */
  router?: string
}
