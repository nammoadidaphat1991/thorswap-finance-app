import React, { useEffect, useCallback, useState } from 'react'

import { Amount } from 'multichain-sdk'

import { InputProps } from '../Input'
import { StyledInput } from './InputAmount.style'
import { getAmountFromString } from './utils'

export type InputAmountProps = Omit<InputProps, 'value' | 'onChange'> & {
  value?: Amount
  onChange?: (value: Amount) => void
  decimal?: number
  outlined?: boolean
  disabled?: boolean
}

export const InputAmount = (props: InputAmountProps) => {
  const {
    value = Amount.fromAssetAmount(0, 8),
    onChange = () => {},
    outlined = true,
    disabled = false,
    ...others
  } = props

  const [rawValue, setRawValue] = useState(value.toSignificant(6))

  useEffect(() => {
    setRawValue(value.toSignificant(6))
  }, [value])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = getAmountFromString(e.target.value, value.decimal)

      if (newValue) {
        setRawValue(newValue.toSignificant(6))
        onChange(newValue)
      } else {
        setRawValue(e.target.value)
      }
    },
    [value, onChange],
  )

  return (
    <StyledInput
      value={rawValue}
      onChange={handleChange}
      outlined={outlined}
      disabled={disabled}
      {...others}
    />
  )
}
