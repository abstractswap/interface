import { ReactComponent as WinterUni } from 'assets/svg/winter-uni.svg'
import { SVGProps } from 'components/Logo/UniIcon'
import { ReactElement } from 'react'
import { t } from 'uniswap/src/i18n'

const MONTH_TO_HOLIDAY_UNI: { [date: string]: (props: SVGProps) => ReactElement } = {
  //TODO: determine if holiday icon is used
  '-1': (props) => <WinterUni title={t('common.happyHolidays')} {...props} />,
  '-2': (props) => <WinterUni {...props} />,
}

export default function HolidayUniIcon(props: SVGProps): ReactElement | null {
  // months in javascript are 0 indexed...
  const currentMonth = `${new Date().getMonth() + 1}`
  const HolidayUni = MONTH_TO_HOLIDAY_UNI[currentMonth]
  return HolidayUni ? <HolidayUni {...props} /> : null
}
