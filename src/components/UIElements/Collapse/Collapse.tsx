import React from 'react'

import { CollapseProps } from 'antd/lib/collapse'

import { Label } from '../Label'
import { CollapseWrapper, Panel } from './Collapse.style'
import { Item } from './data'

export type ComponentProps = {
  data: Item[]
  className?: string
  type?: 'text' | 'element'
}

export type Props = ComponentProps & CollapseProps

export const Collapse: React.FC<Props> = (props: Props): JSX.Element => {
  const { data, type = 'text', className = '', ...otherProps } = props

  return (
    <CollapseWrapper
      className={`collapse-wrapper ${className}`}
      bordered={false}
      {...otherProps}
    >
      {data.map((value, index) => {
        const { title, content } = value

        return (
          <Panel header={title} className="collapse-panel-wrapper" key={index}>
            {type === 'text' && (
              <Label size="big" color="normal">
                {content}
              </Label>
            )}
            {type === 'element' && content}
          </Panel>
        )
      })}
    </CollapseWrapper>
  )
}
