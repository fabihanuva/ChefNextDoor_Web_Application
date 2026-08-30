import { createSupabaseMock, ok, fail } from '../../helpers/supabaseMock'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('@/lib/supabase/admin', () => ({ createAdminClient: jest.fn() }))
jest.mock('@/lib/actions/requireAdmin', () => ({ requireAdmin: jest.fn() }))
jest.mock('@/lib/email/mailer', () => ({
  sendChefApprovedEmail: jest.fn(async () => ({ error: undefined })),
  sendChefRejectedEmail: jest.fn(async () => ({ error: undefined })),
  sendChefSuspendedEmail: jest.fn(async () => ({ error: undefined })),
}))

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/actions/requireAdmin'
import {
  sendChefApprovedEmail,
  sendChefRejectedEmail,
  sendChefSuspendedEmail,
} from '@/lib/email/mailer'
import { approveChef, rejectChef, suspendChef } from '@/lib/actions/adminChefs'

const mockedCreateAdminClient = createAdminClient as jest.Mock
const mockedRequireAdmin = requireAdmin as jest.Mock

const admin = { adm_id: 1, adm_email: 'admin@chefnextdoor.com', adm_access_level: 'full' }
const contact = { usr_full_name: 'Chef Nusrat', usr_email: 'nusrat@example.com' }

describe('approveChef', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects when the caller is not an admin', async () => {
    mockedRequireAdmin.mockResolvedValue(null)

    const result = await approveChef(5)

    expect(result.error).toBe('Not authorized')
    expect(mockedCreateAdminClient).not.toHaveBeenCalled()
  })

  it('verifies the chef and sends an approval email', async () => {
    mockedRequireAdmin.mockResolvedValue(admin)
    const supabase = createSupabaseMock({
      from: {
        tbl_chef_profile: [ok({ tbl_users: contact }), ok(null)],
      },
    })
    mockedCreateAdminClient.mockReturnValue(supabase)

    const result = await approveChef(5)

    expect(result.error).toBeUndefined()
    expect(sendChefApprovedEmail).toHaveBeenCalledWith(contact.usr_email, contact.usr_full_name)
  })

  it('does not send an email if the chef contact cannot be found', async () => {
    mockedRequireAdmin.mockResolvedValue(admin)
    const supabase = createSupabaseMock({
      from: { tbl_chef_profile: [ok(null), ok(null)] },
    })
    mockedCreateAdminClient.mockReturnValue(supabase)

    await approveChef(5)

    expect(sendChefApprovedEmail).not.toHaveBeenCalled()
  })

  it('surfaces a database error without sending an email', async () => {
    mockedRequireAdmin.mockResolvedValue(admin)
    const supabase = createSupabaseMock({
      from: { tbl_chef_profile: [ok({ tbl_users: contact }), fail('update failed')] },
    })
    mockedCreateAdminClient.mockReturnValue(supabase)

    const result = await approveChef(5)

    expect(result.error).toBe('update failed')
    expect(sendChefApprovedEmail).not.toHaveBeenCalled()
  })
})

describe('rejectChef', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects when the caller is not an admin', async () => {
    mockedRequireAdmin.mockResolvedValue(null)
    const result = await rejectChef(5)
    expect(result.error).toBe('Not authorized')
  })

  it('marks the chef rejected and emails them', async () => {
    mockedRequireAdmin.mockResolvedValue(admin)
    const supabase = createSupabaseMock({
      from: { tbl_chef_profile: [ok({ tbl_users: contact }), ok(null)] },
    })
    mockedCreateAdminClient.mockReturnValue(supabase)

    const result = await rejectChef(5)

    expect(result.error).toBeUndefined()
    expect(sendChefRejectedEmail).toHaveBeenCalledWith(contact.usr_email, contact.usr_full_name)
  })
})

describe('suspendChef', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects when the caller is not an admin', async () => {
    mockedRequireAdmin.mockResolvedValue(null)
    const result = await suspendChef(5)
    expect(result.error).toBe('Not authorized')
  })

  it('marks the chef suspended and emails them', async () => {
    mockedRequireAdmin.mockResolvedValue(admin)
    const supabase = createSupabaseMock({
      from: { tbl_chef_profile: [ok({ tbl_users: contact }), ok(null)] },
    })
    mockedCreateAdminClient.mockReturnValue(supabase)

    const result = await suspendChef(5)

    expect(result.error).toBeUndefined()
    expect(sendChefSuspendedEmail).toHaveBeenCalledWith(contact.usr_email, contact.usr_full_name)
  })
})
