import styled from 'styled-components/macro'
import { palette } from 'styled-theme'

import { Label } from '../UIElements'

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
  margin: 8px 0;

  border: 1px solid ${palette('gray', 0)};
  border-bottom: none;
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;

  width: 100%;

  padding: 8px;

  border-bottom: 1px solid ${palette('gray', 0)};
`

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
`

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
`

export const ShareBody = styled.div`
  display: flex;
  flex-direction: column;
`

export const ShareContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;
`

export const Footer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 8px;
  border-top: 1px solid ${palette('gray', 0)};
  border-bottom: 1px solid ${palette('gray', 0)};
  button {
    width: 140px;
    margin: 0 10px;
  }
`

export const PoolShareLabel = styled(Label).attrs({
  color: 'gray',
})``

export const ShareTitle = styled(Label).attrs({
  color: 'primary',
})``
