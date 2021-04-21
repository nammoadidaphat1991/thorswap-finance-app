import React from 'react'

export interface FancyButtonProps {
  size?: 'small' | 'normal'
  error?: boolean
  disabled?: boolean
  onClick?: () => void
  loading?: boolean
  children: React.ReactNode
}
