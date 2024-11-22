import { Currency, Price, Token, V3_CORE_FACTORY_ADDRESSES } from '@uniswap/sdk-core'
import { FeeAmount, TICK_SPACINGS, computePoolAddress, tickToPrice } from '@uniswap/v3-sdk'
import JSBI from 'jsbi'
import ms from 'ms'
import { useEffect, useMemo, useState } from 'react'
import computeSurroundingTicks from 'utils/computeSurroundingTicksLegacy'

import useAllV3TicksQuery from 'graphql/thegraph/allV3TicksQueryLegacy'
import { TickData, Ticks } from 'graphql/thegraph/apolloLegacy'
import { useAccount } from 'hooks/useAccount'
import { PoolState, usePoolMultichain } from 'hooks/usePools'
import { InterfaceChainId, UniverseChainId } from 'uniswap/src/types/chains'

const PRICE_FIXED_DIGITS = 8

// Tick with fields parsed to JSBIs, and active liquidity computed.
export interface TickProcessed {
  tick: number
  liquidityActive: JSBI
  liquidityNet: JSBI
  price0: string
  sdkPrice: Price<Token, Token>
}

const getActiveTick = (tickCurrent: number | undefined, feeAmount: FeeAmount | undefined) =>
  tickCurrent && feeAmount ? Math.floor(tickCurrent / TICK_SPACINGS[feeAmount]) * TICK_SPACINGS[feeAmount] : undefined

function useTicksFromSubgraph(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined,
  skip = 0,
  chainId: InterfaceChainId,
) {
  const poolAddress =
    currencyA?.wrapped && currencyB?.wrapped && feeAmount && chainId
      ? computePoolAddress({
          factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
          tokenA: currencyA?.wrapped,
          tokenB: currencyB?.wrapped,
          fee: feeAmount,
          chainId: chainId as any,
        })
      : undefined

  return useAllV3TicksQuery(poolAddress, ms(`30s`), !poolAddress, skip)
}

const MAX_THE_GRAPH_TICK_FETCH_VALUE = 1000
// Fetches all ticks for a given pool
function useAllV3Ticks(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined,
  chainId: InterfaceChainId,
): {
  isLoading: boolean
  error: unknown
  ticks?: TickData[]
} {
  const [skipNumber, setSkipNumber] = useState(0)
  const [subgraphTickData, setSubgraphTickData] = useState<Ticks>([])
  const { data, error, isLoading } = useTicksFromSubgraph(currencyA, currencyB, feeAmount, skipNumber, chainId)

  useEffect(() => {
    if (data?.ticks.length) {
      setSubgraphTickData((tickData) => [...tickData, ...data.ticks])
      if (data.ticks.length === MAX_THE_GRAPH_TICK_FETCH_VALUE) {
        setSkipNumber((skipNumber) => skipNumber + MAX_THE_GRAPH_TICK_FETCH_VALUE)
      }
    }
  }, [data?.ticks])

  return {
    isLoading: isLoading || data?.ticks.length === MAX_THE_GRAPH_TICK_FETCH_VALUE,
    error,
    ticks: subgraphTickData,
  }
}

export function usePoolActiveLiquidity(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined,
  chainId?: InterfaceChainId,
): {
  isLoading: boolean
  error: any
  currentTick?: number
  activeTick?: number
  liquidity?: JSBI
  sqrtPriceX96?: JSBI
  data?: TickProcessed[]
} {
  const account = useAccount()
  const defaultChainId = account.chainId ?? UniverseChainId.AbstractTestnet
  const pool = usePoolMultichain(currencyA?.wrapped, currencyB?.wrapped, feeAmount, chainId ?? defaultChainId)
  const liquidity = pool[1]?.liquidity
  const sqrtPriceX96 = pool[1]?.sqrtRatioX96

  const currentTick = pool[1]?.tickCurrent
  // Find nearest valid tick for pool in case tick is not initialized.
  const activeTick = useMemo(() => getActiveTick(currentTick, feeAmount), [currentTick, feeAmount])

  const { isLoading, error, ticks } = useAllV3Ticks(currencyA, currencyB, feeAmount, chainId ?? defaultChainId)

  return useMemo(() => {
    if (
      !currencyA ||
      !currencyB ||
      activeTick === undefined ||
      pool[0] !== PoolState.EXISTS ||
      !ticks ||
      ticks.length === 0 ||
      isLoading
    ) {
      return {
        isLoading: isLoading || pool[0] === PoolState.LOADING,
        error,
        activeTick,
        data: undefined,
      }
    }

    const token0 = currencyA?.wrapped
    const token1 = currencyB?.wrapped

    // find where the active tick would be to partition the array
    // if the active tick is initialized, the pivot will be an element
    // if not, take the previous tick as pivot
    const pivot = ticks.findIndex(({ tick }) => tick > activeTick) - 1

    if (pivot < 0) {
      // consider setting a local error
      return {
        isLoading,
        error,
        activeTick,
        data: undefined,
      }
    }

    const sdkPrice = tickToPrice(token0, token1, activeTick)
    const activeTickProcessed: TickProcessed = {
      liquidityActive: JSBI.BigInt(pool[1]?.liquidity ?? 0),
      tick: activeTick,
      liquidityNet: Number(ticks[pivot].tick) === activeTick ? JSBI.BigInt(ticks[pivot].liquidityNet) : JSBI.BigInt(0),
      price0: sdkPrice.toFixed(PRICE_FIXED_DIGITS),
      sdkPrice,
    }

    const subsequentTicks = computeSurroundingTicks(token0, token1, activeTickProcessed, ticks, pivot, true)

    const previousTicks = computeSurroundingTicks(token0, token1, activeTickProcessed, ticks, pivot, false)

    const ticksProcessed = previousTicks.concat(activeTickProcessed).concat(subsequentTicks)

    return {
      isLoading,
      error,
      currentTick,
      activeTick,
      liquidity,
      sqrtPriceX96,
      data: ticksProcessed,
    }
  }, [currencyA, currencyB, activeTick, pool, ticks, isLoading, error, currentTick, liquidity, sqrtPriceX96])
}
