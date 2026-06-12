import { browser } from '$app/environment'
import { PUBLIC_POSTHOG_KEY, PUBLIC_POSTHOG_HOST } from '$env/static/public'

type PostHog = typeof import('posthog-js').default

let _posthog: PostHog | null = null

export async function initAnalytics(): Promise<void> {
  if (!browser || !PUBLIC_POSTHOG_KEY || _posthog) return
  const { default: posthog } = await import('posthog-js')
  posthog.init(PUBLIC_POSTHOG_KEY, {
    api_host: PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false,
  })
  _posthog = posthog
}

export function capturePageview(): void {
  _posthog?.capture('$pageview')
}

export function capture(event: string, properties?: Record<string, unknown>): void {
  _posthog?.capture(event, properties)
}

export function identify(userId: string, traits?: Record<string, unknown>): void {
  _posthog?.identify(userId, traits)
}

export function analyticsReset(): void {
  _posthog?.reset()
}

export function analyticsOptIn(): void {
  _posthog?.opt_in_capturing()
}

export function analyticsOptOut(): void {
  _posthog?.opt_out_capturing()
}
