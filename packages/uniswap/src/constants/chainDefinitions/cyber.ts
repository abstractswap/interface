import { defineChain } from 'viem'
import { chainConfig } from 'viem/op-stack'

// Latest viem has this chain, however, newer package version clashes with current setup
// For this reason this and future chains could be defined in this folder.
export const cyber = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 7560,
  name: 'Cyber',
  network: 'cyber',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://cyber.alt.technology'] },
  },
  blockExplorers: {
    default: {
      name: 'Cyber Scan',
      url: 'https://cyberscan.co',
    },
  },
  testnet: false,
  contracts: {
    multicall3: {
      address: '0xF9cda624FBC7e059355ce98a31693d299FACd963',
    },
  },
})
