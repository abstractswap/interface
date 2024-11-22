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
      title: 'Reservoir',
      items: [
        { label: 'About Us', href: 'https://docs.reservoir.tools/docs/reservoir-swap' },
        { label: 'NFT Marketplace', href: 'https://explorer.reservoir.tools/ethereum' },
      ],
    },
    {
      title: 'Developers',
      items: [
        { label: 'Docs', href: 'https://docs.relay.link/what-is-relay' },
        { label: 'SDK', href: 'https://docs.relay.link/references/sdk/getting-started' },
        { label: 'Uniswap Protocol', href: 'https://docs.uniswap.org/' },
        { label: 'Testnets', href: 'https://testnets.reservoir.app' },
      ],
    },
    {
      title: 'Company',
      items: [
        { label: t('common.contactUs.button'), href: 'https://support.uniswap.org/hc/en-us/requests/new' },
        { label: t('common.privacyPolicy'), href: 'https://reservoir.tools/privacy' },
        { label: t('common.termsOfService'), href: 'https://reservoir.tools/terms' },
      ],
    },
    // {
    //   title: t('common.company'),
    //   items: [
    //     { label: t('common.careers'), href: 'https://boards.greenhouse.io/uniswaplabs' },
    //     { label: t('common.blog'), href: 'https://blog.uniswap.org/' },
    //   ],
    // },
    // {
    //   title: t('common.protocol'),
    //   items: [
    //     { label: t('common.vote'), href: 'https://vote.uniswapfoundation.org' },
    //     { label: t('common.governance'), href: 'https://uniswap.org/governance' },
    //     { label: t('common.developers'), href: 'https://uniswap.org/developers' },
    //   ],
    // },
    // {
    //   title: t('common.needHelp'),
    //   items: [
    //     { label: t('common.helpCenter'), href: 'https://support.uniswap.org/hc/en-us' },
    //     { label: t('common.contactUs.button'), href: 'https://support.uniswap.org/hc/en-us/requests/new' },
    //   ],
    // },
  ]
}
