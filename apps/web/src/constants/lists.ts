// Testnets
const ABSTRACT_LIST = 'https://api.testnets.relay.link/tokenlist?chainId=11124'
const REDSTONE_GARNET_LIST = 'https://api.testnets.relay.link/tokenlist?chainId=17069'

// For faster load using URL with specified chainID param
const ZERO_LIST = 'https://api.relay.link/tokenlist?chainId=543210'
const CYBER_LIST = 'https://api.relay.link/tokenlist?chainId=7560'
const BOB_LIST = 'https://api.relay.link/tokenlist?chainId=60808'
const SHAPE_LIST = 'https://api.relay.link/tokenlist?chainId=360'
const INK_LIST = 'https://api.relay.link/tokenlist?chainId=57073'
const REDSTONE_LIST = 'https://api.relay.link/tokenlist?chainId=690'

export const DEFAULT_INACTIVE_LIST_URLS: string[] = []
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [
  ABSTRACT_LIST,
  ZERO_LIST,
  CYBER_LIST,
  BOB_LIST,
  SHAPE_LIST,
  INK_LIST,
  REDSTONE_LIST,
  REDSTONE_GARNET_LIST,
]
export const DEFAULT_LIST_OF_LISTS: string[] = [...DEFAULT_ACTIVE_LIST_URLS]
