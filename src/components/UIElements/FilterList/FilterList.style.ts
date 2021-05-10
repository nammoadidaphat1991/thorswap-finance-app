import styled from 'styled-components'
import { palette } from 'styled-theme'

export const ListItem = styled.div<{
  disabled?: boolean
  onClick?: () => void
}>`
  cursor: pointer;
  ${({ disabled }) => (disabled ? 'opacity: 0.5; cursor: initial;' : '')}
  &:hover {
    background: ${({ disabled }) =>
      disabled ? 'initial' : palette('secondary', 1)};
  }
  padding: 4px 0px;
`

export const ListWrapper = styled.div`
  background: ${palette('background', 1)};
  color: ${palette('text', 0)};
  padding: 12px;
  padding-bottom: 0;

  .ant-input-suffix {
    display: flex;
    align-items: center;
    color: ${palette('text', 0)};
  }
`

export const List = styled.div`
  padding-top: 8px;
  height: 340px;
  overflow-y: scroll;
`
