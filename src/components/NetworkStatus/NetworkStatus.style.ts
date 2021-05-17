import styled from 'styled-components/macro'
import { palette } from 'styled-theme'

import { media } from 'helpers/style'

import { IconButton } from '../UIElements'

export const StatusItem = styled.div`
  padding-left: 10px;
`

export const DropdownLink = styled.a`
  align-items: center;

  svg {
    color: ${palette('primary', 0)};
    margin-left: 0px;
  }

  display: flex;

  svg {
    margin-left: 8px;
  }
`

export const Button = styled(IconButton)`
  margin-left: 0px;
  ${media.sm`
    margin-left: 8px;
  `}
`
