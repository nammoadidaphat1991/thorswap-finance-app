/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable quotes */
import React from 'react'

import { Label, ExternalLink } from 'components'
import styled from 'styled-components/macro'

const Content = styled.div`
  display: flex;
  flex-direction: column;
`

export type Faq = {
  title: string
  content: React.ReactNode
}

export const faqs: Faq[] = [
  {
    title: 'How do I create a wallet?',
    content: (
      <Content>
        <Label size="big">
          Click the CONNECT button on the header and Download a Keystore file
          created with Password. You have to backup your Keystore and password
          seriously, your funds may be lost if you lose Keystore file or forget
          password.
        </Label>
      </Content>
    ),
  },
  {
    title: 'How do I connect a wallet?',
    content: (
      <Content>
        <Label size="big">
          Click the CONNECT button on the header and select your keystore file.
          You have to input the correct password in order to use your wallet.
        </Label>
      </Content>
    ),
  },
  {
    title:
      'Can I use the same 12 seed phrases I am already using for TrustWallet, MetaMask?',
    content: (
      <Content>
        <Label size="big">
          YES, you can use any multi-coin wallet in the THORSwap. Any BIP39
          standard 12 seed phrases can be used for wallet
        </Label>
      </Content>
    ),
  },
  {
    title:
      "I added the liquidity but still don't see my share, Is my fund lost?",
    content: (
      <Content>
        <Label size="big">
          NO, Your LP might be still pending and it just doens't show up in the
          interface. The team is working on the UI for displaying a pending
          interface and it will be available soon. If you want to make sure your
          fund are safe, please feel free to reach out
          <ExternalLink link="https://discord.gg/PX4MNV5F">here</ExternalLink>
        </Label>
      </Content>
    ),
  },
  {
    title: 'Can I provide only RUNE to the LP?',
    content: (
      <Content>
        <Label size="big">
          YES, you can provide only RUNE to the liquidity pool but please be
          aware the half amount of RUNE is swapped into the equal value of pool
          asset. Please refer details{' '}
          <ExternalLink link="https://thorchain.help/stakers-liquidity-providers#please-be-aware">
            here
          </ExternalLink>
        </Label>
      </Content>
    ),
  },
  {
    title:
      'Can I withdraw LP symmetrically after depositing an asset asymmetrically?',
    content: (
      <Content>
        <Label size="big">
          No. You cannot withdraw symmetrically. You can withdraw only
          asymmetrically for LP you deposited asymmetrically.
        </Label>
      </Content>
    ),
  },
  {
    title: 'How can I report bugs?',
    content: (
      <Content>
        <Label size="big">
          You can report bugs in the{' '}
          <ExternalLink link="https://discord.gg/PX4MNV5F">
            discord channel
          </ExternalLink>
          .
        </Label>
      </Content>
    ),
  },
  {
    title: 'How can I provide feedback?',
    content: (
      <Content>
        <Label size="big">
          Feedback is always appreciated and we encourage you to submit issues
          to{' '}
          <ExternalLink link="https://github.com/thorswap/thorswap-finance-app/issues">
            github
          </ExternalLink>{' '}
          or in the{' '}
          <ExternalLink link="https://discord.gg/PX4MNV5F">
            discord channel
          </ExternalLink>
          .
        </Label>
      </Content>
    ),
  },
]
