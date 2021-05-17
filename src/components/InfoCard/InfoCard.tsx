import React from 'react'

import { Question } from '../UIElements/Tooltip'
import * as Styled from './InfoCard.style'

export type InfoCardProps = {
  title: string
  value: string
  tooltip?: string
  status?: 'primary' | 'warning' | 'error'
}

export const InfoCard: React.FC<InfoCardProps> = (
  props: InfoCardProps,
): JSX.Element => {
  const { title, value, status = 'primary', tooltip } = props

  return (
    <Styled.Card>
      <Styled.Header>
        <Styled.Title color="primary" weight="bold">
          {title}
        </Styled.Title>
        {tooltip && (
          <Question color={status} placement="top" tooltip={tooltip} />
        )}
      </Styled.Header>
      <Styled.Content>
        <Styled.Description>{value}</Styled.Description>
      </Styled.Content>
    </Styled.Card>
  )
}
