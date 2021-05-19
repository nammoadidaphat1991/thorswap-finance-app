import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Keystore } from '@xchainjs/xchain-crypto'
import {
  BTCChain,
  BNBChain,
  THORChain,
  ETHChain,
  LTCChain,
  BCHChain,
} from '@xchainjs/xchain-util'

import {
  getKeystore,
  saveKeystore,
  saveXdefiConnected,
  getXdefiConnected,
} from 'helpers/storage'

import * as walletActions from './actions'
import { State } from './types'

const initialWalletType = getXdefiConnected() ? 'xdefi' : null

const initialState: State = {
  walletType: initialWalletType,
  keystore: getKeystore(),
  wallet: null,
  walletLoading: false,
  chainWalletLoading: {
    [BTCChain]: false,
    [BNBChain]: false,
    [THORChain]: false,
    [ETHChain]: false,
    [LTCChain]: false,
    [BCHChain]: false,
  },
  isConnectModalOpen: false,
}

const slice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    disconnect(state) {
      state.walletType = null
      state.keystore = null
      state.wallet = null
      state.walletLoading = false

      saveXdefiConnected(false)
    },
    connectKeystore(state, action: PayloadAction<Keystore>) {
      const keystore = action.payload

      state.keystore = keystore
      state.walletType = 'keystore'
      saveKeystore(keystore)
    },
    connectXdefi(state) {
      state.walletType = 'xdefi'
      saveXdefiConnected(true)
    },
    connectMetamask() {
      // not sure
    },
    setIsConnectModalOpen(state, action: PayloadAction<boolean>) {
      state.isConnectModalOpen = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(walletActions.loadAllWallets.pending, (state) => {
        state.walletLoading = true
      })
      .addCase(walletActions.loadAllWallets.fulfilled, (state, action) => {
        state.wallet = action.payload
        state.walletLoading = false
      })
      .addCase(walletActions.loadAllWallets.rejected, (state) => {
        state.walletLoading = false
      })
      .addCase(walletActions.getWalletByChain.pending, (state, action) => {
        const { arg: chain } = action.meta

        state.chainWalletLoading = {
          ...state.chainWalletLoading,
          [chain]: true,
        }
      })
      .addCase(walletActions.getWalletByChain.fulfilled, (state, action) => {
        const { chain, data } = action.payload
        if (state.wallet && chain in state.wallet) {
          state.wallet = {
            ...state.wallet,
            [chain]: data,
          }
        }

        state.chainWalletLoading = {
          ...state.chainWalletLoading,
          [chain]: false,
        }
      })
      .addCase(walletActions.getWalletByChain.rejected, (state, action) => {
        const { arg: chain } = action.meta

        state.chainWalletLoading = {
          ...state.chainWalletLoading,
          [chain]: false,
        }
      })
  },
})

export const { reducer, actions } = slice

export default slice
