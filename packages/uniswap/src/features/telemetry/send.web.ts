import { AppsFlyerEventProperties, UniverseEventProperties } from 'uniswap/src/features/telemetry/types'
import { logger } from 'utilities/src/logger/logger'
// eslint-disable-next-line no-restricted-imports
import { analytics, ANALYTICS_ENABLED } from 'utilities/src/telemetry/analytics/analytics'

export function sendAnalyticsEvent<EventName extends keyof UniverseEventProperties>(
  ...args: undefined extends UniverseEventProperties[EventName]
    ? [EventName] | [EventName, UniverseEventProperties[EventName]]
    : [EventName, UniverseEventProperties[EventName]]
): void {
  if (ANALYTICS_ENABLED) {
    const [eventName, eventProperties] = args
    analytics.sendEvent(eventName, eventProperties as Record<string, unknown>)
  }
}

export async function sendAppsFlyerEvent<EventName extends keyof AppsFlyerEventProperties>(
  ...args: undefined extends AppsFlyerEventProperties[EventName]
    ? [EventName] | [EventName, AppsFlyerEventProperties[EventName]]
    : [EventName, AppsFlyerEventProperties[EventName]]
): Promise<void> {
  if (ANALYTICS_ENABLED) {
    logger.warn('telemetry/index.web.ts', 'sendWalletAppsFlyerEvent', 'method not supported', args)
  }
}
