import React, { useMemo } from 'react'

import { Col } from 'antd'
import { Amount, Asset, Price } from 'multichain-sdk'

import * as Styled from './AssetData.style'

/**
 * AssetData - Component to show asset data in one row:
 *
 * |------|-------------------|-------------------|------------------|
 * | icon | ticker (optional) | amount (optional) | price (optional) |
 *          chain
 * |------|-------------------|-------------------|------------------|
 *
 */

export type Props = {
  asset: Asset
  amount?: Amount
  price?: Price
  size?: Styled.AssetDataSize
  labelSize?: 'small' | 'normal' | 'big'
  showLabel?: boolean
  decimal?: number
}

export const AssetData: React.FC<Props> = (props): JSX.Element => {
  const {
    asset,
    amount,
    price,
    size = 'normal',
    labelSize = 'big',
    showLabel = true,
    decimal = 2,
    ...others
  } = props

  const labelSizeValue = useMemo(() => {
    if (labelSize) return labelSize

    if (size === 'big') return 'large'
    return 'big'
  }, [size, labelSize])

  return (
    <Styled.Wrapper {...others}>
      <Col>
        <Styled.AssetIcon asset={asset} size={size} />
      </Col>
      {showLabel && (
        <Col>
          <Styled.TickerRow>
            <Styled.TickerLabel size={labelSizeValue}>
              {asset.ticker}
            </Styled.TickerLabel>
            <Styled.TypeLabel>{asset.type}</Styled.TypeLabel>
          </Styled.TickerRow>
        </Col>
      )}
      {!!amount && (
        <Col>
          <Styled.AmountLabel size={labelSizeValue}>
            {amount.toFixed(decimal)}
          </Styled.AmountLabel>
        </Col>
      )}
      {!!price && (
        <Col>
          <Styled.PriceLabel size={labelSizeValue}>
            {price.toFixed(2)}
          </Styled.PriceLabel>
        </Col>
      )}
    </Styled.Wrapper>
  )
}
