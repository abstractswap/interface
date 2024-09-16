import forkConfig from 'forkConfig'

export function isPathBlocked(pathname: string) {
  const blockedPaths = document.querySelector('meta[property="x:blocked-paths"]')?.getAttribute('content')?.split(',')
  return (blockedPaths?.includes(pathname) || forkConfig.blockedPaths.includes(pathname)) ?? false
}
