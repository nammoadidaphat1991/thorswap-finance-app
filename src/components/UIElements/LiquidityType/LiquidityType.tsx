import React from 'react'

import { Asset } from '@xchainjs/xchain-util'

import { CoreButton } from '../CoreButton'
import { Label } from '../Label'
import { Question } from '../Tooltip'
import * as Styled from './LiquidityType.style'

export enum LiquidityTypeOption {
  'RUNE' = 'RUNE',
  'ASSET' = 'ASSET',
  'SYMMETRICAL' = 'SYMMETRICAL',
}

export type LiquidityTypeProps = {
  title?: string
  poolAsset: Asset
  selected: LiquidityTypeOption
  onSelect: (value: LiquidityTypeOption) => void
  tooltip?: string
  disable?: LiquidityTypeOption[]
}

export const LiquidityType = ({
  title,
  poolAsset,
  selected,
  onSelect,
  tooltip,
  disable = [],
}: LiquidityTypeProps) => {
  return (
    <Styled.Container>
      <Styled.Content>
        {title && (
          <Label size="big" weight="bold">
            {title}
          </Label>
        )}
        <Styled.Options>
          {!disable.includes(LiquidityTypeOption.ASSET) && (
            <CoreButton
              onClick={() => onSelect(LiquidityTypeOption.ASSET)}
              focused={selected === LiquidityTypeOption.ASSET}
            >
              <Label>{poolAsset.ticker}</Label>
            </CoreButton>
          )}
          {!disable.includes(LiquidityTypeOption.SYMMETRICAL) && (
            <CoreButton
              onClick={() => onSelect(LiquidityTypeOption.SYMMETRICAL)}
              focused={selected === LiquidityTypeOption.SYMMETRICAL}
            >
              <Label>{poolAsset.ticker} + RUNE</Label>
            </CoreButton>
          )}
          {!disable.includes(LiquidityTypeOption.RUNE) && (
            <CoreButton
              onClick={() => onSelect(LiquidityTypeOption.RUNE)}
              focused={selected === LiquidityTypeOption.RUNE}
            >
              <Label>RUNE</Label>
            </CoreButton>
          )}
        </Styled.Options>
      </Styled.Content>
      {tooltip && <Question placement="top" tooltip={tooltip} />}
    </Styled.Container>
  )
}
