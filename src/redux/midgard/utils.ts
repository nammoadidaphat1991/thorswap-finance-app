import { THORChain } from '@xchainjs/xchain-util'
import { MemberPool } from 'midgard-sdk'
import { SupportedChain } from 'multichain-sdk'

import { ChainMemberDetails, ChainMemberData, PoolMemberData } from './types'

export const getChainMemberDetails = ({
  chain,
  memPools,
  chainMemberDetails,
}: {
  chain: SupportedChain
  memPools: MemberPool[]
  chainMemberDetails: ChainMemberDetails
}): ChainMemberDetails => {
  // get rune asym share from memPools fetched with thorchain address
  if (chain === THORChain) {
    memPools.forEach((memPool: MemberPool) => {
      const { pool, runeAdded, assetAdded } = memPool

      const poolChain = pool.split('.')[0] as SupportedChain
      let chainMemberData: ChainMemberData =
        chainMemberDetails?.[poolChain] ?? {}
      let poolMemberData: PoolMemberData = chainMemberData?.[pool] ?? {}

      // check only rune asymm share
      if (Number(assetAdded) === 0 && Number(runeAdded) > 0) {
        poolMemberData = {
          ...poolMemberData,
          runeAsym: memPool,
        }

        chainMemberData = {
          ...chainMemberData,
          [pool]: poolMemberData,
        }

        chainMemberDetails[poolChain] = chainMemberData
      }
    })
  }

  // get sym, asset asym share from memPools fetched with non-thorchain addr
  if (chain !== THORChain) {
    memPools.forEach((memPool: MemberPool) => {
      const { pool, runeAdded, assetAdded } = memPool

      const poolChain = pool.split('.')[0] as SupportedChain
      let chainMemberData: ChainMemberData =
        chainMemberDetails?.[poolChain] ?? {}
      let poolMemberData: PoolMemberData = chainMemberData?.[pool] ?? {}

      // check asset asymm share
      if (Number(runeAdded) === 0 && Number(assetAdded) > 0) {
        poolMemberData = {
          ...poolMemberData,
          assetAsym: memPool,
        }

        chainMemberData = {
          ...chainMemberData,
          [pool]: poolMemberData,
        }

        chainMemberDetails[poolChain] = chainMemberData
      }

      // check symm share
      if (Number(runeAdded) > 0 && Number(assetAdded) > 0) {
        poolMemberData = {
          ...poolMemberData,
          sym: memPool,
        }

        chainMemberData = {
          ...chainMemberData,
          [pool]: poolMemberData,
        }

        chainMemberDetails[poolChain] = chainMemberData
      }
    })
  }

  return chainMemberDetails
}
