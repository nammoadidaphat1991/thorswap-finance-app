export type WalletType = 'metamask' | 'xdefi' | 'ledger' | 'keystore' | null

export type Props = {
  walletType: WalletType
  size?: number
}
