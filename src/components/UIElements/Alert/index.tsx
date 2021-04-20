import { Alert as AntAlert } from 'antd'
import { transparentize } from 'polished'
import styled from 'styled-components/macro'
import { palette } from 'styled-theme'

export const Alert = styled(AntAlert)`
  &.ant-alert {
    padding: 1px 8px;

    background-color: ${(props) =>
      transparentize(0.1, props.theme.palette.secondary[0])};
    border: 1px solid ${palette('secondary', 0)};

    .ant-alert-message {
      color: ${palette('text', 0)};
    }

    .ant-alert-close-icon {
      span {
        color: ${palette('text', 0)};
      }
    }
  }
`
