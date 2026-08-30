import { createSupabaseMock, ok, fail, mockUser } from '../../helpers/supabaseMock'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }))

import { createClient } from '@/lib/supabase/server'
import { updateProfile } from '@/lib/actions/profile'

const mockedCreateClient = createClient as jest.Mock

function buildForm(fields: Record<string, string>) {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) form.set(key, value)
  return form
}

describe('updateProfile', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects a name that is too short', async () => {
    const result = await updateProfile(undefined, buildForm({ fullName: 'A', phone: '01700000000' }))
    expect(result?.error).toMatch(/full name/i)
  })

  it('rejects an invalid phone number', async () => {
    const result = await updateProfile(undefined, buildForm({ fullName: 'Nuva Ahmed', phone: '1' }))
    expect(result?.error).toMatch(/phone number/i)
  })

  it('requires an authenticated user', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: null } })) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await updateProfile(
      undefined,
      buildForm({ fullName: 'Nuva Ahmed', phone: '01700000000' })
    )

    expect(result?.error).toBe('You must be logged in')
  })

  it('updates the profile and reports success', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: { tbl_users: ok(null) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await updateProfile(
      undefined,
      buildForm({ fullName: 'Nuva Ahmed', phone: '01700000000' })
    )

    expect(result).toEqual({ success: true })
  })

  it('surfaces a database error', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: { tbl_users: fail('write failed') },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await updateProfile(
      undefined,
      buildForm({ fullName: 'Nuva Ahmed', phone: '01700000000' })
    )

    expect(result?.error).toBe('write failed')
  })
})
