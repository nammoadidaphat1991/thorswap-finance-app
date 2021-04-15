import { Drawer as AntDrawer } from 'antd'
import styled from 'styled-components/macro'
import { palette } from 'styled-theme'

import { CoreButton, Label } from '../UIElements'

export const Drawer = styled(AntDrawer)`
  .ant-drawer-body {
    height: 100%;
    padding: 24px 12px;
    background-color: ${palette('background', 1)};
  }
`

export const ActionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  button {
    margin-right: 4px;

    svg {
      color: ${palette('primary', 0)};
      margin-right: 4px;
    }
  }
`

export const HeaderAction = styled.div`
  display: flex;
  align-items: center;
`

export const Refresh = styled(CoreButton)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;

  svg {
    font-size: 18px;
    color: ${palette('primary', 0)};
  }
`

export const WarningLabel = styled(Label).attrs({
  color: 'warning',
  weight: 'bold',
})`
  margin-top: 20px;
`
