import { Asset } from './types'

export const assetFromString = (s: string): Asset | null => {
  const data = s.split('.')
  if (data.length <= 1 || data[1]?.length < 1) {
    return null
  }

  const chain = data[0]

  const symbol = data[1]
  const ticker = symbol.split('-')[0]

  return { chain, symbol, ticker }
}
