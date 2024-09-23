import { ApolloError, useQuery } from '@apollo/client'
import { apolloClient } from 'graphql/thegraph/apolloLegacy'
import { FeeTierDistributionDocument, FeeTierDistributionQuery } from 'graphql/thegraph/queriesLegacy'
import { useMemo } from 'react'

export default function useFeeTierDistributionQuery(
  token0: string | undefined,
  token1: string | undefined,
  interval: number,
): { error?: ApolloError; isLoading: boolean; data: FeeTierDistributionQuery } {
  const {
    data,
    loading: isLoading,
    error,
  } = useQuery(FeeTierDistributionDocument, {
    variables: {
      token0: token0?.toLowerCase(),
      token1: token1?.toLowerCase(),
    },
    pollInterval: interval,
    client: apolloClient,
  })

  return useMemo(
    () => ({
      error,
      isLoading,
      data,
    }),
    [data, error, isLoading],
  )
}
