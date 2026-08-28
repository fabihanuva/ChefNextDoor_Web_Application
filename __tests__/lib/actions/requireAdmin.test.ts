import { createSupabaseMock, ok, mockUser } from '../../helpers/supabaseMock'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/actions/requireAdmin'

const mockedCreateClient = createClient as jest.Mock

describe('requireAdmin', () => {
  afterEach(() => jest.clearAllMocks())

  it('returns null when nobody is logged in', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: null } })) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await requireAdmin()

    expect(result).toBeNull()
  })

  it('returns null when the logged-in user has no tbl_admin row', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: { tbl_admin: ok(null) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await requireAdmin()

    expect(result).toBeNull()
  })

  it('returns the admin row when the email matches tbl_admin', async () => {
    const admin = { adm_id: 1, adm_email: 'admin@chefnextdoor.com', adm_access_level: 'full' }
    const supabase = createSupabaseMock({
      auth: {
        getUser: jest.fn(async () => ({
          data: { user: mockUser({ email: 'admin@chefnextdoor.com' }) },
        })),
      },
      from: { tbl_admin: ok(admin) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await requireAdmin()

    expect(result).toEqual(admin)
  })
})
