import { ThemeType } from '@thorchain/asgardex-theme'
import { FeeOptionKey } from '@xchainjs/xchain-client'

export enum FeeOptions {
  'average' = 'average',
  'fast' = 'fast',
  'fastest' = 'fastest',
}

export enum ExpertOptions {
  'on' = 'on',
  'off' = 'off',
}
export interface State {
  themeType: ThemeType
  baseCurrency: string
  isSettingOpen: boolean
  slippageTolerance: number
  feeOptionType: FeeOptionKey
  showAnnouncement: boolean
  expertMode: ExpertOptions
}
