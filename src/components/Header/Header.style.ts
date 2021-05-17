import { transparentize } from 'polished'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from 'helpers/style'

import { WalletButton } from '../UIElements'

export const HeaderContainer = styled.div`
  position: relative;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  height: 70px;

  background-color: transparent;
  background-repeat: no-repeat;
  background-image: ${({ theme }) =>
    `linear-gradient(180deg, ${transparentize(
      0.8,
      '#23DCC8',
    )} 0%, ${transparentize(1, theme.palette.background[0])} 100%)`};

  padding: 0 60px 10px 10px;
  z-index: 999;
`

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  margin: 0 10px;

  ${media.sm`
    margin: 0 20px;
  `}
`

export const HeaderActions = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

export const HeaderAction = styled.div`
  display: flex;
  align-items: center;
`

export const HeaderCenterWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 10px;

  border: 1px solid ${palette('gray', 0)};
  border-radius: 4px;

  display: none;
  ${media.sm`
      display: flex;
  `}
`

export const RunePrice = styled.div`
  display: flex;
  align-items: center;
  padding: 2px 6px;

  border: 1px solid ${palette('primary', 0)};
  border-radius: 16px;

  display: none;
  ${media.sm`
      display: flex;
  `}

  margin-left: 0px;
  ${media.sm`
    margin-left: 8px;
  `}
`

export const WalletBtn = styled(WalletButton)`
  margin-left: 10px;
`

export const ToolWrapper = styled.div`
  margin-right: 2px;

  display: none;
  ${media.sm`
    display: block;
  `}
`

export const LogoWrapper = styled.div`
  padding-top: 4px;
`
