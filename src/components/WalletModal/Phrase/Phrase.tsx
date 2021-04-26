import React, { useState, useCallback } from 'react'

import { QuestionCircleOutlined } from '@ant-design/icons'
import {
  encryptToKeyStore,
  validatePhrase,
  Keystore,
} from '@xchainjs/xchain-crypto'
import { Form, Tooltip } from 'antd'

import { downloadAsFile } from 'helpers/download'

import { Helmet } from '../../Helmet'
import { Button, Input, Label } from '../../UIElements'
import * as Styled from './Phrase.style'

type Props = {
  onConnect: (keystore: Keystore, phrase: string) => void
  onCreate: () => void
}

const PhraseView = ({ onConnect, onCreate }: Props) => {
  const [phrase, setPhrase] = useState('')
  const [invalidPhrase, setInvalidPhrase] = useState(false)

  const [password, setPassword] = useState<string>('')
  const [invalideStatus, setInvalideStatus] = useState(false)
  const [processing, setProcessing] = useState(false)

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value)
      setInvalideStatus(false)
    },
    [],
  )

  const handlePhraseChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPhrase(e.target.value)
    },
    [],
  )

  const handleBackupKeystore = useCallback(async () => {
    if (phrase && password) {
      setProcessing(true)

      try {
        const isValidPhrase = validatePhrase(phrase)

        if (!isValidPhrase) {
          setInvalidPhrase(true)
          return
        }

        const keystore = await encryptToKeyStore(phrase, password)

        await downloadAsFile('thorswap-keystore.txt', JSON.stringify(keystore))

        onConnect(keystore, phrase)

        // clean up
        setPassword('')
        setPhrase('')
      } catch (error) {
        setInvalideStatus(true)
        console.error(error)
      }
      setProcessing(false)
    }
  }, [phrase, password, onConnect])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUnlock = useCallback(async () => {
    if (phrase && password) {
      setProcessing(true)

      try {
        const isValidPhrase = validatePhrase(phrase)

        if (!isValidPhrase) {
          setInvalidPhrase(true)
          return
        }

        const keystore = await encryptToKeyStore(phrase, password)

        // clean up
        setPassword('')
        setPhrase('')
        setProcessing(false)

        onConnect(keystore, phrase)
      } catch (error) {
        setProcessing(false)
        setInvalideStatus(true)
        console.error(error)
      }
    }
  }, [phrase, password, onConnect])

  const ready = password.length > 0 && !invalidPhrase && !processing

  return (
    <Styled.Container>
      <Helmet title="Import Phrase" content="Import Phrase" />
      <Styled.Header>Import Phrase and Backup</Styled.Header>
      <Form>
        <Styled.Content>
          <Styled.FormLabel color="normal">
            Please Enter 12 Seed Phrase
          </Styled.FormLabel>
          <Input
            value={phrase}
            onChange={handlePhraseChange}
            placeholder="Phrase"
            allowClear
            sizevalue="big"
            multiple
          />
          {invalidPhrase && <Label color="error">Phrase is invalid</Label>}
          <Styled.PasswordInput>
            <Styled.PasswordLabel>
              <Label color="normal">Decryption password</Label>
              <Tooltip
                title="Password is used to backup keystore"
                placement="bottomRight"
              >
                <QuestionCircleOutlined />
              </Tooltip>
            </Styled.PasswordLabel>
            <Input
              value={password}
              onChange={handlePasswordChange}
              placeholder="Password for keystore backup"
              allowClear
              disabled={!phrase}
              type="password"
              sizevalue="big"
            />
          </Styled.PasswordInput>
          {invalideStatus && <Label color="error">Something went wrong.</Label>}
        </Styled.Content>
        <Styled.Footer>
          <Styled.FooterContent>
            <Styled.ActionButton onClick={onCreate}>
              <Label color="primary">Create</Label>
            </Styled.ActionButton>
            <Button
              onClick={handleBackupKeystore}
              disabled={!ready}
              round
              loading={processing}
              fixedWidth={false}
            >
              Backup Keystore
            </Button>
          </Styled.FooterContent>
        </Styled.Footer>
      </Form>
    </Styled.Container>
  )
}

export default PhraseView
