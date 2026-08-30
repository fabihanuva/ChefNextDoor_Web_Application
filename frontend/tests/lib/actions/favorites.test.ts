import { createSupabaseMock, ok, mockUser } from '../../helpers/supabaseMock'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }))

import { createClient } from '@/lib/supabase/server'
import { toggleFavorite } from '@/lib/actions/favorites'

const mockedCreateClient = createClient as jest.Mock

describe('toggleFavorite', () => {
  afterEach(() => jest.clearAllMocks())

  it('requires an authenticated user', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: null } })) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await toggleFavorite(10)

    expect(result.error).toBe('You must be logged in')
  })

  it('requires a resolved customer profile', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: { tbl_customer: ok(null) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await toggleFavorite(10)

    expect(result.error).toBe('Customer profile not found')
  })

  it('removes an existing favorite (unfavorite)', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_customer: ok({ cs_id: 3 }),
        tbl_favorites: ok({ fav_id: 99 }),
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await toggleFavorite(10)

    expect(result.error).toBeUndefined()
    expect(supabase.from).toHaveBeenCalledWith('tbl_favorites')
  })

  it('adds a new favorite when none exists', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_customer: ok({ cs_id: 3 }),
        tbl_favorites: ok(null),
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await toggleFavorite(10)

    expect(result.error).toBeUndefined()
  })
})
