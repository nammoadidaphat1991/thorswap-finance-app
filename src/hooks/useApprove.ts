import { useEffect, useState, useMemo } from 'react'

import { Asset } from 'multichain-sdk'

import { useMidgard } from 'redux/midgard/hooks'
import { TxTrackerStatus } from 'redux/midgard/types'

import { multichain } from 'services/multichain'

export const useApprove = (asset: Asset) => {
  const { approveStatus } = useMidgard()
  const [isApproved, setApproved] = useState<boolean | null>(null)

  useEffect(() => {
    const checkApproved = async () => {
      if (approveStatus?.[asset.toString()] === TxTrackerStatus.Success) {
        setApproved(true)
      }
      const approved = await multichain.isAssetApproved(asset)
      setApproved(approved)
    }

    checkApproved()
  }, [asset, approveStatus])

  const assetApproveStatus = useMemo(() => approveStatus?.[asset.toString()], [
    approveStatus,
    asset,
  ])

  return {
    assetApproveStatus,
    isApproved,
  }
}
