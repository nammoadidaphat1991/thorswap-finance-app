import React, { useCallback, useState } from 'react'

import { Form } from 'antd'
import { supportedChains } from 'multichain-sdk'

import { AssetIcon } from 'components/Assets'

import { Helmet } from '../../Helmet'
import { Button } from '../../UIElements'
import * as Styled from './Ledger.style'
import { chainToSigAsset } from './types'

type Props = {
  onConnect: () => void
  loading?: boolean
}

const LedgerView = ({ onConnect, loading = false }: Props) => {
  const [activeChain, setActiveChain] = useState('')

  const onHandleConnect = useCallback(() => {
    onConnect()
  }, [onConnect])

  return (
    <Styled.Container>
      <Helmet title="Connect Ledger" content="Connect Ledger" />
      <Styled.Header>Connect Ledger</Styled.Header>
      <Form onFinish={onHandleConnect}>
        <Styled.Content>
          <Styled.FormLabel color="normal">
            Please select chain to connect.
          </Styled.FormLabel>
          {supportedChains.map((chain) => {
            const chainAsset = chainToSigAsset(chain)

            return (
              <Styled.ChainButton
                key={chain}
                color="primary"
                typevalue={activeChain === chain ? 'default' : 'ghost'}
                fixedWidth={false}
                onClick={() => setActiveChain(chain)}
              >
                <AssetIcon asset={chainAsset} size="small" />
                {chain}
                <div />
              </Styled.ChainButton>
            )
          })}
        </Styled.Content>
        <Styled.Footer>
          <Styled.FooterContent>
            <Button
              htmlType="submit"
              round
              // disabled={!activeChain}
              disabled
              loading={loading}
              fixedWidth={false}
            >
              Connect Ledger
            </Button>
          </Styled.FooterContent>
        </Styled.Footer>
      </Form>
    </Styled.Container>
  )
}

export default LedgerView
