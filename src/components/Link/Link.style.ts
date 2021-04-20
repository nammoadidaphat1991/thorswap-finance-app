import styled from 'styled-components/macro'
import { palette } from 'styled-theme'

export const A = styled.a`
  color: ${palette('primary', 0)};

  &:hover {
    color: ${palette('primary', 1)};
    font-weight: bold;
  }
`
