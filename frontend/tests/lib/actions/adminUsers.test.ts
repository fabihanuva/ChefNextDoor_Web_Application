import { createSupabaseMock, ok, fail } from '../../helpers/supabaseMock'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('@/lib/supabase/admin', () => ({ createAdminClient: jest.fn() }))
jest.mock('@/lib/actions/requireAdmin', () => ({ requireAdmin: jest.fn() }))

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/actions/requireAdmin'
import { suspendUser, reactivateUser } from '@/lib/actions/adminUsers'

const mockedCreateAdminClient = createAdminClient as jest.Mock
const mockedRequireAdmin = requireAdmin as jest.Mock

const admin = { adm_id: 1, adm_email: 'admin@chefnextdoor.com', adm_access_level: 'full' }

describe('suspendUser', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects unauthorized callers', async () => {
    mockedRequireAdmin.mockResolvedValue(null)
    const result = await suspendUser('user-1')
    expect(result.error).toBe('Not authorized')
  })

  it('deactivates the user', async () => {
    mockedRequireAdmin.mockResolvedValue(admin)
    const supabase = createSupabaseMock({ from: { tbl_users: ok(null) } })
    mockedCreateAdminClient.mockReturnValue(supabase)

    const result = await suspendUser('user-1')

    expect(result.error).toBeUndefined()
    expect(supabase.from).toHaveBeenCalledWith('tbl_users')
  })

  it('surfaces a database error', async () => {
    mockedRequireAdmin.mockResolvedValue(admin)
    const supabase = createSupabaseMock({ from: { tbl_users: fail('write failed') } })
    mockedCreateAdminClient.mockReturnValue(supabase)

    const result = await suspendUser('user-1')

    expect(result.error).toBe('write failed')
  })
})

describe('reactivateUser', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects unauthorized callers', async () => {
    mockedRequireAdmin.mockResolvedValue(null)
    const result = await reactivateUser('user-1')
    expect(result.error).toBe('Not authorized')
  })

  it('reactivates the user', async () => {
    mockedRequireAdmin.mockResolvedValue(admin)
    const supabase = createSupabaseMock({ from: { tbl_users: ok(null) } })
    mockedCreateAdminClient.mockReturnValue(supabase)

    const result = await reactivateUser('user-1')

    expect(result.error).toBeUndefined()
  })
})
