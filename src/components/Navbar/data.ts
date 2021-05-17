import {
  STATS_ROUTE,
  SWAP_ROUTE,
  LIQUIDITY_ROUTE,
  PENDING_LIQUIDITY_ROUTE,
} from 'settings/constants'

export const navMenuList = [
  {
    link: '/',
    label: 'POOLS',
  },
  {
    link: SWAP_ROUTE,
    label: 'SWAP',
  },
  {
    link: LIQUIDITY_ROUTE,
    label: 'LIQUIDITY',
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
