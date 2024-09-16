import { NEVER_RELOAD } from '@uniswap/redux-multicall'
import { Currency, Token } from '@uniswap/sdk-core'
import { UNKNOWN_TOKEN_NAME, UNKNOWN_TOKEN_SYMBOL } from 'constants/tokens'
import { arrayify, parseBytes32String } from 'ethers/lib/utils'
import { useDefaultActiveTokens } from 'hooks/Tokens'
import { useAccount } from 'hooks/useAccount'
import { useBytes32TokenContract, useTokenContract } from 'hooks/useContract'
import { useSingleCallResult } from 'lib/hooks/multicall'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { useMemo } from 'react'
import { useAppSelector } from 'state/hooks'
import { UniverseChainId } from 'uniswap/src/types/chains'
import { deserializeToken } from 'uniswap/src/utils/currency'
import { isAddress } from 'utilities/src/addresses'
import { DEFAULT_ERC20_DECIMALS } from 'utilities/src/tokens/constants'

/**
 * Returns a Currency from the currencyId.
 * Returns null if currency is loading or null was passed.
 * Returns undefined if currencyId is invalid or token does not exist.
 */
function useCurrencyFromMap(
  tokens: TokenMap,
  chainId: UniverseChainId | undefined,
  currencyId?: string | null,
): Currency | undefined {
  const nativeCurrency = useNativeCurrency(chainId)
  const isNative = Boolean(nativeCurrency && currencyId?.toUpperCase() === 'ETH')

  const token = useTokenFromMapOrNetwork(tokens, isNative ? undefined : currencyId)

  if (currencyId === null || currencyId === undefined) {
    return
  }

  // this case so we use our builtin wrapped token instead of wrapped tokens on token lists
  const wrappedNative = nativeCurrency?.wrapped
  if (wrappedNative?.address?.toUpperCase() === currencyId?.toUpperCase()) {
    return wrappedNative
  }
  return isNative ? nativeCurrency : token
}

export function useTokenListCurrency(currencyId: Maybe<string>, chainId?: UniverseChainId): Currency | undefined {
  const { chainId: connectedChainId } = useAccount()
  const tokens = useDefaultActiveTokens(chainId ?? connectedChainId)
  return useCurrencyFromMap(tokens, chainId ?? connectedChainId, currencyId)
}

type TokenMap = { [address: string]: Token }

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/

function parseStringOrBytes32(str: string | undefined, bytes32: string | undefined, defaultValue: string): string {
  return str && str.length > 0
    ? str
    : // need to check for proper bytes string and valid terminator
      bytes32 && BYTES32_REGEX.test(bytes32) && arrayify(bytes32)[31] === 0
      ? parseBytes32String(bytes32)
      : defaultValue
}

/**
 * Returns a Token from the tokenAddress.
 * Returns null if token is loading or null was passed.
 * Returns undefined if tokenAddress is invalid or token does not exist.
 */
function useTokenFromActiveNetwork(tokenAddress: string | undefined): Token | null | undefined {
  const { chainId } = useAccount()

  const formattedAddress = isAddress(tokenAddress)
  const tokenContract = useTokenContract(formattedAddress ? formattedAddress : undefined, false)
  const tokenContractBytes32 = useBytes32TokenContract(formattedAddress ? formattedAddress : undefined, false)

  const tokenName = useSingleCallResult(tokenContract, 'name', undefined, NEVER_RELOAD)
  const tokenNameBytes32 = useSingleCallResult(tokenContractBytes32, 'name', undefined, NEVER_RELOAD)
  const symbol = useSingleCallResult(tokenContract, 'symbol', undefined, NEVER_RELOAD)
  const symbolBytes32 = useSingleCallResult(tokenContractBytes32, 'symbol', undefined, NEVER_RELOAD)
  const decimals = useSingleCallResult(tokenContract, 'decimals', undefined, NEVER_RELOAD)

  const isLoading = useMemo(
    () => decimals.loading || symbol.loading || tokenName.loading,
    [decimals.loading, symbol.loading, tokenName.loading],
  )
  const parsedDecimals = useMemo(() => decimals?.result?.[0] ?? DEFAULT_ERC20_DECIMALS, [decimals.result])

  const parsedSymbol = useMemo(
    () => parseStringOrBytes32(symbol.result?.[0], symbolBytes32.result?.[0], UNKNOWN_TOKEN_SYMBOL),
    [symbol.result, symbolBytes32.result],
  )
  const parsedName = useMemo(
    () => parseStringOrBytes32(tokenName.result?.[0], tokenNameBytes32.result?.[0], UNKNOWN_TOKEN_NAME),
    [tokenName.result, tokenNameBytes32.result],
  )

  return useMemo(() => {
    // If the token is on another chain, we cannot fetch it on-chain, and it is invalid.
    if (typeof tokenAddress !== 'string' || !formattedAddress) {
      return undefined
    }
    if (isLoading || !chainId) {
      return null
    }
    if (!decimals?.result?.[0] && parsedSymbol === UNKNOWN_TOKEN_SYMBOL && parsedName === UNKNOWN_TOKEN_NAME) {
      return undefined
    }

    return new Token(chainId, formattedAddress, parsedDecimals, parsedSymbol, parsedName)
  }, [tokenAddress, chainId, formattedAddress, isLoading, decimals?.result, parsedDecimals, parsedSymbol, parsedName])
}

/**
 * Returns a Token from the tokenAddress.
 * Returns null if token is loading or null was passed.
 * Returns undefined if tokenAddress is invalid or token does not exist.
 */
function useTokenFromMapOrNetwork(tokens: TokenMap, tokenAddress?: string | null): Token | undefined {
  const address = isAddress(tokenAddress)
  const token: Token | undefined = address ? tokens[address] : undefined
  const tokenFromNetwork = useTokenFromActiveNetwork(token ? undefined : address ? address : undefined)
  return tokenFromNetwork ?? token
}

export type ChainTokenMap = { [chainId in number]?: { [address in string]?: Token } }

/** Returns tokens from all token lists on all chains, combined with user added tokens */
export function useAllTokensMultichain(): ChainTokenMap {
  //TODO: add token list support
  // const allTokensFromLists : any[] = []
  const userAddedTokensMap = useAppSelector(({ user: { tokens } }) => tokens)

  return useMemo(() => {
    const chainTokenMap: ChainTokenMap = {}

    if (userAddedTokensMap) {
      Object.keys(userAddedTokensMap).forEach((key) => {
        const chainId = Number(key)
        const tokenMap = {} as { [address in string]?: Token }
        Object.values(userAddedTokensMap[chainId]).forEach((serializedToken) => {
          tokenMap[serializedToken.address] = deserializeToken(serializedToken)
        })
        chainTokenMap[chainId] = tokenMap
      })
    }

    // Object.keys(allTokensFromLists).forEach((key) => {
    //   const chainId = Number(key)
    //   const tokenMap = chainTokenMap[chainId] ?? {}
    //   Object.values(allTokensFromLists[chainId]).forEach(({ token }) => {
    //     tokenMap[token.address] = token
    //   })
    //   chainTokenMap[chainId] = tokenMap
    // })

    return chainTokenMap
  }, [userAddedTokensMap])
}
