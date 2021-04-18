import React from 'react'

import { ThemeType } from '@thorchain/asgardex-theme'

import thorswapLogoBlack from 'assets/logo/black.png'
import thorswapLogoMini from 'assets/logo/mini.png'
import thorswapLogoWhite from 'assets/logo/white.png'

import { ThorChainIcon } from '../Icons'
import { LogoWrapper, Img, MiniImg } from './Logo.style'

export type Props = {
  type: 'thorchain' | 'thorswap'
  color?: ThemeType
  mini?: boolean
}

export const Logo = (props: Props) => {
  const { mini = false, type, color = ThemeType.DARK } = props

  return (
    <LogoWrapper>
      {mini && <MiniImg src={thorswapLogoMini} />}
      {!mini && type === 'thorchain' && <ThorChainIcon />}
      {!mini &&
        type === 'thorswap' &&
        (color === ThemeType.LIGHT ? (
          <Img src={thorswapLogoBlack} />
        ) : (
          <Img src={thorswapLogoWhite} />
        ))}
    </LogoWrapper>
  )
}
