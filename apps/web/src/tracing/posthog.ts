import posthog from 'posthog-js'

const posthogKey = process.env.REACT_APP_POSTHOG_KEY

export function setupPosthog() {
  if (typeof window !== 'undefined' && posthogKey) {
    posthog.init(posthogKey, {
      api_host: process.env.REACT_APP_POSTHOG_HOST || 'https://posthog.reservoir.tools',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.debug()
        }
      },
      disable_session_recording: true,
      capture_pageview: true,
      mask_all_text: false,
      mask_all_element_attributes: false,
    })
  }
}
