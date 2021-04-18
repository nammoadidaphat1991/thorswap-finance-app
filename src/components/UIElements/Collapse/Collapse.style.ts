import { Collapse } from 'antd'
import styled from 'styled-components'
import { palette, key } from 'styled-theme'

const { Panel: AntPanel } = Collapse

export const CollapseWrapper = styled(Collapse)`
  &.ant-collapse {
    background-color: ${palette('background', 3)};

    .ant-collapse-item {
      border: 1px solid ${palette('gray', 1)};
    }

    .ant-collapse-header {
      color: ${palette('text', 0)};
      font-size: ${key('sizes.font.big', '15px')};
      font-weight: bold;
      padding-top: 12px !important;
      padding-bottom: 12px !important;
      letter-spacing: 1px;
    }

    .ant-collapse-header,
    .ant-collapse-content {
      background-color: ${palette('background', 1)};
      border: none;
      .ant-collapse-content-box {
        padding-left: 28px;
      }
    }

    .collapse-panel-wrapper {
      margin-bottom: 24px;
      border: 1px solid ${palette('gray', 1)};
      border-radius: 4px;
      background-color: ${palette('background', 1)};
      overflow: hidden;
    }
  }
`

export const Panel = styled(AntPanel)`
  &.ant-collapse-content {
    background-color: ${palette('background', 1)};
  }
`
