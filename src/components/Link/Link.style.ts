import styled from 'styled-components/macro'
import { palette } from 'styled-theme'

import { Label } from '../UIElements'

export const A = styled.a`
  color: ${palette('primary', 0)};

  &:hover {
    color: ${palette('primary', 1)};
    font-weight: bold;
  }
`

export const NavLabel = styled(Label)`
  padding: 0 10px;

  &:hover {
    font-weight: bold;
  }
`
