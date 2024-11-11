import { showTestnetsAtom } from 'components/AccountDrawer/TestnetsToggle'
import { ChainLogo } from 'components/Logo/ChainLogo'
import ChainSelectorRow from 'components/NavBar/ChainSelector/ChainSelectorRow'
import { NavDropdown } from 'components/NavBar/NavDropdown/NavDropdown'
import { CONNECTION } from 'components/Web3Provider/constants'
import {
  ALL_CHAIN_IDS,
  CHAIN_IDS_TO_NAMES,
  TESTNET_CHAIN_IDS,
  getChain,
  getChainPriority,
  useIsSupportedChainIdCallback,
} from 'constants/chains'
import { useScreenSize } from 'hooks/screenSize'
import { useAccount } from 'hooks/useAccount'
import useSelectChain from 'hooks/useSelectChain'
import { useAtomValue } from 'jotai/utils'
import styled, { useTheme } from 'lib/styled-components'
import { useCallback, useMemo, useRef, useState } from 'react'
import { AlertTriangle, ChevronDown } from 'react-feather'
import { useSearchParams } from 'react-router-dom'
import { useSwapAndLimitContext } from 'state/swap/useSwapContext'
import { Flex, Popover, Text } from 'ui/src'
import { NetworkFilter } from 'uniswap/src/components/network/NetworkFilter'
import { FeatureFlags } from 'uniswap/src/features/gating/flags'
import { useFeatureFlag } from 'uniswap/src/features/gating/hooks'
import { InterfaceChainId, UniverseChainId } from 'uniswap/src/types/chains'
import { Connector } from 'wagmi'

type WalletConnectConnector = Connector & {
  type: typeof CONNECTION.UNISWAP_WALLET_CONNECT_CONNECTOR_ID
  getNamespaceChainsIds: () => InterfaceChainId[]
}

const DropdownChevron = styled(ChevronDown)<{ isOpen: boolean }>`
  height: 20px;
  width: 20px;
  color: ${({ theme }) => theme.neutral2};
  transform: ${({ isOpen }) => isOpen && 'rotate(180deg)'};
  transition: ${({
    theme: {
      transition: { duration, timing },
    },
  }) => `transform ${duration.fast} ${timing.ease}`};
`

const TriggerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 12px;

  &:hover {
    background-color: ${({ theme }) => theme.surface2};
  }
`

function useWalletSupportedChains(): InterfaceChainId[] {
  const { connector } = useAccount()

  switch (connector?.type) {
    case CONNECTION.UNISWAP_WALLET_CONNECT_CONNECTOR_ID:
    case CONNECTION.WALLET_CONNECT_CONNECTOR_ID:
      // Wagmi currently offers no way to discriminate a Connector as a WalletConnect connector providing access to getNamespaceChainsIds.
      return (connector as WalletConnectConnector).getNamespaceChainsIds?.().length
        ? (connector as WalletConnectConnector).getNamespaceChainsIds?.()
        : ALL_CHAIN_IDS
    default:
      return ALL_CHAIN_IDS
  }
}

type ChainSelectorProps = {
  hideArrow?: boolean
}
export const ChainSelector = ({ hideArrow }: ChainSelectorProps) => {
  const account = useAccount()
  const { chainId, setSelectedChainId, multichainUXEnabled } = useSwapAndLimitContext()
  // multichainFlagEnabled is different from multichainUXEnabled, multichainUXEnabled applies to swap
  // flag can be true but multichainUXEnabled can be false (TDP page)
  const multichainFlagEnabled = useFeatureFlag(FeatureFlags.MultichainUX)

  const isSmallScreen = !useScreenSize()['sm']
  const chain = getChain({ chainId })
  const theme = useTheme()
  const popoverRef = useRef<Popover>(null)
  const walletSupportsChain = useWalletSupportedChains()
  const isSupportedChain = useIsSupportedChainIdCallback()
  const showTestnets = useAtomValue(showTestnetsAtom)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const selectChain = useSelectChain()
  const [searchParams, setSearchParams] = useSearchParams()

  const [supportedChains, unsupportedChains] = useMemo(() => {
    const { supported, unsupported } = ALL_CHAIN_IDS.filter((chain: number) => {
      return isSupportedChain(chain) && (showTestnets || !TESTNET_CHAIN_IDS.includes(chain))
    })
      .sort((a, b) => getChainPriority(a) - getChainPriority(b))
      .reduce(
        (acc, chain) => {
          if (walletSupportsChain.includes(chain)) {
            acc.supported.push(chain)
          } else {
            acc.unsupported.push(chain)
          }
          return acc
        },
        { supported: [], unsupported: [] } as Record<string, InterfaceChainId[]>,
      )
    return [supported, unsupported]
  }, [isSupportedChain, showTestnets, walletSupportsChain])

  const [pendingChainId, setPendingChainId] = useState<InterfaceChainId | undefined>(undefined)

  const onSelectChain = useCallback(
    async (targetChainId: UniverseChainId | null) => {
      if (multichainUXEnabled || !targetChainId) {
        setSelectedChainId(targetChainId)
      } else {
        setPendingChainId(targetChainId)
        await selectChain(targetChainId)
        setPendingChainId(undefined)
      }
      searchParams.delete('inputCurrency')
      searchParams.delete('outputCurrency')
      searchParams.delete('value')
      searchParams.delete('field')
      targetChainId && searchParams.set('chain', CHAIN_IDS_TO_NAMES[targetChainId])
      setSearchParams(searchParams)

      setIsOpen(false)
      popoverRef.current?.close()
    },
    [multichainUXEnabled, setSelectedChainId, selectChain, searchParams, setSearchParams],
  )

  const isUnsupportedConnectedChain = account.isConnected && !isSupportedChain(account.chainId)

  if (multichainFlagEnabled) {
    return (
      <Flex px={8}>
        <NetworkFilter
          selectedChain={chainId ?? null}
          onPressChain={onSelectChain}
          showUnsupportedConnectedChainWarning={isUnsupportedConnectedChain}
          hideArrow={hideArrow}
          styles={{
            sticky: true,
          }}
        />
      </Flex>
    )
  }

  const menuLabel =
    isUnsupportedConnectedChain || !chainId ? (
      <AlertTriangle size={20} color={theme.neutral2} />
    ) : (
      <ChainLogo chainId={chainId} size={20} testId="chain-selector-logo" />
    )

  return (
    <Popover ref={popoverRef} placement="bottom" stayInFrame allowFlip onOpenChange={setIsOpen}>
      <Popover.Trigger padding={8} cursor="pointer" data-testid="chain-selector">
        <TriggerContainer>
          {menuLabel}
          {chain && !isSmallScreen && <Text>{chain.label}</Text>}
          <DropdownChevron isOpen={isOpen} />
        </TriggerContainer>
      </Popover.Trigger>
      <NavDropdown width={240} isOpen={isOpen}>
        <Flex p="$spacing8" data-testid="chain-selector-options">
          {supportedChains.map((selectorChain) => (
            <ChainSelectorRow
              disabled={!walletSupportsChain.includes(selectorChain)}
              onSelectChain={onSelectChain}
              targetChain={selectorChain}
              key={selectorChain}
              isPending={selectorChain === pendingChainId}
            />
          ))}
          {unsupportedChains.map((selectorChain) => (
            <ChainSelectorRow disabled targetChain={selectorChain} key={selectorChain} isPending={false} />
          ))}
        </Flex>
      </NavDropdown>
    </Popover>
  )
}
