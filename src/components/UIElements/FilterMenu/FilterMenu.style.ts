import { Menu as AntdMenu } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

const { Item } = AntdMenu

export const MenuItem = styled(Item)`
  ${({ disabled }) => (disabled ? 'opacity: 0.5' : '')}
  padding: 0 8px !important;
  &:hover {
    background: ${palette('secondary', 1)};
  }
`

export const Menu = styled(AntdMenu)`
  background: ${palette('background', 1)};
  color: ${palette('text', 0)};
  border: none;
  padding: 8px 12px;

  .ant-input-suffix {
    display: flex;
    align-items: center;
    color: ${palette('text', 0)};
  }

  .ant-menu-item {
    height: auto;
  }
`
