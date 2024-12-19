import { defineChain } from 'viem'
import { chainConfig } from 'viem/zksync'

// Latest viem has this chain, however, newer package version clashes with current setup
// For this reason this and future chains could be defined in this folder.
export const ink = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 57073,
  name: 'Ink',
  network: 'ink',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: [''] }, // Temporary
  },
  blockExplorers: {
    default: {
      name: 'Ink Scan',
      url: '', // Temporary
    },
  },
  testnet: false,
  contracts: {
    multicall3: {
      address: '0xF9cda624FBC7e059355ce98a31693d299FACd963',
    },
  },
})
