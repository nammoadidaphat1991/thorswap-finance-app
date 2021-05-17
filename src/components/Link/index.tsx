import React from 'react'

import { Link } from 'react-router-dom'

import { IconButton } from '../UIElements'
import { A, NavLabel } from './Link.style'

export const ExternalLink = ({
  link,
  children,
}: {
  link: string
  children: React.ReactChild
}) => (
  <A href={link} target="_blank" rel="noopener noreferrer">
    {children}
  </A>
)

export const ExternalButtonLink = ({
  link,
  children,
  ...others
}: {
  link: string
  children: React.ReactChild
}) => (
  <A href={link} target="_blank" rel="noopener noreferrer" {...others}>
    <IconButton>{children}</IconButton>
  </A>
)

export const ButtonLink = ({
  to,
  children,
}: {
  to: string
  children: React.ReactChild
}) => (
  <Link to={to}>
    <IconButton>{children}</IconButton>
  </Link>
)

export const NavLink = ({
  to,
  active = false,
  children,
}: {
  to: string
  active?: boolean
  children: React.ReactChild
}) => (
  <Link to={to}>
    <NavLabel size="big" weight={active ? 'bold' : '500'}>
      {children}
    </NavLabel>
  </Link>
)
