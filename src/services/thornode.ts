import axios, { AxiosResponse } from 'axios'
import { InboundAddressesItem } from 'midgard-sdk'

import { LiquidityProvider } from 'redux/midgard/types'

import { config } from 'settings/config'

const THORNODE_API_URI =
  config.network === 'testnet'
    ? 'https://testnet.thornode.thorchain.info/thorchain'
    : 'https://thornode.thorchain.info/thorchain'

const thornodeAPI = (url: string) => `${THORNODE_API_URI}/${url}`

// https://docs.thorchain.org/how-it-works/governance#mimir

export const getThorchainMimir = () => {
  return axios.get(thornodeAPI('mimir'))
}

export const getInboundData = (): Promise<
  AxiosResponse<InboundAddressesItem[]>
> => {
  return axios.get(thornodeAPI('inbound_addresses'))
}

export const getLiquidityProvider = ({
  asset,
  address,
}: {
  asset: string
  address: string
}): Promise<AxiosResponse<LiquidityProvider>> => {
  return axios.get(thornodeAPI(`pool/${asset}/liquidity_provider/${address}`))
}
