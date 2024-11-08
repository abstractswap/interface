import { SwapWidget, useRelayClient } from '@reservoir0x/relay-kit-ui'
import { InterfacePageName } from '@uniswap/analytics-events'
import { Currency } from '@uniswap/sdk-core'
import { useAccountDrawer } from 'components/AccountDrawer/MiniPortfolio/hooks'
import { NetworkAlert } from 'components/NetworkAlert/NetworkAlert'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { wagmiConfig } from 'components/Web3Provider/wagmi'
import SwapHeader from 'components/swap/SwapHeader'
import { Field } from 'components/swap/constants'
import { PageWrapper, SwapWrapper } from 'components/swap/styled'
import { useScreenSize } from 'hooks/screenSize'
import { BuyForm } from 'pages/Swap/Buy/BuyForm'
import { LimitFormWrapper } from 'pages/Swap/Limit/LimitForm'
import { SendForm } from 'pages/Swap/Send/SendForm'
import { SwapForm } from 'pages/Swap/SwapForm'
import { ReactNode } from 'react'
import { InterfaceTrade, TradeState } from 'state/routing/types'
import { isPreviewTrade } from 'state/routing/utils'
import { SwapAndLimitContextProvider, SwapContextProvider } from 'state/swap/SwapContext'
import { CurrencyState, SwapAndLimitContext } from 'state/swap/types'
import { useSwapAndLimitContext } from 'state/swap/useSwapContext'
import { useIsDarkMode } from 'theme/components/ThemeToggle'
import { Flex } from 'ui/src'
import { FeatureFlags } from 'uniswap/src/features/gating/flags'
import { useFeatureFlag } from 'uniswap/src/features/gating/hooks'
import Trace from 'uniswap/src/features/telemetry/Trace'
import { InterfaceChainId } from 'uniswap/src/types/chains'
import { SwapTab } from 'uniswap/src/types/screens/interface'

export function getIsReviewableQuote(
  trade: InterfaceTrade | undefined,
  tradeState: TradeState,
  swapInputError?: ReactNode,
): boolean {
  if (swapInputError) {
    return false
  }
  // if the current quote is a preview quote, allow the user to progress to the Swap review screen
  if (isPreviewTrade(trade)) {
    return true
  }

  return Boolean(trade && tradeState === TradeState.VALID)
}

export default function SwapPage() {
  const accountDrawer = useAccountDrawer()
  const { chainId: contextChainId } = useSwapAndLimitContext()
  const chainId = contextChainId ?? wagmiConfig?.chains[0]?.id
  const client = useRelayClient()
  const chain = client?.chains?.find((chain) => chain.id === contextChainId)

  return (
    <Trace logImpression page={InterfacePageName.SWAP_PAGE}>
      <PageWrapper>
        <SwapWidget
          key={`relay-swap-widget-${chainId}-${chain?.currency?.id}`}
          singleChainMode={true}
          lockChainId={chainId}
          defaultFromToken={
            chain?.currency
              ? {
                  ...chain?.currency,
                  chainId,
                  address: chain?.currency?.address ?? '',
                  decimals: chain?.currency?.decimals ?? 18,
                  name: chain?.currency?.name ?? '',
                  symbol: chain?.currency?.symbol ?? '',
                  logoURI: `https://assets.relay.link/icons/currencies/${chain?.currency?.id ?? 'eth'}.png`,
                }
              : {
                  chainId,
                  address: '0x0000000000000000000000000000000000000000',
                  decimals: 18,
                  name: 'Ether',
                  symbol: 'ETH',
                  logoURI: 'https://assets.relay.link/icons/1/light.png',
                }
          }
          onConnectWallet={() => {
            accountDrawer.open()
          }}
        />
      </PageWrapper>
      {location.pathname === '/swap' && <SwitchLocaleLink />}
    </Trace>
  )
}

/**
 * The swap component displays the swap interface, manages state for the swap, and triggers onchain swaps.
 *
 * In most cases, chainId should refer to the connected chain, i.e. `useAccount().chainId`.
 * However if this component is being used in a context that displays information from a different, unconnected
 * chain (e.g. the TDP), then chainId should refer to the unconnected chain.
 */
export function Swap({
  className,
  initialInputCurrency,
  initialOutputCurrency,
  initialTypedValue,
  initialIndependentField,
  initialCurrencyLoading = false,
  chainId,
  hideHeader = false,
  onCurrencyChange,
  multichainUXEnabled = false,
  disableTokenInputs = false,
  compact = false,
  syncTabToUrl,
}: {
  className?: string
  chainId?: InterfaceChainId
  onCurrencyChange?: (selected: CurrencyState) => void
  disableTokenInputs?: boolean
  initialInputCurrency?: Currency
  initialOutputCurrency?: Currency
  initialTypedValue?: string
  initialIndependentField?: Field
  initialCurrencyLoading?: boolean
  compact?: boolean
  syncTabToUrl: boolean
  multichainUXEnabled?: boolean
  hideHeader?: boolean
}) {
  const isDark = useIsDarkMode()
  const screenSize = useScreenSize()
  const forAggregatorEnabled = useFeatureFlag(FeatureFlags.ForAggregator)

  return (
    <SwapAndLimitContextProvider
      initialChainId={chainId}
      initialInputCurrency={initialInputCurrency}
      initialOutputCurrency={initialOutputCurrency}
      multichainUXEnabled={multichainUXEnabled}
    >
      {/* TODO: Move SwapContextProvider inside Swap tab ONLY after SwapHeader removes references to trade / autoSlippage */}
      <SwapAndLimitContext.Consumer>
        {({ currentTab }) => (
          <SwapContextProvider
            initialTypedValue={initialTypedValue}
            initialIndependentField={initialIndependentField}
            multichainUXEnabled={multichainUXEnabled}
          >
            <Flex width="100%">
              <SwapWrapper isDark={isDark} className={className} id="swap-page">
                {!hideHeader && <SwapHeader compact={compact || !screenSize.sm} syncTabToUrl={syncTabToUrl} />}
                {currentTab === SwapTab.Swap && (
                  <SwapForm
                    onCurrencyChange={onCurrencyChange}
                    initialCurrencyLoading={initialCurrencyLoading}
                    disableTokenInputs={disableTokenInputs}
                  />
                )}
                {currentTab === SwapTab.Limit && <LimitFormWrapper onCurrencyChange={onCurrencyChange} />}
                {currentTab === SwapTab.Send && (
                  <SendForm disableTokenInputs={disableTokenInputs} onCurrencyChange={onCurrencyChange} />
                )}
                {currentTab === SwapTab.Buy && forAggregatorEnabled && <BuyForm disabled={disableTokenInputs} />}
              </SwapWrapper>
              <NetworkAlert />
            </Flex>
          </SwapContextProvider>
        )}
      </SwapAndLimitContext.Consumer>
    </SwapAndLimitContextProvider>
  )
}
