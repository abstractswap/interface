import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, concat } from '@apollo/client'
import { AllV3TicksQuery } from 'graphql/thegraph/queriesLegacy'
import store from 'state/index'
import { UniverseChainId } from 'uniswap/src/types/chains'

export type Ticks = AllV3TicksQuery['ticks']
export type TickData = Ticks[number]

const CHAIN_SUBGRAPH_URL: Record<number, string> = {
  [UniverseChainId.AbstractTestnet]: 'https://graph-node.internal.reservoir.tools/subgraphs/name/absctract-subgraph',
}

const httpLink = new HttpLink({ uri: CHAIN_SUBGRAPH_URL[UniverseChainId.AbstractTestnet] })

// This middleware will allow us to dynamically update the uri for the requests based off chainId
// For more information: https://www.apollographql.com/docs/react/networking/advanced-http-networking/
const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  const chainId = store.getState().application.chainId

  operation.setContext(() => ({
    uri: chainId && (CHAIN_SUBGRAPH_URL[chainId] ?? CHAIN_SUBGRAPH_URL[UniverseChainId.AbstractTestnet]),
  }))

  return forward(operation)
})

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: concat(authMiddleware, httpLink),
})

// export const chainToApolloClient: Record<number, ApolloClient<NormalizedCacheObject>> = {
//   [UniverseChainId.AbstractTestnet]: new ApolloClient({
//     cache: new InMemoryCache(),
//     uri: CHAIN_SUBGRAPH_URL[UniverseChainId.AbstractTestnet],
//   }),
// }
