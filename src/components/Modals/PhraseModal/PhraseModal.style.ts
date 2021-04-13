import styled from 'styled-components'
import { palette } from 'styled-theme'

import { FancyButton } from '../../UIElements'

export const Content = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 20px 20px;

  form {
    width: 80%;
  }
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

export const Label = styled.div`
  .ant-typography {
    color: ${palette('text', 0)};
  }
`

export const Button = styled(FancyButton)`
  width: 100% !important;
`

export const PhraseContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`

export const Phrase = styled.div`
  padding: 4px;
  background: ${palette('background', 3)};
`
