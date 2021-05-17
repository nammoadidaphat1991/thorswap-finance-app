import { transparentize } from 'polished'
import styled from 'styled-components/macro'
import { palette } from 'styled-theme'

import { media } from 'helpers/style'

import { Button } from '../UIElements/Button'

export const navbar = styled.nav``

export const DesktopNavbar = styled.div`
  display: none;

  ${media.sm`
    display: flex;
  `}
  align-items: center;
`

export const MobileNavbar = styled.div`
  position: fixed;
  top: 70px;
  left: 0;
  z-index: 999;

  width: 100vw;
  background-image: ${`linear-gradient(to bottom, ${transparentize(
    0.9,
    '#23DCC8',
  )}, ${transparentize(0.2, '#186b63')}, ${transparentize(0, '#186b63')})`};

  border-bottom: 1px solid ${palette('gray', 0)};

  display: flex;
  flex-direction: column;

  ${media.sm`
    display: none;
  `}

  a {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;

    &:hover {
      background: '#23DCC8';
    }
  }
`

export const NavbarButton = styled(Button).attrs({
  typevalue: 'outline',
  round: true,
  active: false,
  focus: false,
})`
  &.ant-btn {
    display: flex;

    ${media.sm`
      display: none;
    `}

    svg {
      width: 14px;
    }
  }
`
