import React from 'react'

import { StyledButton } from './FancyButton.style'
import { FancyButtonProps } from './types'

export const FancyButton = ({
  disabled = false,
  error = false,
  size = 'normal',
  onClick = () => {},
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
    />
  )
}
