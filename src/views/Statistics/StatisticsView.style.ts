import { Label } from 'components'
import styled from 'styled-components/macro'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
`

export const Section = styled.div`
  display: flex;
  flex-direction: column;

  padding: 10px 0;
`

export const SectionTitle = styled(Label).attrs({
  weight: 'bold',
  size: 'large',
  color: 'primary',
})`
  margin-bottom: 8px;
`
