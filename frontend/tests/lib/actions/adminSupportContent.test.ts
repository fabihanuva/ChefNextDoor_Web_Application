import { createSupabaseMock, ok, fail } from '../../helpers/supabaseMock'

jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('@/lib/supabase/admin', () => ({ createAdminClient: jest.fn() }))
jest.mock('@/lib/actions/requireAdmin', () => ({ requireAdmin: jest.fn() }))

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/actions/requireAdmin'
import { redirect } from 'next/navigation'
import { createSupportContent, deleteSupportContent } from '@/lib/actions/adminSupportContent'

const mockedCreateAdminClient = createAdminClient as jest.Mock
const mockedRequireAdmin = requireAdmin as jest.Mock

const admin = { adm_id: 1, adm_email: 'admin@chefnextdoor.com', adm_access_level: 'full' }

function buildForm(fields: Record<string, string>) {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) form.set(key, value)
  return form
}

describe('createSupportContent', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects unauthorized callers', async () => {
    mockedRequireAdmin.mockResolvedValue(null)

    const result = await createSupportContent(undefined, buildForm({ title: 'FAQ', content: 'Answer' }))

    expect(result?.error).toBe('Not authorized')
  })

  it('rejects an invalid submission', async () => {
    mockedRequireAdmin.mockResolvedValue(admin)
    const supabase = createSupabaseMock()
    mockedCreateAdminClient.mockReturnValue(supabase)

    const result = await createSupportContent(undefined, buildForm({ title: 'a', content: 'b' }))

    expect(result?.error).toBeDefined()
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('surfaces a database error', async () => {
    mockedRequireAdmin.mockResolvedValue(admin)
    const supabase = createSupabaseMock({ from: { tbl_support_content: fail('insert failed') } })
    mockedCreateAdminClient.mockReturnValue(supabase)

    const result = await createSupportContent(
      undefined,
      buildForm({ title: 'Refund Policy', content: 'We refund within 24 hours.' })
    )

    expect(result?.error).toBe('insert failed')
  })

  it('creates the content and redirects on success', async () => {
    mockedRequireAdmin.mockResolvedValue(admin)
    const supabase = createSupabaseMock({ from: { tbl_support_content: ok(null) } })
    mockedCreateAdminClient.mockReturnValue(supabase)

    await expect(
      createSupportContent(
        undefined,
        buildForm({ title: 'Refund Policy', content: 'We refund within 24 hours.' })
      )
    ).rejects.toThrow('NEXT_REDIRECT:/admin/support-content')
    expect(redirect).toHaveBeenCalledWith('/admin/support-content')
    expect(supabase.from).toHaveBeenCalledWith('tbl_support_content')
  })
})

describe('deleteSupportContent', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects unauthorized callers', async () => {
    mockedRequireAdmin.mockResolvedValue(null)

    const result = await deleteSupportContent(1)

    expect(result.error).toBe('Not authorized')
  })

  it('surfaces a database error', async () => {
    mockedRequireAdmin.mockResolvedValue(admin)
    const supabase = createSupabaseMock({ from: { tbl_support_content: fail('delete failed') } })
    mockedCreateAdminClient.mockReturnValue(supabase)

    const result = await deleteSupportContent(1)

    expect(result.error).toBe('delete failed')
  })

  it('deletes the content successfully', async () => {
    mockedRequireAdmin.mockResolvedValue(admin)
    const supabase = createSupabaseMock({ from: { tbl_support_content: ok(null) } })
    mockedCreateAdminClient.mockReturnValue(supabase)

    const result = await deleteSupportContent(1)

    expect(result.error).toBeUndefined()
    expect(supabase.from).toHaveBeenCalledWith('tbl_support_content')
  })
})
