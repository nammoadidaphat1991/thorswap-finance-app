import { config } from 'settings/config'

import { MetaMaskClient } from '../metamask-sdk'

const metamask = new MetaMaskClient(config.network)

export { metamask }
