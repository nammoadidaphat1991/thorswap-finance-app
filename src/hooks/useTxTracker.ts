import { useCallback } from 'react'

import { v4 as uuidv4 } from 'uuid'

import { useMidgard } from 'redux/midgard/hooks'
import { TxTrackerStatus, SubmitTx, TxTrackerType } from 'redux/midgard/types'

/**
 * 1. send transaction and get txHash
 * 2. poll midgard action API and get "in" tx with the same txHash
 * 3. check action status (success, pending)
 * 4. check action type and match with send tx type
 *    (if action type is not "refund", action type should be matched to the send type)
 */

export const useTxTracker = () => {
  const {
    addNewTxTracker,
    updateTxTracker,
    clearTxTrackers,
    processSubmittedTx,
  } = useMidgard()

  // confirm and submit a transaction
  const submitTransaction = useCallback(
    ({
      type,
      submitTx,
    }: {
      type: TxTrackerType
      submitTx: SubmitTx
    }): string => {
      const uuid = uuidv4()

      addNewTxTracker({
        uuid,
        type,
        status: TxTrackerStatus.Submitting,
        submitTx,
        action: null,
        refunded: null,
      })

      return uuid
    },
    [addNewTxTracker],
  )

  // start polling a transaction
  const pollTransaction = useCallback(
    ({
      uuid,
      submitTx,
      type,
    }: {
      uuid: string
      submitTx: SubmitTx
      type: TxTrackerType
    }) => {
      updateTxTracker({
        uuid,
        txTracker: {
          status: TxTrackerStatus.Pending,
          submitTx,
        },
      })
      processSubmittedTx({ submitTx, type })
    },
    [updateTxTracker, processSubmittedTx],
  )

  // start polling a transaction
  const setTxFailed = useCallback(
    (uuid: string) => {
      updateTxTracker({
        uuid,
        txTracker: {
          status: TxTrackerStatus.Failed,
        },
      })
    },
    [updateTxTracker],
  )

  return {
    submitTransaction,
    pollTransaction,
    clearTxTrackers,
    setTxFailed,
  }
}
