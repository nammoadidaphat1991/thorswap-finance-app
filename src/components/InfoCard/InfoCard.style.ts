import { transparentize } from 'polished'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Label } from '../UIElements/Label'

export const Card = styled.div`
  background: ${(props) =>
    transparentize(0.1, props.theme.palette.background[0])};
  border: 1px solid ${palette('gray', 0)};

  text-transform: uppercase;
  padding: 10px 20px;
  border-radius: 4px;
  height: 79px;

  &:before {
    content: '';
    position: absolute;
    width: 6px;
    height: 79px;
    left: 8px;
    top: 0px;
    border-bottom-left-radius: 3px;
    border-top-left-radius: 3px;
    background: ${palette('gradient', 0)};
  }
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  padding-top: 2px;
`

export const Content = styled.div`
  display: flex;
  padding-top: 10px;
`

export const Title = styled(Label)`
  color: ${palette('primary', 0)};

  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

export const Description = styled(Label)`
  color: ${palette('text', 0)};
  /* color: ${palette('primary', 0)}; */
  font-family: 'Exo 2';
  font-size: 14px;
  font-weight: bold;

  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`
