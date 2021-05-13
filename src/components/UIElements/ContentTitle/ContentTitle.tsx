import React from 'react'

import { ContentTitleWrapper } from './ContentTitle.style'

export type Props = {
  justifyContent?: 'space-between' | 'center' | 'space-around'
  hasPadding?: boolean
  children: React.ReactNode
}

export const ContentTitle = (props: Props) => {
  const { justifyContent = 'center', hasPadding = false, ...otherProps } = props

  return (
    <ContentTitleWrapper
      hasPadding={hasPadding}
      justifyContent={justifyContent}
      {...otherProps}
    />
  )
}
