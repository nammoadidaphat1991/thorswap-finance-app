import React from 'react'

import { LoadingOutlined } from '@ant-design/icons'

import { StyledButton } from './FancyButton.style'
import { FancyButtonProps } from './types'

export const FancyButton = ({
  disabled = false,
  error = false,
  loading = false,
  size = 'normal',
  onClick = () => {},
  children,
  ...others
}: FancyButtonProps) => {
  const handleClick = React.useCallback(() => {
    if (!error && !disabled) {
      onClick?.()
    }
  }, [onClick, error, disabled])

  return (
    <StyledButton
      error={error}
      disabled={disabled}
      size={size}
      onClick={handleClick}
      {...others}
    >
      {children}
      {loading && <LoadingOutlined />}
    </StyledButton>
  )
}
