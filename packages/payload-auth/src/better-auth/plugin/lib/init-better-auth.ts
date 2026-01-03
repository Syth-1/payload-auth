// lib/init-better-auth.ts
import { betterAuth } from 'better-auth'
import type { BasePayload } from 'payload'
import { getOrCreateAdapter } from './adapter-singleton'
import type {
  BetterAuthFunctionOptions,
  BetterAuthInstancesConfig,
  BetterAuthPluginOptions,
  BetterAuthReturn,
  BetterAuthSingleInstance
} from '../types'

interface InitBetterAuthParams<O extends BetterAuthPluginOptions> {
  payload: BasePayload
  idType: 'number' | 'text'
  options: BetterAuthFunctionOptions<O>
  instances?: BetterAuthInstancesConfig
}

/**
 * Create a single better-auth instance with specific cookie prefix
 */
function createInstance<O extends BetterAuthPluginOptions>(
  payload: BasePayload,
  idType: 'number' | 'text',
  options: BetterAuthFunctionOptions<O>,
  cookiePrefix?: string,
  instanceOverrides?: Partial<BetterAuthFunctionOptions<O>>
): BetterAuthSingleInstance<O> {
  const { enableDebugLogs = false, ...restOptions } = options

  const adapter = getOrCreateAdapter(payload, {
    enableDebugLogs,
    idType
  })

  const mergedOptions = {
    ...restOptions,
    ...instanceOverrides,
    // Merge advanced options, applying cookie prefix
    advanced: {
      ...restOptions.advanced,
      ...instanceOverrides?.advanced,
      ...(cookiePrefix && {
        cookiePrefix
      })
    },
    database: adapter
  }

  return betterAuth(mergedOptions) as unknown as BetterAuthSingleInstance<O>
}

/**
 * Initialize better-auth instance(s)
 *
 * - Single mode: Returns a single instance (backward compatible)
 * - Multi mode: Returns an object with named instances
 */
export function initBetterAuth<O extends BetterAuthPluginOptions>({
  payload,
  idType,
  options,
  instances
}: InitBetterAuthParams<O>): BetterAuthReturn<O> {
  // Multi-instance mode
  if (instances && Object.keys(instances).length > 0) {
    const result = {} as Record<string, BetterAuthSingleInstance<O>>

    for (const [name, config] of Object.entries(instances)) {
      result[name] = createInstance(
        payload,
        idType,
        options,
        config.cookiePrefix,
        config.optionOverrides as Partial<BetterAuthFunctionOptions<O>>
      )
    }

    return result as BetterAuthReturn<O>
  }

  // Single-instance mode (backward compatible)
  return createInstance(
    payload,
    idType,
    options
  ) as BetterAuthReturn<O>
}