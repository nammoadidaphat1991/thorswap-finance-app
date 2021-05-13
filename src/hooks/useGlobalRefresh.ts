import { useMidgard } from 'redux/midgard/hooks'

import useInterval from 'hooks/useInterval'

import { POLL_GAS_RATE_INTERVAL } from 'settings/constants'

/**
 * hooks for reloading all data
 * NOTE: useRefresh hooks should be imported and used only once, to avoid multiple usage of useInterval
 */
export const useGlobalRefresh = () => {
  const { getInboundData } = useMidgard()

  useInterval(() => {
    getInboundData()
  }, POLL_GAS_RATE_INTERVAL)
}
