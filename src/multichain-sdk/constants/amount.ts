import BigNumber from 'bignumber.js'

// default slip limit percentage
export const DEFAULT_SLIP_LIMIT = 5

// threshold amount enforced to retain in the wallet for gas purpose
export const RUNE_THRESHOLD_AMOUNT = 0.1 // $10
export const ETH_THRESHOLD_AMOUNT = 0 // $100
export const BNB_THRESHOLD_AMOUNT = 0 // $50
export const BTC_THRESHOLD_AMOUNT = 0 // $100
export const LTC_THRESHOLD_AMOUNT = 0
export const BCH_THRESHOLD_AMOUNT = 0

export const BN_FORMAT: BigNumber.Format = {
  prefix: '',
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0,
  suffix: '',
}
