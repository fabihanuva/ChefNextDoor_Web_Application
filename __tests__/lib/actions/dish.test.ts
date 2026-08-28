import { createSupabaseMock, ok, fail, mockUser } from '../../helpers/supabaseMock'

jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createDish, updateDish, deleteDish, toggleDishAvailability } from '@/lib/actions/dish'

const mockedCreateClient = createClient as jest.Mock

function buildForm(fields: Record<string, string>) {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) form.set(key, value)
  return form
}

const validDishFields = { name: 'Chicken Biryani', description: 'Spicy', price: '350' }

describe('createDish', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects an invalid price without touching the database', async () => {
    const supabase = createSupabaseMock()
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await createDish(undefined, buildForm({ name: 'Biryani', price: '-5' }))

    expect(result?.error).toBeDefined()
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('rejects when name is too short', async () => {
    const supabase = createSupabaseMock()
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await createDish(undefined, buildForm({ name: 'A', price: '10' }))

    expect(result?.error).toMatch(/dish name/i)
  })

  it('requires an authenticated user', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: null } })) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await createDish(undefined, buildForm(validDishFields))

    expect(result?.error).toBe('You must be logged in')
  })

  it('requires the user to have a chef profile', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: { tbl_chef_profile: ok(null) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await createDish(undefined, buildForm(validDishFields))

    expect(result?.error).toBe('Chef profile not found')
  })

  it('inserts the dish and redirects on success', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_chef_profile: ok({ chf_id: 5 }),
        tbl_dish: ok(null),
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    await expect(createDish(undefined, buildForm(validDishFields))).rejects.toThrow(
      'NEXT_REDIRECT:/chef/dishes'
    )
    expect(redirect).toHaveBeenCalledWith('/chef/dishes')
    expect(supabase.from).toHaveBeenCalledWith('tbl_dish')
  })

  it('surfaces a database error instead of redirecting', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_chef_profile: ok({ chf_id: 5 }),
        tbl_dish: fail('duplicate key value'),
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await createDish(undefined, buildForm(validDishFields))

    expect(result?.error).toBe('duplicate key value')
    expect(redirect).not.toHaveBeenCalled()
  })
})

describe('updateDish', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects invalid input before any Supabase calls', async () => {
    const supabase = createSupabaseMock()
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await updateDish(1, undefined, buildForm({ name: '', price: '10' }))

    expect(result?.error).toBeDefined()
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('enforces ownership by scoping the update to dsh_chef_id', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_chef_profile: ok({ chf_id: 5 }),
        tbl_dish: ok(null),
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    await expect(updateDish(1, undefined, buildForm(validDishFields))).rejects.toThrow(
      'NEXT_REDIRECT:/chef/dishes'
    )
    expect(supabase.from).toHaveBeenCalledWith('tbl_dish')
  })

  it('returns the update error when the write fails', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_chef_profile: ok({ chf_id: 5 }),
        tbl_dish: fail('not found'),
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await updateDish(1, undefined, buildForm(validDishFields))

    expect(result?.error).toBe('not found')
  })
})

describe('deleteDish', () => {
  afterEach(() => jest.clearAllMocks())

  it('requires authentication', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: null } })) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await deleteDish(1)

    expect(result.error).toBe('You must be logged in')
  })

  it('requires a chef profile', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: { tbl_chef_profile: ok(null) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await deleteDish(1)

    expect(result.error).toBe('Chef profile not found')
  })

  it('deletes the dish scoped to the owning chef and clears the error', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_chef_profile: ok({ chf_id: 5 }),
        tbl_dish: ok(null),
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await deleteDish(1)

    expect(result.error).toBeUndefined()
    expect(supabase.from).toHaveBeenCalledWith('tbl_dish')
  })

  it('surfaces a database error on failed delete', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_chef_profile: ok({ chf_id: 5 }),
        tbl_dish: fail('fk violation'),
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await deleteDish(1)

    expect(result.error).toBe('fk violation')
  })
})

describe('toggleDishAvailability', () => {
  afterEach(() => jest.clearAllMocks())

  it('requires authentication', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: null } })) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await toggleDishAvailability(1, false)

    expect(result.error).toBe('You must be logged in')
  })

  it('flips availability for the owning chef', async () => {
    const supabase = createSupabaseMock({
      auth: { getUser: jest.fn(async () => ({ data: { user: mockUser() } })) },
      from: {
        tbl_chef_profile: ok({ chf_id: 5 }),
        tbl_dish: ok(null),
      },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await toggleDishAvailability(1, false)

    expect(result.error).toBeUndefined()
  })
})
