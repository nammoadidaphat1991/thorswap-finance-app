import React from 'react'

import QRCode from 'react-qr-code'

import { CloseOutlined } from '@ant-design/icons'
import { Typography } from 'antd'

import { Overlay, Label } from '../../UIElements'
import * as Styled from './QRCodeModal.style'

const { Paragraph } = Typography

export type QRCodeModalProps = {
  chain: string
  text: string
  visible: boolean
  onCancel?: () => void
}

export const QRCodeModal: React.FC<QRCodeModalProps> = (props): JSX.Element => {
  const { chain, text, visible, onCancel = () => {} } = props

  return (
    <Overlay isOpen={visible} onDismiss={onCancel}>
      <Styled.Content>
        <Styled.ModalIcon onClick={onCancel}>
          <CloseOutlined />
        </Styled.ModalIcon>
        <Label size="large" weight="bold">
          {chain}
        </Label>
        <Styled.QRCodeWrapper>
          <QRCode value={text} />
        </Styled.QRCodeWrapper>
        <Styled.Label>
          <Paragraph copyable>{text}</Paragraph>
        </Styled.Label>
      </Styled.Content>
    </Overlay>
  )
}
