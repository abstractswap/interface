// import { useTranslation } from 'uniswap/src/i18n'

import { useTranslation } from 'uniswap/src/i18n'

export interface MenuItem {
  label: string
  href: string
  internal?: boolean
  overflow?: boolean
  closeMenu?: () => void
}

export interface MenuSection {
  title: string
  items: MenuItem[]
  closeMenu?: () => void
}

export const useMenuContent = (): MenuSection[] => {
  const { t } = useTranslation()

  return [
    // TODO: add translations once content is confirmed
    {
      title: 'Reservoir Swap',
      items: [{ label: 'About Reservoir Swap', href: 'https://docs.reservoir.tools/docs/reservoir-swap' }],
    },
    {
      title: 'Developers',
      items: [
        { label: 'Contracts', href: 'https://docs.reservoir.tools/docs/uniswap-contract-deployments' },
        { label: 'Testnets', href: 'https://testnets-swap.reservoir.tools' },
      ],
    },
    {
      title: 'Reservoir Apps',
      items: [
        { label: 'Relay Bridge', href: 'https://www.relay.link' },
        { label: 'NFT Marketplace', href: 'https://explorer.reservoir.tools/' },
      ],
    },
    {
      title: t('common.company'),
      items: [
        { label: t('common.contactUs.button'), href: 'mailto:support@reservoir.tools' },
        { label: t('common.privacyPolicy'), href: 'https://reservoir.tools/privacy' },
        { label: t('common.termsOfService'), href: 'https://reservoir.tools/terms' },
      ],
    },
  ]
}
