import { gql } from '@apollo/client'

export type FeeTierDistributionQuery = {
  __typename?: 'Query'
  _meta?: { __typename?: '_Meta_'; block: { __typename?: '_Block_'; number: number } }
  asToken0: Array<{ __typename?: 'Pool'; feeTier: any; totalValueLockedToken0: any; totalValueLockedToken1: any }>
  asToken1: Array<{ __typename?: 'Pool'; feeTier: any; totalValueLockedToken0: any; totalValueLockedToken1: any }>
}
export type AllV3TicksQuery = {
  __typename?: 'Query'
  ticks: Array<{ __typename?: 'Tick'; liquidityNet: any; price0: any; price1: any; tick: any }>
}

export const FeeTierDistributionDocument = gql`
  query FeeTierDistribution($token0: String!, $token1: String!) {
    _meta {
      block {
        number
      }
    }
    asToken0: pools(
      orderBy: totalValueLockedToken0
      orderDirection: desc
      where: { token0: $token0, token1: $token1 }
    ) {
      feeTier
      totalValueLockedToken0
      totalValueLockedToken1
    }
    asToken1: pools(
      orderBy: totalValueLockedToken0
      orderDirection: desc
      where: { token0: $token1, token1: $token0 }
    ) {
      feeTier
      totalValueLockedToken0
      totalValueLockedToken1
    }
  }
`

export const AllV3TicksDocument = gql`
  query AllV3Ticks($poolAddress: String, $skip: Int!) {
    ticks(first: 1000, skip: $skip, where: { poolAddress: $poolAddress }, orderBy: tickIdx) {
      tick: tickIdx
      liquidityNet
      price0
      price1
    }
  }
`
