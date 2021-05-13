import BigNumber from 'bignumber.js'

// default slip limit percentage
export const DEFAULT_SLIP_LIMIT = 5

// threshold amount enforced to retain in the wallet for gas purpose
// Note: disabled all threshold amount to 0
export const RUNE_THRESHOLD_AMOUNT = 0 // gas fee for rune transfer/deposit
export const ETH_THRESHOLD_AMOUNT = 0
export const BNB_THRESHOLD_AMOUNT = 0
export const BTC_THRESHOLD_AMOUNT = 0
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

// from https://github.com/MetaMask/metamask-extension/blob/ee205b893fe61dc4736efc576e0663189a9d23da/ui/app/pages/send/send.constants.js#L39
// and based on recommendations of https://ethgasstation.info/blog/gas-limit/
export const SIMPLE_GAS_COST_VALUE = 35000
export const BASE_TOKEN_GAS_COST_VALUE = 70000
