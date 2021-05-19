import { useCallback } from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { Keystore } from '@xchainjs/xchain-crypto'
import { SupportedChain } from 'multichain-sdk'

import { RootState } from 'redux/store'
import * as walletActions from 'redux/wallet/actions'
import { actions } from 'redux/wallet/slice'

import { multichain } from 'services/multichain'

export const useWallet = () => {
  const dispatch = useDispatch()

  const walletState = useSelector((state: RootState) => state.wallet)

  const { walletLoading, chainWalletLoading } = walletState
  const walletLoadingByChain = Object.keys(chainWalletLoading).map(
    (chain) => chainWalletLoading[chain as SupportedChain],
  )
  const isWalletLoading = walletLoadingByChain.reduce(
    (status, next) => status || next,
    walletLoading,
  )

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

      dispatch(walletActions.loadAllWallets())
    } catch (error) {
      console.error(error)
    }
  }, [dispatch])

  const connectMetamask = useCallback(async () => {
    try {
      await multichain.connectMetamask()

      dispatch(walletActions.getWalletByChain('ETH'))
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
    isWalletLoading,
    unlockWallet,
    setIsConnectModalOpen,
    disconnectWallet,
    connectXdefiWallet,
    connectMetamask,
  }
}
