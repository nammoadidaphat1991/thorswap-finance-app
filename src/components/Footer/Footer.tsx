import React from 'react'

import Icon, {
  TwitterOutlined,
  MediumOutlined,
  GithubOutlined,
} from '@ant-design/icons'

import { DiscordIcon, TelegramIcon } from '../Icons'
import { ExternalButtonLink, ButtonLink } from '../Link'
import { Logo } from '../Logo'
import { StyledFooter, FooterContainer, FooterItem } from './Footer.style'

export const Footer: React.FC = (): JSX.Element => {
  return (
    <FooterContainer>
      <StyledFooter>
        <FooterItem>
          <a
            href="https://thorchain.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Logo type="thorchain" />
          </a>
        </FooterItem>
        <FooterItem>
          <div className="footer-links-bar">
            <ButtonLink to="/tx">TX</ButtonLink>
            <ButtonLink to="/tools">TOOLS</ButtonLink>
            <ButtonLink to="/explorer">EXPLORERS</ButtonLink>
            <ButtonLink to="/education">DOCS</ButtonLink>
            <ButtonLink to="/stats">STATS</ButtonLink>
            <ButtonLink to="/faqs">FAQS</ButtonLink>
          </div>
        </FooterItem>
        <FooterItem>
          <div className="footer-social-bar">
            <ExternalButtonLink link="https://twitter.com/thorswap">
              <TwitterOutlined />
            </ExternalButtonLink>
            <ExternalButtonLink link="https://discord.gg/PX4MNV5F">
              <Icon component={DiscordIcon} />
            </ExternalButtonLink>
            <ExternalButtonLink link="https://medium.com/thorchain">
              <MediumOutlined />
            </ExternalButtonLink>
            <ExternalButtonLink link="https://t.me/thorchain_org">
              <Icon component={TelegramIcon} />
            </ExternalButtonLink>
            <ExternalButtonLink link="https://github.com/thorswap/thorswap-finance-app">
              <GithubOutlined />
            </ExternalButtonLink>
          </div>
        </FooterItem>
      </StyledFooter>
    </FooterContainer>
  )
}
