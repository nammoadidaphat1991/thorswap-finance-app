import styled from 'styled-components'

type Props = {
  size: number
}

export const IconWrapper = styled.div<Props>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;

  svg {
    width: ${(props) => props.size}px;
    height: ${(props) => props.size}px;
  }
`
