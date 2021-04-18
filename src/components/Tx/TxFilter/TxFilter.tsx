import React, { useCallback, ReactNode } from 'react'

import {
  DatabaseOutlined,
  SwapOutlined,
  DoubleRightOutlined,
  ImportOutlined,
  CaretDownOutlined,
  FilterOutlined,
  RetweetOutlined,
  RedoOutlined,
} from '@ant-design/icons'
import { Dropdown } from 'antd'
import { ActionTypeEnum } from 'midgard-sdk'

import { Menu, DesktopButton, MobileButton } from './TxFilter.style'

export type FilterValue =
  | ActionTypeEnum.Swap
  | ActionTypeEnum.AddLiquidity
  | ActionTypeEnum.Withdraw
  | ActionTypeEnum.Switch
  | ActionTypeEnum.Refund
  | 'all'

type Props = {
  value: string
  onClick?: (key: string) => void
}

type MenuItem = {
  icon: ReactNode
  title: string
  key: FilterValue
}

type MenuItems = MenuItem[]

export const TxFilter: React.FC<Props> = (props: Props): JSX.Element => {
  const { value, onClick } = props

  const items: MenuItems = [
    {
      icon: <DatabaseOutlined />,
      title: 'ALL',
      key: 'all',
    },
    {
      icon: <SwapOutlined />,
      title: 'SWAP',
      key: ActionTypeEnum.Swap,
    },
    {
      icon: <DoubleRightOutlined />,
      title: 'ADD LIQUIDITY',
      key: ActionTypeEnum.AddLiquidity,
    },
    {
      icon: <ImportOutlined />,
      title: 'WITHDRAW',
      key: ActionTypeEnum.Withdraw,
    },
    {
      icon: <RetweetOutlined />,
      title: 'Upgrade',
      key: ActionTypeEnum.Switch,
    },
    {
      icon: <RedoOutlined />,
      title: 'Refund',
      key: ActionTypeEnum.Refund,
    },
  ]

  const handleClickItem = useCallback(
    ({ key }) => {
      if (onClick) onClick(key)
    },
    [onClick],
  )

  const renderMenu = () => {
    return (
      <Menu
        className="filterDropdown-menu-items"
        onClick={handleClickItem}
        selectedKeys={[value]}
      >
        {items.map((item) => {
          return (
            <Menu.Item key={item.key}>
              {item.icon} {item.title}
            </Menu.Item>
          )
        })}
      </Menu>
    )
  }

  const menuLabel = value === ActionTypeEnum.Withdraw ? 'WITHDRAW' : value

  return (
    <Dropdown overlay={renderMenu()} trigger={['click']}>
      <div className="dropdown-wrapper">
        <DesktopButton color="primary" typevalue="ghost">
          {menuLabel} <CaretDownOutlined />
        </DesktopButton>
        <MobileButton color="primary" typevalue="ghost">
          <FilterOutlined />
        </MobileButton>
      </div>
    </Dropdown>
  )
}
