import { SUPPORTED_V2POOL_CHAIN_IDS } from 'constants/chains'
import { useAccount } from 'hooks/useAccount'
// import { FeatureFlags } from 'uniswap/src/features/gating/flags'
// import { useFeatureFlag } from 'uniswap/src/features/gating/hooks'
import { UniverseChainId } from 'uniswap/src/types/chains'

const V2_SUPPORTED_NETWORKS = [UniverseChainId.AbstractTestnet]

export function useNetworkSupportsV2() {
  const { chainId } = useAccount()
  // const isV2EverywhereEnabled = useFeatureFlag(FeatureFlags.V2Everywhere)
  const isV2Enabled = chainId && V2_SUPPORTED_NETWORKS.includes(chainId)

  return chainId && isV2Enabled && SUPPORTED_V2POOL_CHAIN_IDS.includes(chainId)
}
