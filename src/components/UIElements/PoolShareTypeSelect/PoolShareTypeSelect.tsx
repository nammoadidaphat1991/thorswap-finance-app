import React from 'react'

import { Asset } from '@xchainjs/xchain-util'

import { PoolShareType } from 'redux/midgard/types'

import { CoreButton } from '../CoreButton'
import { Label } from '../Label'
import { Question } from '../Tooltip'
import * as Styled from './PoolShareTypeSelect.style'

export type PoolShareTypeProps = {
  title?: string
  poolAsset: Asset
  selected: PoolShareType
  onSelect: (value: PoolShareType) => void
  shareTypes: PoolShareType[]
  tooltip?: string
}

export const PoolShareTypeSelect = ({
  title,
  poolAsset,
  shareTypes,
  selected,
  onSelect,
  tooltip,
}: PoolShareTypeProps) => {
  return (
    <Styled.Container>
      <Styled.Content>
        {title && (
          <Label size="big" weight="bold">
            {title}
          </Label>
        )}
        <Styled.Options>
          {shareTypes.map((shareType) => {
            if (shareType === PoolShareType.ASSET_ASYM) {
              return (
                <CoreButton
                  onClick={() => onSelect(shareType)}
                  focused={selected === shareType}
                  key={shareType}
                >
                  <Label>{poolAsset.ticker} LP</Label>
                </CoreButton>
              )
            }

            if (shareType === PoolShareType.SYM) {
              return (
                <CoreButton
                  onClick={() => onSelect(shareType)}
                  focused={selected === shareType}
                  key={shareType}
                >
                  <Label>{poolAsset.ticker} + RUNE LP</Label>
                </CoreButton>
              )
            }

            return (
              <CoreButton
                onClick={() => onSelect(shareType)}
                focused={selected === shareType}
                key={shareType}
              >
                <Label>RUNE LP</Label>
              </CoreButton>
            )
          })}
        </Styled.Options>
      </Styled.Content>
      {tooltip && <Question placement="top" tooltip={tooltip} />}
    </Styled.Container>
  )
}
