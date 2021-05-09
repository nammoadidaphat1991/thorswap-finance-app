import React, { useCallback, useMemo, useState } from 'react'

import { delay } from '@xchainjs/xchain-util'
import { Asset } from 'multichain-sdk'

import { AssetMenu } from '../AssetMenu'
import {
  AssetSelectWrapper,
  AssetDropdownButton,
  AssetSelectMenuWrapper,
  DropdownIconHolder,
  DropdownIcon,
  AssetData,
  Selector,
  Modal,
} from './AssetSelect.style'

type DropdownCarretProps = {
  open: boolean
  onClick?: () => void
}

const DropdownCarret: React.FC<DropdownCarretProps> = (
  props: DropdownCarretProps,
): JSX.Element => {
  const { open, onClick = () => {} } = props
  return (
    <DropdownIconHolder>
      <DropdownIcon open={open} onClick={onClick} />
    </DropdownIconHolder>
  )
}

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
          closeMenu={closeMenu}
          assets={sortedAssetData}
          asset={asset}
          withSearch={withSearch}
          searchDisable={searchDisable}
          onSelect={handleChangeAsset}
        />
      </AssetSelectMenuWrapper>
    )
  }, [
    assets,
    asset,
    closeMenu,
    handleChangeAsset,
    searchDisable,
    withSearch,
    searchPlaceholder,
    hasTitle,
  ])

  const renderDropDownButton = () => {
    return (
      <AssetDropdownButton disabled={emptyAssets || disabled}>
        {!emptyAssets ? <DropdownCarret open={modalShown} /> : null}
      </AssetDropdownButton>
    )
  }

  return (
    <AssetSelectWrapper minWidth={minWidth} {...others}>
      <>
        {!!children && children}
        {disabled && (
          <AssetData asset={asset} showLabel={showLabel} size={size} />
        )}
        {!disabled && (
          <Selector
            disabled={emptyAssets}
            onClick={handleDropdownButtonClicked}
          >
            <AssetData asset={asset} showLabel={showLabel} size={size} />
            {renderDropDownButton()}
          </Selector>
        )}
      </>
      <Modal
        title={selectorTitle}
        visible={modalShown}
        footer={null}
        width="90vw"
        centered
      >
        {renderMenu()}
      </Modal>
    </AssetSelectWrapper>
  )
}
