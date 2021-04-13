import styled from 'styled-components'
import { palette } from 'styled-theme'

export const Content = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 20px 20px;
`

export const ModalIcon = styled.div`
  position: absolute;
  right: 20px;
  top: 20px;

  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  svg {
    font-size: 20px;
    color: ${palette('text', 0)};

    &:hover {
      font-weight: bold;
    }
  }
`

export const QRCodeWrapper = styled.div`
  margin: 10px 0;
`

export const Label = styled.div`
  .ant-typography {
    color: ${palette('text', 0)};
  }
`
