import HolidayUniIcon from 'components/Logo/HolidayUniIcon'
import { SVGProps } from 'components/Logo/UniIcon'
import styled from 'lib/styled-components'

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <svg
      width="19"
      height="22"
      viewBox="0 0 19 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      cursor="pointer"
    >
      <path d="M18.1718 16.2517L9.09082 11V0.506348L18.1718 5.75805V16.2517Z" fill="#80D8FF" />
      <path d="M0 16.2517L9.09062 11V0.506348L0 5.75805V16.2517Z" fill="#7ACFFF" />
      <path d="M9.09062 16.2517L18.1715 11L9.09062 5.75806L0 11L9.09062 16.2517Z" fill="url(#paint0_linear_76_278)" />
      <path opacity="0.3" d="M9.09062 21.4937L0 16.2517V5.75806L9.09062 11V21.4937Z" fill="#E4F0FE" />
      <path d="M0 16.2517L9.09062 21.4937V16.2517L0 11V16.2517Z" fill="url(#paint1_linear_76_278)" />
      <path opacity="0.3" d="M9.09082 21.4937L18.1718 16.2517V5.75806L9.09082 11V21.4937Z" fill="#D0E6FF" />
      <path d="M18.1718 16.2517L9.09082 21.4937V16.2517L18.1718 11V16.2517Z" fill="url(#paint2_linear_76_278)" />
      <path opacity="0.3" d="M9.09062 11L18.1715 5.75805L9.09062 0.506348L0 5.75805L9.09062 11Z" fill="white" />
      <defs>
        <linearGradient
          id="paint0_linear_76_278"
          x1="0.339999"
          y1="12.9592"
          x2="18.077"
          y2="8.99462"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#C132CE" />
          <stop offset="1" stopColor="#425AFA" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_76_278"
          x1="3.49411"
          y1="12.7587"
          x2="6.11023"
          y2="21.4615"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#425AFA" />
          <stop offset="0.16" stopColor="#5A52F2" />
          <stop offset="0.55" stopColor="#9241DE" />
          <stop offset="0.84" stopColor="#6E56CF" />
          <stop offset="1" stopColor="#C132CE" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_76_278"
          x1="10.6968"
          y1="19.8512"
          x2="16.4922"
          y2="12.7404"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#C132CE" />
          <stop offset="0.1" stopColor="#AB39D6" />
          <stop offset="0.28" stopColor="#8545E3" />
          <stop offset="0.47" stopColor="#684EED" />
          <stop offset="0.65" stopColor="#5355F4" />
          <stop offset="0.83" stopColor="#4659F9" />
          <stop offset="1" stopColor="#425AFA" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const Container = styled.div<{ clickable?: boolean }>`
  position: relative;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'auto')};
  display: flex;
  justify-content: center;
  align-items: center;
`

type NavIconProps = SVGProps & {
  clickable?: boolean
  onClick?: () => void
}

export const NavIcon = ({ clickable, onClick, ...props }: NavIconProps) => (
  <Container clickable={clickable}>
    {HolidayUniIcon(props) !== null ? <HolidayUniIcon {...props} /> : <Logo onClick={onClick} />}
  </Container>
)
