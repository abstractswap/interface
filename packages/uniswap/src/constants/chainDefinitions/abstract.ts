import { defineChain } from 'viem'
import { chainConfig } from 'viem/zksync'

// Latest viem has this chain, however, newer package version clashes with current setup
// For this reason this and future chains could be defined in this folder.
export const abstractTestnet = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 11_124,
  name: 'Abstract Testnet',
  network: 'abstract',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://api.testnet.abs.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'Abstract Block Explorer',
      url: 'https://explorer.testnet.abs.xyz',
    },
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: '0xF9cda624FBC7e059355ce98a31693d299FACd963',
    },
  },
})
