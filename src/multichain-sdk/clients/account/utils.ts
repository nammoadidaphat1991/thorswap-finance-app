import { BigNumber } from 'bignumber.js'

import { Asset, Pool } from '../../entities'

export const getAssetValueInUSD = (asset: Asset, pools: Pool[]): BigNumber => {
  const assetPool = pools.find((pool) => pool.asset.eq(asset))

  if (!assetPool) return new BigNumber(0)

  return new BigNumber(assetPool.detail.assetPriceUSD)
}
