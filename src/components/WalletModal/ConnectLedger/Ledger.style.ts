import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from 'helpers/style'

import { Button, Label } from '../../UIElements'

export const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 0 8px;
  ${media.sm`
    padding: 0 20px;
  `}

  margin-top: 10px;

  .ant-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
  padding: 10px 0;

  .ant-btn {
    width: 100%;
  }
`

export const Header = styled(Label).attrs({
  size: 'big',
})`
  margin-bottom: 10px;
  padding-bottom: 4px;
  border-bottom: 1px solid ${palette('gray', 0)};
  text-transform: uppercase;
`

export const FormLabel = styled(Label)`
  margin-bottom: 10px;
`

export const ChainWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
`

export const ChainOptionWrapper = styled.div`
  margin: 4px;
`

export const ChainOption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 11px;

  div {
    margin-bottom: 4px;
  }
`

export const ChainButton = styled(Button)`
  margin-top: 2px;
  margin-bottom: 2px;

  &.ant-btn {
    height: 42px;
  }
`

export const Footer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  margin-top: 16px;
`

export const FooterContent = styled.div`
  display: flex;
  align-items: center;
`
