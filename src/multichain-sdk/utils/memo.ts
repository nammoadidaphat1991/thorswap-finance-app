// add identifier in the last 3 digits of tradelimit

import { MULTICHAIN_DECIMAL } from '../constants/decimals'
import { Amount } from '../entities/amount'

const TRADE_IDENTIFIER = '111'

const addIdentifier = (limitString: string) => {
  // remove last 3 digits with 0
  const limit = Math.floor(Number(limitString) / 1000)

  return `${limit}${TRADE_IDENTIFIER}`
}

export const getTradeLimitWithIdentifier = (limit?: Amount) => {
  // should be standard 1e8 format, even for ETH chain assets
  // 1. get asset amount
  // 2. switch to 1e8 base amount
  // 3. add identifier - 111 to the last 3 digits

  const limitString = limit
    ? addIdentifier(limit.mul(10 ** MULTICHAIN_DECIMAL).assetAmount.toFixed(0))
    : ''

  return limitString
}
