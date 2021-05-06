import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { ThemeType } from '@thorchain/asgardex-theme'
import { FeeOptionKey } from '@xchainjs/xchain-client'
import { Asset } from 'multichain-sdk'

import {
  getTheme,
  saveTheme,
  saveBaseCurrency,
  getBaseCurrency,
  getReadStatus,
  setReadStatus,
} from 'helpers/storage'

import { DEFAULT_SLIPPAGE_TOLERANCE } from 'settings/constants/global'

import { ExpertOptions, State } from './types'

const defaultTheme = getTheme()

const initialState: State = {
  themeType: defaultTheme,
  showAnnouncement: !getReadStatus(),
  baseCurrency: getBaseCurrency(),
  isSettingOpen: false,
  slippageTolerance: DEFAULT_SLIPPAGE_TOLERANCE,
  feeOptionType: 'fast',
  expertMode: ExpertOptions.off,
}

const slice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setThemeType(state, action: PayloadAction<ThemeType>) {
      const themeType = action.payload

      state.themeType = themeType
      saveTheme(themeType)
    },
    setBaseCurrency(state, action: PayloadAction<Asset>) {
      const assetString = action.payload.toString()
      saveBaseCurrency(assetString)
      state.baseCurrency = assetString
    },
    setSettingsOpen(state, action: PayloadAction<boolean>) {
      state.isSettingOpen = action.payload
    },
    toggleSettings(state) {
      state.isSettingOpen = !state.isSettingOpen
    },
    setSlippage(state, action: PayloadAction<number>) {
      const slippage =
        action.payload > 100 ? 100 : action.payload < 0 ? 0 : action.payload

      state.slippageTolerance = slippage
    },
    setFeeOptionType(state, action: PayloadAction<FeeOptionKey>) {
      state.feeOptionType = action.payload
    },
    setExpertMode(state, action: PayloadAction<ExpertOptions>) {
      state.expertMode = action.payload
    },
    setReadStatus(state, action: PayloadAction<boolean>) {
      state.showAnnouncement = !action.payload
      setReadStatus(action.payload)
    },
  },
})

export const { reducer, actions } = slice

export default slice
