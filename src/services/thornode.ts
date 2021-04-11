import axios from 'axios'

import { config } from 'settings/config'

const THORNODE_API_URI =
  config.network === 'mainnet'
    ? 'https://testnet.thornode.thorchain.info/thorchain'
    : 'https://thornode.thorchain.info/thorchain'

const thornodeAPI = (url: string) => `${THORNODE_API_URI}/${url}/`

// https://docs.thorchain.org/how-it-works/governance#mimir

export const getThorchainMimir = () => {
  return axios.get(thornodeAPI('mimir'))
}
