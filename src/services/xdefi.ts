import { config } from 'settings/config'

import { XdefiClient } from '../xdefi-sdk'

const xdefi = new XdefiClient(config.network)

export { xdefi }
