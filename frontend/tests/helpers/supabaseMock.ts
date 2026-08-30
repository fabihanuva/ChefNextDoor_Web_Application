/**
 * A reusable stand-in for the Supabase client used across lib/actions and
 * lib/chef. Real Supabase query builders (`.from().select().eq().single()`
 * etc.) are chainable, and every link in the chain is itself "thenable" —
 * awaiting at any point resolves to `{ data, error }`.
 *
 * Rather than hand-building a bespoke chain shape for every action (they
 * all chain differently), `createChainable` returns a Proxy that answers
 * any method call by returning itself, and resolves when awaited to a
 * pre-configured `{ data, error }` result. That's enough to stub out
 * `.select().eq().eq().single()`, `.insert().select().single()`,
 * `.update().eq()`, `.delete().eq()`, `.in()`, `.order()`, `.not()`,
 * `.limit()`, `.maybeSingle()`, etc. without caring about the exact shape
 * each action happens to call.
 */

export type QueryResult<T = any> = { data: T | null; error: { message: string } | null }

export function ok<T>(data: T): QueryResult<T> {
  return { data, error: null }
}

export function fail(message: string): QueryResult<null> {
  return { data: null, error: { message } }
}

export function createChainable(result: QueryResult) {
  const resolved = Promise.resolve(result)

  const handler: ProxyHandler<any> = {
    get(_target, prop) {
      if (prop === 'then') return resolved.then.bind(resolved)
      if (prop === 'catch') return resolved.catch.bind(resolved)
      if (prop === 'finally') return resolved.finally.bind(resolved)
      if (prop === Symbol.toPrimitive || prop === 'toJSON') return undefined
      // Any other property access (select, eq, in, order, not, limit,
      // single, maybeSingle, insert, update, delete, upsert, ...) is
      // treated as a chain method: calling it just continues the chain.
      return (..._args: any[]) => createChainable(result)
    },
  }

  return new Proxy(function chainable() {}, handler)
}

type FromConfig = Record<string, QueryResult | QueryResult[]>

interface SupabaseMockConfig {
  auth?: {
    getUser?: jest.Mock
    signUp?: jest.Mock
    signInWithPassword?: jest.Mock
    signOut?: jest.Mock
  }
  from?: FromConfig
  storage?: {
    upload?: QueryResult
    publicUrl?: string
  }
}

/**
 * Builds a mock Supabase client. `from` maps table name -> either a single
 * `{data, error}` result (returned every time that table is queried) or an
 * array of results consumed in order (FIFO) across successive `.from(table)`
 * calls within the same test — needed when an action queries the same
 * table more than once for different purposes.
 */
export function createSupabaseMock(config: SupabaseMockConfig = {}) {
  const queues = new Map<string, QueryResult[]>()
  for (const [table, value] of Object.entries(config.from ?? {})) {
    queues.set(table, Array.isArray(value) ? [...value] : [value])
  }

  const fromMock = jest.fn((table: string) => {
    const queue = queues.get(table)
    if (!queue || queue.length === 0) {
      return createChainable({ data: null, error: null })
    }
    const next = queue.length > 1 ? queue.shift()! : queue[0]
    return createChainable(next)
  })

  const uploadResult = config.storage?.upload ?? ok({ path: 'mock/path.jpg' })
  const publicUrl = config.storage?.publicUrl ?? 'https://example.com/mock.jpg'

  return {
    auth: {
      getUser: config.auth?.getUser ?? jest.fn(async () => ({ data: { user: null } })),
      signUp: config.auth?.signUp ?? jest.fn(async () => ({ data: { user: null }, error: null })),
      signInWithPassword:
        config.auth?.signInWithPassword ??
        jest.fn(async () => ({ data: { user: null }, error: null })),
      signOut: config.auth?.signOut ?? jest.fn(async () => ({ error: null })),
    },
    from: fromMock,
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(async () => uploadResult),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl } })),
      })),
    },
  }
}

export function mockUser(overrides: Partial<{ id: string; email: string }> = {}) {
  return {
    id: overrides.id ?? 'auth-user-1',
    email: overrides.email ?? 'user@example.com',
    user_metadata: {},
  }
}
