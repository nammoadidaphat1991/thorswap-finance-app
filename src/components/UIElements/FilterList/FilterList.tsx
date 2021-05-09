import React, { useCallback, useMemo, useState } from 'react'

import { SearchOutlined } from '@ant-design/icons'

import { Input } from '../Input'
import { ListWrapper, ListItem, List } from './FilterList.style'

type Props<T> = {
  data: T[]
  placeholder?: string
  searchEnabled?: boolean
  cellRenderer: (data: T) => { key: string; node: JSX.Element }
  disableItemFilter?: (item: T) => boolean
  filterFunction: (item: T, searchTerm: string) => boolean
  onSelect?: (value: string) => void
}

export const FilterList = <T extends unknown>(props: Props<T>): JSX.Element => {
  const {
    onSelect = () => {},
    searchEnabled = false,
    data,
    filterFunction,
    cellRenderer,
    disableItemFilter = () => false,
    placeholder = 'Search',
  } = props

  const [searchTerm, setSearchTerm] = useState('')

  const handleClick = useCallback(
    (key) => {
      setSearchTerm('')
      onSelect(key)
    },
    [onSelect],
  )

  const handleSearchChanged = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newSearchTerm = event.currentTarget.value
      setSearchTerm(newSearchTerm)
    },
    [],
  )

  const filteredData: T[] = useMemo(
    () =>
      searchTerm === ''
        ? data
        : data.filter((item) => filterFunction(item, searchTerm)),
    [data, filterFunction, searchTerm],
  )

  return (
    <ListWrapper>
      {searchEnabled && (
        <Input
          value={searchTerm}
          onChange={handleSearchChanged}
          placeholder={placeholder}
          sizevalue="big"
          typevalue="ghost"
          suffix={<SearchOutlined />}
        />
      )}
      <List>
        {filteredData.map((item: T, index: number) => {
          const { key, node } = cellRenderer(item)
          const disableItem = disableItemFilter(item)

          return (
            <ListItem
              onClick={() => {
                if (!disableItem && index !== 1) handleClick(key)
              }}
              disabled={disableItem || index === 1}
              key={key}
            >
              {node}
            </ListItem>
          )
        })}
      </List>
    </ListWrapper>
  )
}

export default FilterList
