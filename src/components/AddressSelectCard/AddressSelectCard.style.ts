import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Input } from '../UIElements'

export const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;

  border: 1px solid ${palette('gray', 0)};
  border-radius: 4px;

  padding: 0px 8px;
`

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 2px 0px;
`

export const CardTitle = styled.div`
  display: flex;
  align-items: center;
  color: ${palette('text', 0)};

  .card-title {
    margin-right: 4px;
    display: flex;
    align-items: center;
    font-size: 13px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
`

export const CardContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  padding-bottom: 2px;
`

export const AddressInput = styled(Input)<{ isError?: boolean }>`
  background: ${palette('background', 1)};
  font-size: 24px;

  &.ant-input {
    color: ${({ isError = false }) =>
      isError ? palette('error', 0) : palette('text', 0)};
    border: none;
    padding: 0;
    &:focus {
      outline: none;
      border: none;
      box-shadow: none;
    }
  }
  &.ant-input.ant-input-disabled {
    background-color: ${palette('background', 1)};
    color: ${({ isError = false }) =>
      isError ? palette('error', 0) : palette('text', 0)};
  }
`

export const ActionWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  button {
    margin-left: 0;
  }

  svg {
    color: ${palette('text', 0)};
    cursor: pointer;
    font-size: 14px;
  }
`

export const ToolWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 4px;
  height: 32px;
  border-radius: 0.5rem;

  cursor: ponter;

  &:hover {
    cursor: pointer;
    outline: none;
    background-color: ${palette('background', 2)};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`
