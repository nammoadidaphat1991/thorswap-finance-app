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
  accountType: initialWalletType,
  keystore: getKeystore(),
  account: null,
  accountLoading: false,
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
      state.keystore = null
      state.account = null
      state.accountLoading = false

      saveXdefiConnected(false)
    },
    connectKeystore(state, action: PayloadAction<Keystore>) {
      const keystore = action.payload

      state.keystore = keystore
      state.accountType = 'keystore'
      saveKeystore(keystore)
    },
    connectXdefi(state) {
      state.accountType = 'xdefi'
      saveXdefiConnected(true)
    },
    setIsConnectModalOpen(state, action: PayloadAction<boolean>) {
      state.isConnectModalOpen = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(walletActions.loadAllWallets.pending, (state) => {
        state.accountLoading = true
      })
      .addCase(walletActions.loadAllWallets.fulfilled, (state, action) => {
        state.account = action.payload
        state.accountLoading = false
      })
      .addCase(walletActions.loadAllWallets.rejected, (state) => {
        state.accountLoading = false
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
        if (state.account && chain in state.account) {
          if (!data) {
            state.account = {
              ...state.account,
              [chain]: null,
            }
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
