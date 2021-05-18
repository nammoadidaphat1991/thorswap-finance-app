import React, { useEffect } from 'react'

import { Link } from 'react-router-dom'

import { PanelView, FancyButton, Label } from 'components'
import { Asset, SupportedChain } from 'multichain-sdk'

import { ChainMemberPoolCard } from 'components/ChainMemberPoolCard'

import { useMidgard } from 'redux/midgard/hooks'
import { useWallet } from 'redux/wallet/hooks'

import { getAddLiquidityRoute } from 'settings/constants'

import * as Styled from './Liquidity.style'

const LiquidityView = () => {
  const {
    chainMemberDetails,
    chainMemberDetailsLoading,
    getAllMemberDetails,
  } = useMidgard()
  const { account } = useWallet()

  useEffect(() => {
    getAllMemberDetails()
  }, [getAllMemberDetails])

  return (
    <PanelView meta="Liquidity" poolAsset={Asset.BTC()} type="liquidity">
      {!account && <Label>Please connect wallet.</Label>}
      {account && (
        <>
          <Styled.ToolContainer>
            <Link to={getAddLiquidityRoute(Asset.BTC())}>
              <FancyButton>Add Liquidity</FancyButton>
            </Link>
          </Styled.ToolContainer>
          {Object.keys(chainMemberDetails).map((chain) => (
            <ChainMemberPoolCard
              key={chain}
              chain={chain as SupportedChain}
              data={chainMemberDetails[chain]}
              loading={chainMemberDetailsLoading?.[chain] ?? false}
            />
          ))}
        </>
      )}
    </PanelView>
  )
}

export default LiquidityView
