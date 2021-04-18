import styled from 'styled-components/macro'
import { palette } from 'styled-theme'

export const StatusItem = styled.div`
  padding-left: 10px;
`

export const DropdownLink = styled.a`
  display: flex;
  align-items: center;
  width: 50px;

  svg {
    color: ${palette('primary', 0)};
    margin-left: 8px;
  }
`
