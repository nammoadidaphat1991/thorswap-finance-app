import React, { useMemo } from 'react'

import { DownOutlined } from '@ant-design/icons'
import { Dropdown, Row } from 'antd'

import useNetwork from 'hooks/useNetwork'

import { midgardApi } from 'services/midgard'

import { getHostnameFromUrl } from 'helpers/api'

import { StatusBadge, Menu, Label } from '../UIElements'
import * as Styled from './NetworkStatus.style'

type StatusColor = 'red' | 'yellow' | 'green'

type MenuItem = {
  key: string
  label: string
  url?: string
  status: StatusColor
}

// TODO: implement outbound queue level

export const NetworkStatus = (): JSX.Element => {
  const { statusColor, outboundQueue, outboundQueueLevel } = useNetwork()

  // Midgard IP on devnet OR on test|chaos|mainnet
  const midgardUrl = getHostnameFromUrl(midgardApi.getBaseUrl()) || ''

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        key: 'outbound',
        label: 'Outbound',
        url: `Queue: ${outboundQueue} (${outboundQueueLevel})`,
        status: statusColor,
      },
      {
        key: 'midgard_api',
        label: 'Midgard',
        url: midgardUrl,
        status: 'green',
      },
      {
        key: 'thornode',
        label: 'THORNODE',
        url: 'thornode.thorchain.info',
        status: 'green',
      },
    ],
    [midgardUrl, statusColor, outboundQueue, outboundQueueLevel],
  )

  const menu = useMemo(
    () => (
      <Menu
        style={{
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
        className="connection-menu-items"
      >
        {menuItems.map((item) => {
          const { label, key, status, url } = item
          return (
            <Menu.Item
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 10px',
              }}
              key={key}
            >
              <StatusBadge color={status} />
              <Styled.StatusItem>
                <Row>
                  <Label weight="bold">{label}</Label>
                </Row>
                <Row>
                  <Label color="gray" size="small">
                    {url || 'unknown'}
                  </Label>
                </Row>
              </Styled.StatusItem>
            </Menu.Item>
          )
        })}
      </Menu>
    ),
    [menuItems],
  )

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Styled.Button>
        <Styled.DropdownLink className="ant-dropdown-link" href="/">
          <StatusBadge color={statusColor} />
          <DownOutlined />
        </Styled.DropdownLink>
      </Styled.Button>
    </Dropdown>
  )
}
