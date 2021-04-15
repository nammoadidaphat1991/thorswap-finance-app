import { Amount } from 'multichain-sdk'

import { useMidgard } from 'redux/midgard/hooks'

import { useMimir } from './useMimir'

export enum QueueLevel {
  GOOD = 'GOOD', // queue < 10
  SLOW = 'SLOW', // 10 < queue < 30
  BUSY = 'BUSY', // 30 < queue
}

const QUEUE_BUSY_LEVEL = 30
const QUEUE_SLOW_LEVEL = 10

const useNetwork = () => {
  const { networkData, queue } = useMidgard()
  const { isFundsCapReached, maxLiquidityRune } = useMimir()

  const outboundQueue = Number(queue?.outbound ?? 0)

  const getQueueLevel = (queueValue: number) => {
    if (queueValue > QUEUE_BUSY_LEVEL) return QueueLevel.BUSY
    if (queueValue > QUEUE_SLOW_LEVEL) return QueueLevel.SLOW
    return QueueLevel.GOOD
  }

  const outboundQueueLevel: QueueLevel = getQueueLevel(outboundQueue)
  const isOutboundBusy = outboundQueueLevel === QueueLevel.BUSY
  const isOutboundDelayed =
    outboundQueueLevel === QueueLevel.BUSY ||
    outboundQueueLevel === QueueLevel.SLOW

  const getOutboundBusyTooltip = () => {
    return 'The network is currently experiencing delays signing outgoing transactions.'
  }

  type StatusColor = 'green' | 'yellow' | 'red'

  const statusColors: {
    [key: string]: StatusColor
  } = {
    GOOD: 'green',
    SLOW: 'yellow',
    BUSY: 'red',
  }
  const statusColor: StatusColor = statusColors[outboundQueueLevel]

  const totalPooledRune: Amount = Amount.fromMidgard(
    networkData?.totalPooledRune ?? 0,
  )

  const globalRunePooledStatus = maxLiquidityRune.gt(0)
    ? `TOTAL ${totalPooledRune.toFixed(0)} / ${maxLiquidityRune.toFixed(
        0,
      )} RUNE POOLED`
    : `TOTAL ${totalPooledRune.toFixed(0)} RUNE POOLED`

  return {
    globalRunePooledStatus,
    isValidFundCaps: !isFundsCapReached,
    QueueLevel,
    outboundQueue,
    outboundQueueLevel,
    isOutboundDelayed,
    isOutboundBusy,
    statusColor,
    getOutboundBusyTooltip,
  }
}

export default useNetwork
