import { createSupabaseMock, ok, fail, mockUser } from '../../helpers/supabaseMock'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }))

import { createClient } from '@/lib/supabase/server'
import { updateChefProfile } from '@/lib/actions/chefProfile'

const mockedCreateClient = createClient as jest.Mock

function buildForm(fields: Record<string, string>) {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) form.set(key, value)
  return form
}

const validFields = {
  fullName: 'Chef Nusrat',
  cuisineType: 'Bengali',
  kitchenAddress: '45 Dhanmondi Rd, Dhaka',
}

describe('updateChefProfile', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects a cuisine type that is too short', async () => {
    const result = await updateChefProfile(
      undefined,
      buildForm({ ...validFields, cuisineType: 'B' })
    )
    expect(result?.error).toMatch(/cook/i)
  })

  it('requires an authenticated user', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: null } })) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await updateChefProfile(undefined, buildForm(validFields))

    expect(result?.error).toBe('You must be logged in')
  })

  it('updates users and chef profile tables and reports success (no avatar)', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_users: ok(null),
        tbl_chef_profile: ok(null),
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await updateChefProfile(undefined, buildForm(validFields))

    expect(result).toEqual({ success: true })
    expect(supabase.from).toHaveBeenCalledWith('tbl_users')
    expect(supabase.from).toHaveBeenCalledWith('tbl_chef_profile')
  })

  it('uploads an avatar file when provided and stores its public URL', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_users: ok(null),
        tbl_chef_profile: ok(null),
      },
      storage: { publicUrl: 'https://cdn.example.com/avatar.jpg' },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const form = buildForm(validFields)
    const avatar = new File(['fake-bytes'], 'avatar.jpg', { type: 'image/jpeg' })
    form.set('avatar', avatar)

    const result = await updateChefProfile(undefined, form)

    expect(result).toEqual({ success: true })
    expect(supabase.storage.from).toHaveBeenCalledWith('chef-avatars')
  })

  it('returns an error when the avatar upload fails', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      storage: { upload: fail('storage quota exceeded') },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const form = buildForm(validFields)
    const avatar = new File(['fake-bytes'], 'avatar.jpg', { type: 'image/jpeg' })
    form.set('avatar', avatar)

    const result = await updateChefProfile(undefined, form)

    expect(result?.error).toBe('storage quota exceeded')
  })

  it('surfaces a database error updating tbl_users', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: { tbl_users: fail('users update failed') },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await updateChefProfile(undefined, buildForm(validFields))

    expect(result?.error).toBe('users update failed')
  })

  it('surfaces a database error updating tbl_chef_profile', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_users: ok(null),
        tbl_chef_profile: fail('chef profile update failed'),
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await updateChefProfile(undefined, buildForm(validFields))

    expect(result?.error).toBe('chef profile update failed')
  })
})
