import React, { useMemo, useCallback } from 'react'

import { Asset, WalletAccount, Account } from 'multichain-sdk'

import { FilterList } from 'components/UIElements/FilterList'

import { AssetData } from '../AssetData'

const filterFunction = (asset: Asset, searchTerm: string) => {
  const { ticker } = asset
  return ticker?.toLowerCase().indexOf(searchTerm.toLowerCase()) === 0
}

export type Props = {
  asset: Asset
  assets: Asset[]
  searchDisable: string[]
  withSearch?: boolean
  searchPlaceholder?: string
  onSelect: (value: string) => void
  wallet?: WalletAccount
}

export const AssetMenu: React.FC<Props> = (props): JSX.Element => {
  const {
    searchPlaceholder,
    assets,
    asset,
    withSearch = true,
    searchDisable = [],
    onSelect = () => {},
    wallet,
  } = props

  const filteredData = useMemo(
    (): Asset[] => assets.filter((a: Asset) => !asset.eq(a)),
    [asset, assets],
  )

  const cellRenderer = useCallback(
    (a: Asset) => {
      const balance = wallet && Account.getAssetBalance(wallet, a).amount
      const node = <AssetData asset={a} amount={balance} />
      const key = a.toString()
      return { key, node }
    },
    [wallet],
  )

  const disableItemFilterHandler = useCallback(
    (a: Asset) => searchDisable.indexOf(a.ticker) > -1,
    [searchDisable],
  )

  return (
    <FilterList
      placeholder={searchPlaceholder}
      searchEnabled={withSearch}
      filterFunction={filterFunction}
      cellRenderer={cellRenderer}
      disableItemFilter={(a: Asset) => disableItemFilterHandler(a)}
      onSelect={onSelect}
      data={filteredData}
    />
  )
}
