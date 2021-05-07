import { useState, useEffect } from 'react'

import { ETHChain } from '@xchainjs/xchain-util'
import { Asset, Amount, TxParams, chainToFeeAsset } from 'multichain-sdk'

import { multichain } from 'services/multichain'

import useDebounce from './useDebounce'

// TODO: update Transaction Fee logic
const useTransactionFee = (
  asset: Asset,
  txParam?: TxParams,
  hasWallet = true,
): string => {
  const [networkFee, setNetworkFee] = useState('')

  // debounce tx param per 5 secs
  const debouncedTxParams = useDebounce(txParam, 5000)

  useEffect(() => {
    const getFeeValue = async () => {
      const { chain } = asset
      let feeStr = ''

      setNetworkFee('fee estimating...')
      try {
        if (chain === ETHChain) {
          if (!hasWallet) {
            setNetworkFee(`${chain} Gas Fee`)
            return
          }

          if (!asset.isETH()) {
            setNetworkFee('Ethereum Gas Fee')
          } else if (txParam) {
            const {
              router: ethPoolAddress,
            } = await multichain.getInboundDataByChain(ETHChain)

            if (ethPoolAddress) {
              const feeValue = await multichain.getFees(asset.chain, {
                ...txParam,
                recipient: ethPoolAddress,
              })
              feeStr = Amount.fromBaseAmount(
                feeValue?.[txParam.feeOptionKey || 'fast'].amount(),
                asset.decimal,
              ).toSignificant(6)
            } else {
              setNetworkFee(`${chain} Gas Fee`)
            }
          }
        } else {
          const feeValue = await multichain.getFees(asset.chain)
          feeStr = Amount.fromBaseAmount(
            feeValue.fast.amount(),
            asset.decimal,
          ).toSignificant(6)

          const feeAsset = chainToFeeAsset(chain)
          setNetworkFee(`${feeStr} ${feeAsset}`)
        }
      } catch (error) {
        console.log('quote fee error', error)
        setNetworkFee(`${chain} Fee`)
      }
    }

    getFeeValue()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTxParams, asset])

  return networkFee
}

export default useTransactionFee
