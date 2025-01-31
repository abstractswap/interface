import { defineChain } from 'viem'
import { chainConfig } from 'viem/op-stack'

// Latest viem has this chain, however, newer package version clashes with current setup
// For this reason this and future chains could be defined in this folder.
export const animeTestnet = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 6900,
  name: 'Anime Testnet',
  network: 'anime-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: [''] }, // WIP
  },
  blockExplorers: {
    default: {
      name: 'Animechain Testnet Explorer',
      url: 'https://testnet-explorer.anime.xyz',
    },
  },
  testnet: false,
  contracts: {
    multicall3: {
      address: '0xF9cda624FBC7e059355ce98a31693d299FACd963',
    },
  },
})
