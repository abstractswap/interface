import { ApolloError, useQuery } from '@apollo/client'
import { apolloClient } from 'graphql/thegraph/apolloLegacy'
import { AllV3TicksDocument, AllV3TicksQuery } from 'graphql/thegraph/queriesLegacy'
import { useMemo } from 'react'

export default function useAllV3TicksQuery(
  poolAddress: string | undefined,
  pollInterval: number,
  skip: boolean,
  skipNumber: number,
): { error?: ApolloError; isLoading: boolean; data: AllV3TicksQuery } {
  const {
    data,
    loading: isLoading,
    error,
  } = useQuery(AllV3TicksDocument, {
    variables: { poolAddress: poolAddress?.toLowerCase(), skip: skipNumber },
    pollInterval,
    client: apolloClient,
    skip,
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
