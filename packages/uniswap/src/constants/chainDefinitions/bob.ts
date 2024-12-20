import { defineChain } from 'viem'
import { chainConfig } from 'viem/op-stack'

// Latest viem has this chain, however, newer package version clashes with current setup
// For this reason this and future chains could be defined in this folder.
export const bob = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 60_808,
  name: 'BOB',
  network: 'bob',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://rpc.gobob.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'BOB Explorer',
      url: 'https://explorer.gobob.xyz',
    },
  },
  testnet: false,
  contracts: {
    multicall3: {
      address: '0xF9cda624FBC7e059355ce98a31693d299FACd963',
    },
  },
})
