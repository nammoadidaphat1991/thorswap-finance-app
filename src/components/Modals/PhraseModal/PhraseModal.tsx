import React, { useEffect, useState, useCallback } from 'react'

import { CloseOutlined } from '@ant-design/icons'
import { Form } from 'antd'

import { useWallet } from 'redux/wallet/hooks'

import { multichain } from 'services/multichain'

import { Overlay, Input, Label } from '../../UIElements'
import * as Styled from './PhraseModal.style'

export type PhraseModalProps = {
  visible: boolean
  onCancel?: () => void
}

export const PhraseModal: React.FC<PhraseModalProps> = (props): JSX.Element => {
  const { visible, onCancel = () => {} } = props
  const { keystore } = useWallet()

  const [password, setPassword] = useState('')
  const [invalidPassword, setInvalidPassword] = useState(false)
  const [validating, setValidating] = useState(false)

  const [showPhrase, setShowPhrase] = useState(false)

  useEffect(() => {
    if (visible === false) {
      setShowPhrase(false)
      setPassword('')
      setInvalidPassword(false)
    }
  }, [visible])

  const handleConfirm = useCallback(async () => {
    if (!keystore) return
    setValidating(true)

    try {
      const isValid = await multichain.validateKeystore(keystore, password)

      if (isValid) {
        setShowPhrase(true)
      } else {
        setInvalidPassword(true)
      }
    } catch (error) {
      setInvalidPassword(true)
    }

    setValidating(false)
  }, [keystore, password])

  const onChangePasswordHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value)
      setInvalidPassword(false)
    },
    [setPassword, setInvalidPassword],
  )

  const renderModalContent = () => {
    return (
      <Form onFinish={handleConfirm} autoComplete="off">
        <Form.Item
          className={invalidPassword ? 'has-error' : ''}
          extra={validating ? 'Validating password ...' : ''}
        >
          <Input
            type="password"
            placeholder="password"
            typevalue="ghost"
            sizevalue="big"
            value={password}
            onChange={onChangePasswordHandler}
            autoComplete="new-password"
          />
          {invalidPassword && (
            <div className="ant-form-explain">Password is wrong.</div>
          )}
        </Form.Item>
        <Styled.Button size="small">View Phrase</Styled.Button>
      </Form>
    )
  }

  const renderPhrase = useCallback(() => {
    const phrases = multichain.getPhrase().split(' ')
    return (
      <Styled.PhraseContainer>
        {phrases.map((phrase: string, index: number) => {
          return (
            <Styled.Phrase key={index}>
              <Label>
                {index + 1}. {phrase}
              </Label>
            </Styled.Phrase>
          )
        })}
      </Styled.PhraseContainer>
    )
  }, [])

  return (
    <Overlay isOpen={visible} onDismiss={onCancel}>
      <Styled.Content>
        <Styled.ModalIcon onClick={onCancel}>
          <CloseOutlined />
        </Styled.ModalIcon>
        {!showPhrase && renderModalContent()}
        {showPhrase && renderPhrase()}
      </Styled.Content>
    </Overlay>
  )
}
