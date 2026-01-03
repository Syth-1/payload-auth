import type { BasePayload } from 'payload'
import { payloadAdapter } from 'payload-auth/better-auth/adapter'

type AdapterInstance = ReturnType<typeof payloadAdapter>

let cachedAdapter: AdapterInstance | null = null
let adapterPayloadRef: WeakRef<BasePayload> | null = null

export interface AdapterConfig {
  enableDebugLogs: boolean
  idType: 'number' | 'text'
}

/**
 * Get or create a singleton database adapter
 * The adapter is cached and reused across all better-auth instances
 */
export function getOrCreateAdapter(
  payload: BasePayload,
  config: AdapterConfig
): AdapterInstance {
  // Check if we have a cached adapter and if it's for the same payload instance
  const existingPayload = adapterPayloadRef?.deref()

  if (cachedAdapter && existingPayload === payload) {
    return cachedAdapter
  }

  // Create new adapter
  cachedAdapter = payloadAdapter({
    payloadClient: payload,
    adapterConfig: {
      enableDebugLogs: config.enableDebugLogs,
      idType: config.idType
    }
  })

  adapterPayloadRef = new WeakRef(payload)

  return cachedAdapter
}

/**
 * Clear the cached adapter (useful for testing)
 */
export function clearAdapterCache(): void {
  cachedAdapter = null
  adapterPayloadRef = null
}