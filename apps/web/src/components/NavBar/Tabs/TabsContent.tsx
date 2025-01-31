import { CreditCardIcon } from 'components/Icons/CreditCard'
import { Limit } from 'components/Icons/Limit'
import { Send } from 'components/Icons/Send'
import { SwapV2 } from 'components/Icons/SwapV2'
import { MenuItem } from 'components/NavBar/CompanyMenu/Content'
import { useTabsVisible } from 'components/NavBar/ScreenSizes'
import forkConfig from 'forkConfig'
import { useTheme } from 'lib/styled-components'
import { useLocation } from 'react-router-dom'
import { useSwapAndLimitContext } from 'state/swap/useSwapContext'
import { UNIVERSE_CHAIN_INFO } from 'uniswap/src/constants/chains'
import { FeatureFlags } from 'uniswap/src/features/gating/flags'
import { useFeatureFlag } from 'uniswap/src/features/gating/hooks'
import { useTranslation } from 'uniswap/src/i18n'
import { UniverseChainId } from 'uniswap/src/types/chains'

export type TabsSection = {
  title: string
  href: string
  isActive?: boolean
  items?: TabsItem[]
  closeMenu?: () => void
}

export type TabsItem = MenuItem & {
  icon?: JSX.Element
  quickKey: string
}

export const useTabsContent = (props?: { includeNftsLink?: boolean }): TabsSection[] => {
  const { t } = useTranslation()
  const forAggregatorEnabled = useFeatureFlag(FeatureFlags.ForAggregator)
  const isMultichainExploreEnabled = useFeatureFlag(FeatureFlags.MultichainExplore)
  const { pathname } = useLocation()
  const theme = useTheme()
  const areTabsVisible = useTabsVisible()
  const { chainId: universeChainId } = useSwapAndLimitContext()
  const chainId = universeChainId ? universeChainId : UniverseChainId.Zero
  return [
    {
      title: t('common.trade'),
      href: '/swap',
      isActive: pathname.startsWith('/swap') || pathname.startsWith('/limit') || pathname.startsWith('/send'),
      items: [
        {
          label: t('common.swap'),
          icon: <SwapV2 fill={theme.neutral2} />,
          quickKey: 'U',
          href: '/swap',
          internal: true,
        },
        ...(forkConfig.uniSpecificFeaturesEnabled
          ? [
              {
                label: t('swap.limit'),
                icon: <Limit fill={theme.neutral2} />,
                quickKey: 'L',
                href: '/limit',
                internal: true,
              },
            ]
          : []),
        {
          label: t('common.send.button'),
          icon: <Send fill={theme.neutral2} />,
          quickKey: 'E',
          href: '/send',
          internal: true,
        },
        ...(forAggregatorEnabled && forkConfig.uniSpecificFeaturesEnabled
          ? [
              {
                label: t('common.buy.label'),
                icon: <CreditCardIcon fill={theme.neutral2} />,
                quickKey: 'B',
                href: '/buy',
                internal: true,
              },
            ]
          : []),
      ],
    },
    {
      title: t('common.explore'),
      href: `https://info.reservoir.tools/#/${UNIVERSE_CHAIN_INFO[(chainId as UniverseChainId) ?? UniverseChainId.AbstractTestnet].urlParam}`,
      isActive: pathname.startsWith('/explore') || pathname.startsWith('/nfts'),
      items: forkConfig.uniSpecificFeaturesEnabled
        ? [
            { label: t('common.tokens'), quickKey: 'T', href: '/explore/tokens', internal: true },
            { label: t('common.pools'), quickKey: 'P', href: '/explore/pools', internal: true },
            {
              label: t('common.transactions'),
              quickKey: 'X',
              href: `/explore/transactions${isMultichainExploreEnabled ? '/ethereum' : ''}`,
              internal: true,
            },
            ...(props?.includeNftsLink
              ? [{ label: t('common.nfts'), quickKey: 'N', href: '/nfts', internal: true }]
              : []),
          ]
        : [
            // {
            //   label: t('common.tokens'),
            //   quickKey: 'T',
            //   href: `${UNIVERSE_CHAIN_INFO[UniverseChainId.AbstractTestnet].infoLink}/tokens`,
            //   internal: false,
            // },
            // {
            //   label: t('common.pools'),
            //   quickKey: 'P',
            //   href: `${UNIVERSE_CHAIN_INFO[UniverseChainId.AbstractTestnet].infoLink}/pools`,
            //   internal: false,
            // },
            {
              label: 'V3 Analytics',
              quickKey: 'T',
              href: `https://info.reservoir.tools/#/${UNIVERSE_CHAIN_INFO[(chainId as UniverseChainId) ?? UniverseChainId.AbstractTestnet].urlParam}`,
              internal: false,
            },
            ...(![+UniverseChainId.BOB, UniverseChainId.REDSTONE, UniverseChainId.REDSTONE_GARNET].includes(+chainId!)
              ? [
                  {
                    label: 'V2 Analytics',
                    quickKey: 'P',
                    href: `https://v2-info-${UNIVERSE_CHAIN_INFO[chainId as UniverseChainId].urlParam.replace(/_/g, '-')}.reservoir.tools`,
                    internal: false,
                  },
                ]
              : []),
          ],
    },
    {
      title: t('common.pool'),
      href: '/pool',
      isActive: pathname.startsWith('/pool'),
      items: [
        { label: t('nav.tabs.viewPosition'), quickKey: 'V', href: '/pool', internal: true },
        {
          label: t('nav.tabs.createPosition'),
          quickKey: 'V',
          href: '/add',
          internal: true,
        },
      ],
    },
    ...(!areTabsVisible && props?.includeNftsLink
      ? [
          {
            title: t('common.nfts'),
            href: '/nfts',
          },
        ]
      : []),
  ]
}
