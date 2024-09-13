import HolidayUniIcon from 'components/Logo/HolidayUniIcon'
import { SVGProps } from 'components/Logo/UniIcon'
import styled from 'lib/styled-components'

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="22"
      viewBox="0 0 141 127"
      fill="none"
      onClick={onClick}
      cursor="pointer"
    >
      <path
        d="M93.1166 85.1282L121.195 113.222L108.021 126.404L79.9417 98.3103C77.5343 95.9016 74.361 94.5877 70.9469 94.5877C67.5328 94.5877 64.3594 95.9016 61.952 98.3103L33.8732 126.404L20.6983 113.222L48.7771 85.1282H93.0947H93.1166Z"
        fill="#00DE73"
      />
      <path
        d="M97.8 77.0262L136.143 87.296L140.958 69.2747L102.615 59.0049C99.332 58.129 96.5963 56.0269 94.8892 53.0708C93.1822 50.1365 92.7445 46.6987 93.6199 43.4141L103.884 5.05029L85.8725 0.23291L75.6083 38.5967L97.7781 77.0043L97.8 77.0262Z"
        fill="#00DE73"
      />
      <path
        d="M44.1155 77.0262L5.77252 87.296L0.957764 69.2747L39.3007 59.0049C42.5835 58.129 45.3192 56.0269 47.0262 53.0708C48.7333 50.1365 49.171 46.6987 48.2956 43.4141L38.0314 5.05029L56.043 0.23291L66.3072 38.5967L44.1374 77.0043L44.1155 77.0262Z"
        fill="#00DE73"
      />
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
