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
    title: 'What is THORSwap?',
    content: (
      <Content>
        <Label size="big">
          THORSwap is the world’s first Multichain DEX that utilizes the
          THORChain network to provide a front-end user interface to perform
          cross-chain swaps. This is done in a permissionless, trustless, and
          non-custodial manner. There are no pegged or wrapped assets, it is
          purely native. For more information check out
          <ExternalLink link="https://thorswap.medium.com/thorswap-has-launched-is-this-the-death-of-cexs-cb6cf015b8f">
            here
          </ExternalLink>
        </Label>
      </Content>
    ),
  },
  {
    title: 'Who are THORSwap?',
    content: (
      <Content>
        <Label size="big">
          THORSwap are the team that built BEPSwap and our vision is to become
          the #1 decentralized exchange in the world.
        </Label>
      </Content>
    ),
  },
  {
    title: 'Can I become a liquidity provider on THORSwap?',
    content: (
      <Content>
        <Label size="big">
          Yes, BUT currently LP’s are capped! You will have to wait for official
          announcements when caps are raised. Once they are raised you can then
          provide liquidity. Announcements will be made on twitter. Disclosure:
          If you provide liquidity when caps are FULL, then you will be
          refunded, however, you will be returned with less than you originally
          had in order to pay for the gas to refund you.
        </Label>
      </Content>
    ),
  },
  {
    title: 'How do I use THORSwap?',
    content: (
      <Content>
        <Label size="big">
          <ExternalLink link="https://thorswap.medium.com/how-to-use-thorswap-e13a2a4eafdd">
            Here
          </ExternalLink>
          is an article on how to: 1. Create an Keystore wallet 2. Migrate from
          BEPSwap to THORSwap 3. Upgrade your BNB.RUNE and ETH.RUNE to native
          RUNE (THOR.RUNE)
        </Label>
      </Content>
    ),
  },
  {
    title: 'What Wallets are compatible with THORSwap?',
    content: (
      <Content>
        <Label size="big">
          Keystore Wallet and xDEFI are fully compatible. TrustWallet, Metamask
          and Ledger will be integrated soon!
        </Label>
      </Content>
    ),
  },
  {
    title:
      'Will there be system automated LP funds transfer from BEPSWAP to THORSwap?',
    content: (
      <Content>
        <Label size="big">
          No. Users are expected to withdraw, swap to natives, enter THORSwap LP
          manually. BEPSWAP will coexist for a while until all funds are
          withdrawn.
        </Label>
      </Content>
    ),
  },
  {
    title: 'Can I deposit RUNE?',
    content: (
      <Content>
        <Label size="big">
          Technically yes, but by becoming a liquidity provider (LP) which earns
          APY.
        </Label>
      </Content>
    ),
  },
  {
    title: 'What is “liquidity provider” aka LP?',
    content: (
      <Content>
        <Label size="big">
          Liquidity providers earn rewards in exchange for supplying their
          assets to the network. Their assets are added to pools which swappers
          use to exchange assets. The main benefit for Liquidity Provider is
          that they’re able to earn yields on stagnant assets like Bitcoin,
          Ethereum, Binance coin etc. You will be providing liquidity at a 50:50
          ratio. i.e 50% RUNE and 50% Asset. Liquidity Providers are rewarded
          for keeping their assets in THORChain. APY comes from block rewards,
          incentives and the swap fees. LP’s get their rewards when they take
          their assets back out of THORChain.
        </Label>
      </Content>
    ),
  },
  {
    title: 'Why does RUNE need to be the settlement asset in every pool?',
    content: (
      <Content>
        <Label size="big">
          If each pool is comprised of two assets eg. BTC:ETH then there will be
          a scaling problem with n*(n-1)/2 possible connections. By having RUNE
          one side of each pool, $RUNE becomes a settlement currency allowing
          swaps between any two other asset. Additionally, having $RUNE in a
          pool ensures that the network can become aware of the value of assets
          it is securing.
        </Label>
      </Content>
    ),
  },
  {
    title: 'Will there be a pool with stablecoin?',
    content: (
      <Content>
        <Label size="big">
          There will be a USDr pool, which will be connect with many different
          USD stablecoins, de-risking them all and allowing traders to arbitrage
          the price to exactly $1. USDr will use collateralised debt positions
          in a novel way with the existing continuous liquidity pools so that it
          is liquid and safe.
        </Label>
      </Content>
    ),
  },
  {
    title: 'Is their Impermanent Loss Protection?',
    content: (
      <Content>
        <Label size="big">
          YES! Liquidity Providers will receive 100% IL protection for 100 days.
          Essentially this means you are adding 1% protection for every day that
          you provide liquidity. 49 days provided = 49% IL protection, 100 days
          = 100% IL protection.
        </Label>
      </Content>
    ),
  },
  {
    title: 'Will there be a lockup period for LP’s?',
    content: (
      <Content>
        <Label size="big">
          There is no minimum or maximum time or amount. Join and leave whenever
          you wish.
        </Label>
      </Content>
    ),
  },
  {
    title: 'Where can I learn more about providing liquidity (LP)?',
    content: (
      <Content>
        <Label size="big">
          Become a student at LP University!
          https://discord.com/invite/9TftHUuU3k
        </Label>
      </Content>
    ),
  },
  {
    title: 'What is the monetary policy?',
    content: (
      <Content>
        <Label size="big">
          The goal is to have a fixed supply at all times. Instead of constantly
          emitting (infinite supply like Cosmos or Ethereum) or reducing the
          emission down to zero (Bitcoin) the team elect to match emissions to
          the difference between current circulating supply and the max supply,
          as well as burning fees. This means there is 500 million progressively
          emitted to nodes for security and liquidity over time.
        </Label>
      </Content>
    ),
  },
  {
    title: 'Is the team profit oriented?',
    content: (
      <Content>
        <Label size="big">
          No - not profit orientated. All fees go back to users. There is no
          revenue model for the team via the protocol. All swap fees go to
          liquidity providers, all protocol fees are burned, emissions/block
          rewards go to validators. The team are incentivised through holding
          the same RUNE as everyone else. The team are providing a service, a
          service that contributes to the decentralisation of the whole crypto
          ecosystem. We are the first multi-chain DEX with native assets!{' '}
        </Label>
      </Content>
    ),
  },
  {
    title: 'Why didn’t my swap/transaction go through?',
    content: (
      <Content>
        <Label size="big">
          Try not inputting a max amount (100%) to leave some funds for gas.
        </Label>
      </Content>
    ),
  },
  {
    title: 'Why can’t I upgrade my BNB.RUNE or ETH.RUNE to THOR.RUNE.',
    content: (
      <Content>
        <Label size="big">
          You will need additional BNB or ETH in your wallet to cover the tx to
          upgrade.
        </Label>
      </Content>
    ),
  },
  {
    title: 'How are fees calculated?',
    content: (
      <Content>
        <Label size="big">
          It is important to note the current congestion of said asset you want
          to swap, as gas fees on ETH and congestion on BTC will affect how much
          fees you will pay. This will improve when depths of liquidity pools
          increase and a prediction of gas will also soon be implemented. The
          other chain’s network fee is out of THORSwaps control and is due to
          efficiency of their native network. i.e to swap Native BTC to Native
          ETH directly on THORSwap - you would pay BTC network fee, ETH network
          fee, and RUNE network fee. Compare it to a swap from Native BTC -
          Wrapped BTC - Wrapped ETH - Native ETH. You would pay multiple
          transaction fees using ETH. When you swap to an L1, you pay the
          outbound gas fee on that chain with a 3x premium. We are updating the
          interface to: 1) Give you a quote with this fee added 2) Not let you
          swap an amount below this 3) Add more info about fees In the future,
          you will be able to swap any small amounts - BTC/BTC synth (for
          10-20c), then redeem all at once in a large amount of BTC.BTC. For
          more information:
          <ExternalLink link="https://docs.thorchain.org/how-it-works/fees#fees">
            Here
          </ExternalLink>
          and
          <ExternalLink link="https://twitter.com/THORChain/status/1386128159649587201?s=20">
            Here
          </ExternalLink>
        </Label>
      </Content>
    ),
  },
  {
    title: 'Where does the 3x premium come from?',
    content: (
      <Content>
        <Label size="big">
          1x doesn't work as the system would be at a loss, since it uses 1.5x
          the advised gas. 1.5x wouldn't work because the system would barely
          break even. So it charges 2x what the nodes use (1.5x) and pays the
          LPs back for ACTUAL gas. The margin, 1.5x, is system income. The fee
          structure has a fixed component and variable component on the tx size.
          On those 3x of the gas outbound chain, there is half of that is going
          to the network and LPs as a "network fee" (1.5x) and the outbound
          transaction has the other half (1.5x) of that fee to use as gas on the
          chain, so its up to 1.5x the average current gas to make sure its a
          fast transaction.
        </Label>
      </Content>
    ),
  },
  {
    title: 'What differentiates THORSwap from other interfaces?',
    content: (
      <Content>
        <Label size="big">
          TLDR: This is your ticket to ASGARD! All-in-one tools and features in
          one interface, you can stay in just one interface and never need to
          leave all the time Analytical Dashboard and Professional UI/UX Highly
          Scalable Infrastructure Security-First Implementation Extraordinary
          development speed High Quality and scalable codebase (maintain and
          integrate thorchain.js) Strong Community Engagement and Social
          Activity 100% Transparency through the medium blog post Support other
          ecosystems like LPU and Marketing Campaign 24/7 Technical Support
          through Discord
        </Label>
      </Content>
    ),
  },
  {
    title: 'What assets can you swap and provide liquidity for?',
    content: (
      <Content>
        <Label size="big">
          Currently - BTC, ETH, LTC, BNB, BCH, ERC-20 (USDT and SUSHI), BEP2
          (BUSD and BTCB) Soon - XHV, BSC, DOGE, ZCASH, DOT, KSM, XMR, SOL,
          LUNA, ATOM, AKASH, SCRT, INJ, SIF, FIL and many more!
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
