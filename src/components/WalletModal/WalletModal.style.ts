import styled from 'styled-components/macro'
import { palette } from 'styled-theme'

import { Panel } from '../Panel'
import { CoreButton } from '../UIElements'

export const ConnectContainer = styled(Panel)`
  position: relative;
  background: transparent;
  border-radius: 14px;
  margin-left: auto;
  margin-right: auto;

  padding: 8px 12px;
  padding-bottom: 12px;
`

export const ConnectTabHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px 0;
`

export const TabContent = styled.div`
  display: flex;
  flex-direction: column;
`

export const ModalHeader = styled.div`
  position: absolute;
  top: 12px;

  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 20px;

  padding-right: 16px;
  z-index: 100;
`

export const ActionButton = styled(CoreButton)`
  display: flex;
  justify-content: center;
  margin-right: 12px;

  svg {
    width: 20px;
    height: 20px;

    color: ${palette('text', 0)};
  }
`

export const MainPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 20px 8px;
`

export const ConnectOption = styled(CoreButton)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 14px;

  width: 90%;
  height: 40px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0px;
  }

  text-transform: uppercase;
  border: 1px solid ${palette('gray', 0)};

  &:hover {
    border: 1px solid ${palette('primary', 0)};
  }

  svg {
    width: 20px;
    height: 20px;
    margin-right: 8px;

    color: ${palette('text', 0)};
  }
`
