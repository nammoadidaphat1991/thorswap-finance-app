import { ContentView, PoolChart, Label } from 'components'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from 'helpers/style'

export const Container = styled(ContentView)`
  background: ${palette('background', 3)};
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`

export const PoolInfo = styled.div`
  display: flex;
  align-items: center;
`

export const AssetLabel = styled(Label)`
  margin-left: 4px;
  margin-right: 8px;

  font-size: 14px;
  ${media.sm`
    font-size: 28px;
  `}
`

export const Section = styled.div`
  margin-bottom: 20px;
`

export const Chart = styled(PoolChart)`
  height: 100%;
`
export const PoolAction = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`
