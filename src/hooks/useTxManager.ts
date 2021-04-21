import { useMemo } from 'react'

import { useMidgard } from 'redux/midgard/hooks'
import { TxTracker, TxTrackerStatus, TxTrackerType } from 'redux/midgard/types'

import useInterval from 'hooks/useInterval'

/**
 * 1. send transaction and get txHash
 * 2. poll midgard action API and get "in" tx with the same txHash
 * 3. check action status (success, pending)
 * 4. check action type and match with send tx type
 *    (if action type is not "refund", action type should be matched to the send type)
 */

const POLL_TX_INTERVAL = 3000 // poll tx from midgard every 3s

export const useTxManager = () => {
  const {
    pollTx,
    pollUpgradeTx,
    pollApprove,
    txTrackers,
    txCollapsed,
    setTxCollapsed,
    clearTxTrackers,
  } = useMidgard()

  const pendingTransactions = useMemo(() => {
    return txTrackers.filter((tracker: TxTracker) => {
      return tracker.status === TxTrackerStatus.Pending
    })
  }, [txTrackers])

  useInterval(
    () => {
      pendingTransactions.forEach((tracker: TxTracker) => {
        if (tracker.type === TxTrackerType.Switch) {
          pollUpgradeTx(tracker)
        } else if (tracker.type === TxTrackerType.Approve) {
          pollApprove(tracker)
        } else {
          pollTx(tracker)
        }
      })
    },
    pendingTransactions.length ? POLL_TX_INTERVAL : null,
  )

  return {
    txTrackers,
    txCollapsed,
    setTxCollapsed,
    clearTxTrackers,
  }
}
