import { Asset } from 'multichain-sdk'

import {
  STATS_ROUTE,
  LIQUIDITY_ROUTE,
  PENDING_LIQUIDITY_ROUTE,
  getSwapRoute,
  getAddLiquidityRoute,
} from 'settings/constants'

export const navMenuList = [
  {
    link: '/',
    label: 'DASHBOARD',
  },
  {
    link: getSwapRoute(Asset.BTC(), Asset.RUNE()),
    label: 'SWAP',
  },
  {
    link: '/pools',
    label: 'POOLS',
  },
  {
    link: LIQUIDITY_ROUTE,
    label: 'LIQUIDITY',
  },
  {
    link: getAddLiquidityRoute(Asset.BTC()),
    label: 'DEPOSIT',
  },
  {
    link: PENDING_LIQUIDITY_ROUTE,
    label: 'PENDING',
  },
  {
    link: STATS_ROUTE,
    label: 'STATS',
  },
]
