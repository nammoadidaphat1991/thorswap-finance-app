import { useCallback } from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { Keystore } from '@xchainjs/xchain-crypto'

import { RootState } from 'redux/store'
import * as walletActions from 'redux/wallet/actions'
import { actions } from 'redux/wallet/slice'

import { multichain } from 'services/multichain'

export const useWallet = () => {
  const dispatch = useDispatch()

  const walletState = useSelector((state: RootState) => state.wallet)

  const unlockWallet = useCallback(
    async (keystore: Keystore, phrase: string) => {
      // set multichain phrase
      multichain.connectKeystore(phrase)

      dispatch(actions.connectKeystore(keystore))
      dispatch(walletActions.loadAllWallets())
    },
    [dispatch],
  )

  const connectXdefiWallet = useCallback(async () => {
    try {
      await multichain.connectXDefiWallet()

      dispatch(actions.connectXdefi())
      dispatch(walletActions.loadAllWallets())
    } catch (error) {
      console.error(error)
    }
  }, [dispatch])

  const setIsConnectModalOpen = useCallback(
    (visible: boolean) => {
      dispatch(actions.setIsConnectModalOpen(visible))
    },
    [dispatch],
  )

  const disconnectWallet = useCallback(() => {
    multichain.resetClients()

    dispatch(actions.disconnect())
  }, [dispatch])

  return {
    ...walletState,
    ...walletActions,
    unlockWallet,
    setIsConnectModalOpen,
    disconnectWallet,
    connectXdefiWallet,
  }
}
