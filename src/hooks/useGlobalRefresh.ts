import { useGlobalState } from 'redux/hooks'
import { useMidgard } from 'redux/midgard/hooks'

import useInterval from 'hooks/useInterval'

import { POLL_GAS_RATE_INTERVAL, POLL_DATA_INTERVAL } from 'settings/constants'

import { useEffectOnce } from './useEffectOnce'

/**
 * hooks for reloading all data
 * NOTE: useRefresh hooks should be imported and used only once, to avoid multiple usage of useInterval
 */
export const useGlobalRefresh = () => {
  const { getInboundData, getGlobalHistory } = useMidgard()
  const { refreshPage } = useGlobalState()

  useEffectOnce(() => {
    refreshPage()
    getGlobalHistory()
  })

  useInterval(() => {
    getInboundData()
  }, POLL_GAS_RATE_INTERVAL)

  useInterval(() => {
    getInboundData()
    refreshPage()
  }, POLL_DATA_INTERVAL)
}
