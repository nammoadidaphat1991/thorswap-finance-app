import React, { useCallback, useMemo, useState } from 'react'

import { delay } from '@xchainjs/xchain-util'
import { Asset, WalletAccount } from 'multichain-sdk'

import { AssetMenu } from '../AssetMenu'
import {
  AssetSelectWrapper,
  AssetSelectMenuWrapper,
  AssetData,
  Selector,
  Modal,
} from './AssetSelect.style'

export type Props = {
  assets: Asset[]
  asset: Asset
  withSearch?: boolean
  showLabel?: boolean
  searchDisable?: string[]
  onSelect: (_: Asset) => void
  minWidth?: number
  searchPlaceholder?: string
  size?: 'small' | 'normal' | 'big'
  disabled?: boolean
  selectorTitle?: string
  wallet?: WalletAccount
}

export const AssetSelect: React.FC<Props> = (props): JSX.Element => {
  const {
    asset,
    assets = [],
    withSearch = true,
    showLabel = true,
    searchDisable = [],
    onSelect = () => {},
    children,
    minWidth,
    searchPlaceholder = 'Search...',
    selectorTitle = 'Select a token',
    size = 'small',
    disabled = false,
    wallet,
    ...others
  } = props

  const [modalShown, setModalShown] = useState<boolean>(false)
  const emptyAssets = useMemo(() => assets.length === 0, [assets])
  const hasTitle = useMemo(() => selectorTitle.length > 0, [selectorTitle])

  const closeMenu = useCallback(() => {
    if (modalShown) {
      setModalShown(false)
    }
  }, [setModalShown, modalShown])

  const handleDropdownButtonClicked = (e: React.MouseEvent) => {
    e.stopPropagation()
    // toggle dropdown state
    setModalShown(!emptyAssets && !modalShown)
  }

  const handleChangeAsset = useCallback(
    async (assetId: string) => {
      setModalShown(false)

      // Wait for the dropdown to close
      await delay(100)
      const changedAsset = assets.find((a: Asset) => assetId === a.toString())
      if (changedAsset) {
        onSelect(changedAsset)
      }
    },
    [assets, onSelect],
  )

  const renderMenu = useCallback(() => {
    const sortedAssetData = assets.sort((a: Asset, b: Asset) =>
      a.sortsBefore(b),
    )
    return (
      <AssetSelectMenuWrapper hasTitle={hasTitle}>
        <AssetMenu
          searchPlaceholder={searchPlaceholder}
          assets={sortedAssetData}
          asset={asset}
          withSearch={withSearch}
          searchDisable={searchDisable}
          onSelect={handleChangeAsset}
          wallet={wallet}
        />
      </AssetSelectMenuWrapper>
    )
  }, [
    assets,
    asset,
    handleChangeAsset,
    searchDisable,
    withSearch,
    searchPlaceholder,
    hasTitle,
    wallet,
  ])

  return (
    <AssetSelectWrapper minWidth={minWidth} {...others}>
      {!!children && children}
      {disabled && (
        <AssetData asset={asset} showLabel={showLabel} size={size} />
      )}
      {!disabled && (
        <Selector disabled={emptyAssets} onClick={handleDropdownButtonClicked}>
          <AssetData asset={asset} showLabel={showLabel} size={size} />
        </Selector>
      )}
      <Modal
        title={selectorTitle}
        visible={modalShown}
        onCancel={closeMenu}
        footer={null}
        width="90vw"
        centered
      >
        {renderMenu()}
      </Modal>
    </AssetSelectWrapper>
  )
}
