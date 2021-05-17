import React, { useState, useMemo, useRef } from 'react'

import { Menu as MenuIcon, X as XIcon } from 'react-feather'
import { useLocation } from 'react-router-dom'

import { useOnClickOutside } from 'hooks/useOnClickOutside'

import { NavLink } from '../Link'
import { navMenuList } from './data'
import * as Styled from './Navbar.style'

export const Navbar = () => {
  const { pathname } = useLocation()

  const [isOpen, setOpen] = useState(false)
  const navRef = useRef(null)

  useOnClickOutside(navRef, () => {
    if (navRef && isOpen === true) {
      setOpen(false)
    }
  })

  const handleOpen = React.useCallback(() => {
    setOpen(true)
  }, [])

  const handleClose = React.useCallback(() => {
    setOpen(false)
  }, [])

  const renderMenu = useMemo(() => {
    return navMenuList.map(({ link, label }) => (
      <NavLink to={link} key={link} active={pathname === link}>
        {label}
      </NavLink>
    ))
  }, [pathname])

  return (
    <nav ref={navRef}>
      <Styled.DesktopNavbar>{renderMenu}</Styled.DesktopNavbar>
      {isOpen ? (
        <Styled.NavbarButton onClick={handleClose}>
          Menu <XIcon />
        </Styled.NavbarButton>
      ) : (
        <Styled.NavbarButton onClick={handleOpen}>
          Menu <MenuIcon />
        </Styled.NavbarButton>
      )}
      {isOpen && (
        <Styled.MobileNavbar onClick={handleClose}>
          {renderMenu}
        </Styled.MobileNavbar>
      )}
    </nav>
  )
}
