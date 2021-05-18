import { useEffect, useCallback, useMemo } from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { THORChain } from '@xchainjs/xchain-util'
import { Account } from 'multichain-sdk'

import { getLiquidityProviderData } from 'redux/midgard/actions'
import { RootState } from 'redux/store'

export const usePendingLP = () => {
  const dispatch = useDispatch()

  const { account } = useSelector((state: RootState) => state.wallet)
  const { pools, pendingLP, pendingLPLoading } = useSelector(
    (state: RootState) => state.midgard,
  )

  const getPendingDeposit = useCallback(() => {
    if (account) {
      // const activePools = pools.filter(
      //   (pool) => pool.detail.status === 'available',
      // )
      const thorAddress = Account.getChainAddress(account, THORChain)

      if (thorAddress) {
        pools.forEach((pool) => {
          dispatch(
            getLiquidityProviderData({
              address: thorAddress,
              asset: pool.asset.toString(),
            }),
          )
        })
      }
    }
  }, [dispatch, account, pools])

  useEffect(() => getPendingDeposit(), [getPendingDeposit])

  const hasPendingDeposit = useMemo(() => Object.keys(pendingLP).length > 0, [
    pendingLP,
  ])

  return {
    getPendingDeposit,
    pools,
    pendingLP,
    pendingLPLoading,
    hasPendingDeposit,
  }
}
