import { Token } from '@uniswap/sdk-core'
import { useCallback } from 'react'
import { useAppDispatch } from 'state/hooks'
import { addSerializedToken } from 'state/user/reducer'
import { serializeToken } from 'uniswap/src/utils/currency'

export function useAddUserToken(): (token: Token) => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (token: Token) => {
      dispatch(addSerializedToken({ serializedToken: serializeToken(token) }))
    },
    [dispatch],
  )
}
