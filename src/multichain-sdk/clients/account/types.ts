import { SupportedChain } from '../types'
import { Wallet } from './wallet'

export type WalletAccount = Record<SupportedChain, Wallet | null>
