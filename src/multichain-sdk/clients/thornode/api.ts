import axios, { AxiosResponse } from 'axios'

import { thornodeAPI } from './config'
import { ThornodeNetwork, InboundAddressesItem } from './types'

export const getInboundData = (
  network: ThornodeNetwork,
): Promise<AxiosResponse<InboundAddressesItem[]>> => {
  return axios.get(thornodeAPI('inbound_addresses', network))
}

// https://docs.thorchain.org/how-it-works/governance#mimir
export const getThorchainMimir = (network: ThornodeNetwork) => {
  return axios.get(thornodeAPI('mimir', network))
}
