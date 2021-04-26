import React, { useState, useCallback } from 'react'

import { FilePicker } from 'react-file-picker'

import {
  QuestionCircleOutlined,
  UploadOutlined,
  CheckCircleTwoTone,
} from '@ant-design/icons'
import { decryptFromKeystore, Keystore } from '@xchainjs/xchain-crypto'
import { Form, Tooltip } from 'antd'

import { Helmet } from '../../Helmet'
import { Button, Input, Label } from '../../UIElements'
import * as Styled from './Keystore.style'

type Props = {
  onConnect: (keystore: Keystore, phrase: string) => void
  onCreate: () => void
  loading?: boolean
}

const KeystoreView = ({ onConnect, onCreate, loading = false }: Props) => {
  const [keystore, setKeystore] = useState<Keystore>()
  const [password, setPassword] = useState<string>('')
  const [invalideStatus, setInvalideStatus] = useState(false)
  const [keystoreError, setKeystoreError] = useState('')
  const [processing, setProcessing] = useState(false)

  const onChangeFile = useCallback((file: Blob) => {
    const reader = new FileReader()
    const onLoadHandler = () => {
      try {
        const key = JSON.parse(reader.result as string)
        if (!('version' in key) || !('crypto' in key)) {
          setKeystoreError('Not a valid keystore file')
        } else {
          setKeystoreError('')
          setKeystore(key)
        }
      } catch {
        setKeystoreError('Not a valid json file')
      }
    }
    reader.addEventListener('load', onLoadHandler)
    reader.readAsText(file)
    return () => {
      reader.removeEventListener('load', onLoadHandler)
    }
  }, [])

  const onErrorFile = useCallback((error: Error) => {
    setKeystoreError(`Selecting a key file failed: ${error}`)
  }, [])

  const onPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value)
      setInvalideStatus(false)
    },
    [],
  )

  const unlock = useCallback(async () => {
    if (keystore) {
      setProcessing(true)

      try {
        const phrase = await decryptFromKeystore(keystore, password)

        // clean up
        setPassword('')
        setKeystore(undefined)
        setProcessing(false)
        onConnect(keystore, phrase)
      } catch (error) {
        setProcessing(false)

        setInvalideStatus(true)
        console.error(error)
      }
    }
  }, [keystore, password, onConnect])

  const ready = password.length > 0 && !keystoreError && !processing

  return (
    <Styled.Container>
      <Helmet title="Connect Wallet" content="Connect Wallet" />
      <Styled.Header>Connect Keystore</Styled.Header>
      <Form onFinish={unlock}>
        <Styled.Content>
          <Styled.FormLabel color="normal">
            Please Select Keystore File
          </Styled.FormLabel>
          <FilePicker onChange={onChangeFile} onError={onErrorFile}>
            <Button color="primary" typevalue="outline" fixedWidth={false}>
              {keystore && !keystoreError && (
                <CheckCircleTwoTone twoToneColor="#50E3C2" />
              )}
              {(!keystore || keystoreError) && <UploadOutlined />}
              Choose File to Upload
            </Button>
          </FilePicker>
          {keystoreError && <Label color="error">{keystoreError}</Label>}
          <Styled.PasswordInput>
            <Styled.PasswordLabel>
              <Label color="normal">Decryption password </Label>
              <Tooltip
                title="This is the password used to decrypt your encrypted keystore file"
                placement="topLeft"
              >
                <QuestionCircleOutlined />
              </Tooltip>
            </Styled.PasswordLabel>
            <Input
              onChange={onPasswordChange}
              placeholder="Password"
              allowClear
              disabled={!keystore}
              type="password"
              sizevalue="big"
            />
            {invalideStatus && <Label color="error">Password is wrong.</Label>}
          </Styled.PasswordInput>
        </Styled.Content>
        <Styled.Footer>
          <Styled.FooterContent>
            <Button
              htmlType="submit"
              disabled={!ready}
              round
              loading={processing || loading}
              fixedWidth={false}
            >
              Unlock
            </Button>
            <Styled.ActionButton onClick={onCreate}>
              <Label color="primary">Create Wallet</Label>
            </Styled.ActionButton>
          </Styled.FooterContent>
        </Styled.Footer>
      </Form>
    </Styled.Container>
  )
}

export default KeystoreView
