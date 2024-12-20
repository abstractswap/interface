import { Currency, Token } from '@uniswap/sdk-core'
import tokenLogoLookup from 'constants/tokenLogoLookup'
import { getNativeLogoURI } from 'lib/hooks/useCurrencyLogoURIs'
import uriToHttp from 'lib/utils/uriToHttp'
import { useCallback, useMemo, useReducer } from 'react'

const BAD_SRCS: { [tokenAddress: string]: true } = {}

// Converts uri's into fetchable urls
function parseLogoSources(uris: string[]) {
  const urls: string[] = []
  uris.forEach((uri) => urls.push(...uriToHttp(uri)))
  return urls
}

// Parses uri's, favors non-coingecko images, and improves coingecko logo quality
function prioritizeLogoSources(uris: string[]) {
  const parsedUris = uris.map((uri) => uriToHttp(uri)).flat(1)
  const preferredUris: string[] = []

  // Consolidate duplicate coingecko urls into one fallback source
  let coingeckoUrl: string | undefined = undefined

  parsedUris.forEach((uri) => {
    if (uri.startsWith('https://assets.coingecko')) {
      if (!coingeckoUrl) {
        coingeckoUrl = uri.replace(/\/small\/|\/thumb\//g, '/large/')
      }
    } else {
      preferredUris.push(uri)
    }
  })
  // Places coingecko urls in the back of the source array
  return coingeckoUrl ? [...preferredUris, coingeckoUrl] : preferredUris
}

function getInitialUrl(
  address?: string | null,
  chainId?: number | null,
  isNative?: boolean,
  backupImg?: string | null,
) {
  if (chainId && isNative) {
    return getNativeLogoURI(chainId)
  } else {
    return backupImg
  }
}

export default function useAssetLogoSource(currency?: Currency | null): [string | undefined, (() => void) | undefined] {
  const address = currency instanceof Token ? currency?.address : undefined
  const chainId = currency?.chainId

  const [srcIndex, incrementSrcIndex] = useReducer((n: number) => n + 1, 0)

  const current = useMemo(() => {
    // if (primaryImg && !BAD_SRCS[primaryImg] && !isNative) {return primaryImg}

    const initialUrl = getInitialUrl(address, chainId, false)
    if (initialUrl && !BAD_SRCS[initialUrl]) {
      return initialUrl
    }

    const uris = tokenLogoLookup.getIcons(address, chainId) ?? []
    const fallbackSrcs = prioritizeLogoSources(parseLogoSources(uris))
    return fallbackSrcs.find((src) => !BAD_SRCS[src])
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rerun when src index changes, denoting a bad src was marked
  }, [address, chainId, srcIndex])

  const nextSrc = useCallback(() => {
    if (current) {
      BAD_SRCS[current] = true
    }
    incrementSrcIndex()
  }, [current])

  return [current, nextSrc]
}
