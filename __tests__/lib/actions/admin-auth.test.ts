import { createSupabaseMock, ok, mockUser } from '../../helpers/supabaseMock'

jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { adminSignIn, adminSignOut } from '@/lib/actions/admin-auth'

const mockedCreateClient = createClient as jest.Mock

function buildForm(fields: Record<string, string>) {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) form.set(key, value)
  return form
}

describe('adminSignIn', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects an invalid submission without calling Supabase', async () => {
    const supabase = createSupabaseMock()
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await adminSignIn(undefined, buildForm({ email: 'bad', password: '' }))

    expect(result?.error).toBe('Enter a valid email and password')
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('rejects invalid credentials', async () => {
    const supabase = createSupabaseMock({
      auth: {
        signInWithPassword: jest.fn(async () => ({ data: { user: null }, error: { message: 'bad' } })),
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await adminSignIn(undefined, buildForm({ email: 'a@b.com', password: 'wrong' }))

    expect(result?.error).toBe('Invalid email or password')
  })

  it('signs out and rejects an authenticated user who is not in tbl_admin', async () => {
    const supabase = createSupabaseMock({
      auth: {
        signInWithPassword: jest.fn(async () => ({ data: { user: mockUser() }, error: null })),
      },
      from: { tbl_admin: ok(null) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await adminSignIn(undefined, buildForm({ email: 'a@b.com', password: 'correct' }))

    expect(result?.error).toBe('This account is not authorized as an admin')
    expect(supabase.auth.signOut).toHaveBeenCalled()
  })

  it('redirects to the dashboard for a verified admin', async () => {
    const admin = { adm_id: 1 }
    const supabase = createSupabaseMock({
      auth: {
        signInWithPassword: jest.fn(async () => ({ data: { user: mockUser() }, error: null })),
      },
      from: { tbl_admin: ok(admin) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    await expect(
      adminSignIn(undefined, buildForm({ email: 'admin@b.com', password: 'correct' }))
    ).rejects.toThrow('NEXT_REDIRECT:/admin/dashboard')
    expect(redirect).toHaveBeenCalledWith('/admin/dashboard')
  })
})

describe('adminSignOut', () => {
  afterEach(() => jest.clearAllMocks())

  it('signs out and redirects to /admin/login', async () => {
    const supabase = createSupabaseMock()
    mockedCreateClient.mockResolvedValue(supabase)

    await expect(adminSignOut()).rejects.toThrow('NEXT_REDIRECT:/admin/login')
    expect(supabase.auth.signOut).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/admin/login')
  })
})
