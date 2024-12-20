import { Currency } from '@uniswap/sdk-core'
import { CurrencyListRow, CurrencyListSectionTitle } from 'components/SearchModal/CurrencyList'
import { CurrencySearchFilters } from 'components/SearchModal/DeprecatedCurrencySearch'
import { useDefaultActiveTokens } from 'hooks/Tokens'
import { useTokenListToken } from 'hooks/TokensLegacy'
import { useTokenBalances } from 'hooks/useTokenBalances'
import { getTokenFilter } from 'lib/hooks/useTokenList/filtering'
import { getSortedPortfolioTokens } from 'lib/hooks/useTokenList/sorting'
import { useMemo } from 'react'
import { useUserAddedTokens } from 'state/user/userAddedTokens'
import { UserAddedToken } from 'types/tokens'

import { useSwapAndLimitContext } from 'state/swap/useSwapContext'

interface CurrencySearchParams {
  searchQuery?: string
  filters?: CurrencySearchFilters
  selectedCurrency?: Currency | null
  otherSelectedCurrency?: Currency | null
}

interface CurrencySearchResults {
  searchCurrency?: Currency | null
  allCurrencyRows: CurrencyListRow[]
  loading: boolean
}

const currencyListRowMapper = (currency: Currency) => new CurrencyListRow(currency)
const searchResultsCurrencyListMapper = (currency: Currency) => new CurrencyListRow(currency, { showAddress: true })

function isEmpty(query: string | undefined): query is undefined {
  return !query || query.length === 0
}

export function useCurrencySearchResultsLegacy({
  searchQuery,
  filters,
  selectedCurrency,
  otherSelectedCurrency,
}: CurrencySearchParams): CurrencySearchResults {
  const { chainId } = useSwapAndLimitContext()

  const gqlTokenListsEnabled = false

  const { balanceMap, balanceList, loading: balancesLoading } = useTokenBalances()

  /**
   * Token-list based results.
   */

  // Queries for a single token directly by address, if the query is an address.
  const searchToken = useTokenListToken(searchQuery)
  const defaultAndUserAddedTokens = useDefaultActiveTokens(chainId)
  const userAddedTokens = useUserAddedTokens()

  const gqlSearchResultsEmpty = true
  const gqlPopularTokensEmpty = true

  /**
   * Results processing: sorting, filtering, and merging data sources into the final list.
   */
  const { sortedCombinedTokens, portfolioTokens, sortedTokensWithoutPortfolio } = useMemo(() => {
    const fullBaseList = (() => {
      if (
        !gqlTokenListsEnabled ||
        (!isEmpty(searchQuery) && gqlSearchResultsEmpty) ||
        (isEmpty(searchQuery) && gqlPopularTokensEmpty)
      ) {
        return Object.values(defaultAndUserAddedTokens)
      } else if (!isEmpty(searchQuery)) {
        return [...userAddedTokens.filter(getTokenFilter(searchQuery))]
      } else {
        return [...userAddedTokens]
      }
    })()

    // If we're using gql token lists and there's a search query, we don't need to
    // filter because the backend already does it for us.
    if (gqlTokenListsEnabled && !isEmpty(searchQuery) && !gqlSearchResultsEmpty) {
      return {
        sortedCombinedTokens: fullBaseList,
        portfolioTokens: [],
        sortedTokensWithoutPortfolio: fullBaseList,
      }
    }

    const filteredListTokens = fullBaseList.filter((token) => {
      return token.symbol !== 'ETH'
    })

    const portfolioTokens = getSortedPortfolioTokens(balanceList, balanceMap, chainId, {
      hideSmallBalances: false,
      hideSpam: true,
    })
    const mergedTokens = [...(portfolioTokens ?? []), ...filteredListTokens]

    // This is where we apply extra filtering based on the callsite's
    // customization, on top of the basic searchQuery filtering.
    const currencyFilter = (currency: Currency) => {
      if (filters?.onlyShowCurrenciesWithBalance) {
        if (currency.isNative) {
          return balanceMap[currency.symbol ?? 'ETH']?.usdValue > 0
        }

        return balanceMap[currency.address?.toLowerCase()]?.usdValue > 0
      }

      if (currency.isNative && filters?.disableNonToken) {
        return false
      }

      // If there is no query, filter out unselected user-added tokens with no balance.
      if (isEmpty(searchQuery) && currency instanceof UserAddedToken) {
        if (selectedCurrency?.equals(currency) || otherSelectedCurrency?.equals(currency)) {
          return true
        }
        return balanceMap[currency.address.toLowerCase()]?.usdValue > 0
      }

      return true
    }

    const sortedCombinedTokens =
      !isEmpty(searchQuery) && (!gqlTokenListsEnabled || gqlSearchResultsEmpty)
        ? mergedTokens.filter(getTokenFilter(searchQuery))
        : mergedTokens

    return {
      sortedCombinedTokens: sortedCombinedTokens.filter(currencyFilter),
      sortedTokensWithoutPortfolio: filteredListTokens.filter(currencyFilter),
      portfolioTokens: portfolioTokens.filter(currencyFilter),
    }
  }, [
    gqlTokenListsEnabled,
    searchQuery,
    gqlSearchResultsEmpty,
    balanceList,
    balanceMap,
    chainId,
    gqlPopularTokensEmpty,
    defaultAndUserAddedTokens,
    userAddedTokens,
    filters?.onlyShowCurrenciesWithBalance,
    filters?.disableNonToken,
    selectedCurrency,
    otherSelectedCurrency,
  ])

  const finalCurrencyList: CurrencyListRow[] = useMemo(() => {
    // If we're using gql token lists, we don't want to show tokens from token lists.
    if (!isEmpty(searchQuery) || portfolioTokens.length === 0) {
      return [
        new CurrencyListSectionTitle(searchQuery ? `Search results` : `Popular tokens`),
        ...sortedCombinedTokens.map(searchQuery ? searchResultsCurrencyListMapper : currencyListRowMapper),
      ]
    } else if (sortedTokensWithoutPortfolio.length === 0) {
      return [new CurrencyListSectionTitle(`Your tokens`), ...portfolioTokens.map(currencyListRowMapper)]
    } else {
      return [
        new CurrencyListSectionTitle(`Your tokens`),
        ...portfolioTokens.map(currencyListRowMapper),
        new CurrencyListSectionTitle(`Popular tokens`),
        ...sortedTokensWithoutPortfolio.map(currencyListRowMapper),
      ]
    }
  }, [searchQuery, portfolioTokens, sortedTokensWithoutPortfolio, sortedCombinedTokens])

  return {
    loading: balancesLoading,
    searchCurrency: searchToken,
    allCurrencyRows: finalCurrencyList,
  }
}
