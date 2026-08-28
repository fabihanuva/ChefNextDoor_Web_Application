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
import { signUpCustomer, signUpChef, signIn, signOut } from '@/lib/actions/auth'

const mockedCreateClient = createClient as jest.Mock

function buildForm(fields: Record<string, string>) {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) form.set(key, value)
  return form
}

describe('signUpCustomer', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects an invalid submission without calling Supabase', async () => {
    const supabase = createSupabaseMock()
    mockedCreateClient.mockResolvedValue(supabase)

    const form = buildForm({ fullName: '', email: 'not-an-email', password: 'short', phone: '' })
    const result = await signUpCustomer(undefined, form)

    expect(result?.error).toBeDefined()
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('surfaces an auth error from Supabase', async () => {
    const supabase = createSupabaseMock({
      auth: { signUp: jest.fn(async () => ({ data: { user: null }, error: { message: 'Email already registered' } })) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const form = buildForm({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
      phone: '01700000000',
    })
    const result = await signUpCustomer(undefined, form)

    expect(result?.error).toBe('Email already registered')
  })

  it('surfaces an error updating the phone number', async () => {
    const supabase = createSupabaseMock({
      auth: { signUp: jest.fn(async () => ({ data: { user: mockUser() }, error: null })) },
      from: { tbl_users: fail('phone update failed') },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const form = buildForm({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
      phone: '01700000000',
    })
    const result = await signUpCustomer(undefined, form)

    expect(result?.error).toBe('phone update failed')
  })

  it('surfaces an error inserting the customer row', async () => {
    const supabase = createSupabaseMock({
      auth: { signUp: jest.fn(async () => ({ data: { user: mockUser() }, error: null })) },
      from: { tbl_users: ok(null), tbl_customer: fail('insert failed') },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const form = buildForm({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
      phone: '01700000000',
    })
    const result = await signUpCustomer(undefined, form)

    expect(result?.error).toBe('insert failed')
  })

  it('creates the account and redirects on success', async () => {
    const supabase = createSupabaseMock({
      auth: { signUp: jest.fn(async () => ({ data: { user: mockUser() }, error: null })) },
      from: { tbl_users: ok(null), tbl_customer: ok(null) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const form = buildForm({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
      phone: '01700000000',
    })

    await expect(signUpCustomer(undefined, form)).rejects.toThrow(
      'NEXT_REDIRECT:/login?registered=true'
    )
    expect(redirect).toHaveBeenCalledWith('/login?registered=true')
  })
})

describe('signUpChef', () => {
  afterEach(() => jest.clearAllMocks())

  function chefForm(overrides: Partial<Record<string, string>> = {}) {
    return buildForm({
      fullName: 'Chef Ana',
      email: 'ana@example.com',
      password: 'password123',
      phone: '01700000000',
      cuisineType: 'Bengali',
      kitchenAddress: '123 Home Kitchen Rd',
      ...overrides,
    })
  }

  it('rejects an invalid submission', async () => {
    const supabase = createSupabaseMock()
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await signUpChef(undefined, chefForm({ cuisineType: '' }))

    expect(result?.error).toBeDefined()
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('surfaces an auth error from Supabase', async () => {
    const supabase = createSupabaseMock({
      auth: { signUp: jest.fn(async () => ({ data: { user: null }, error: { message: 'Signup failed' } })) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await signUpChef(undefined, chefForm())

    expect(result?.error).toBe('Signup failed')
  })

  it('surfaces an error inserting the chef profile', async () => {
    const supabase = createSupabaseMock({
      auth: { signUp: jest.fn(async () => ({ data: { user: mockUser() }, error: null })) },
      from: { tbl_users: ok(null), tbl_chef_profile: fail('profile insert failed') },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await signUpChef(undefined, chefForm())

    expect(result?.error).toBe('profile insert failed')
  })

  it('creates a pending chef account and redirects', async () => {
    const supabase = createSupabaseMock({
      auth: { signUp: jest.fn(async () => ({ data: { user: mockUser() }, error: null })) },
      from: { tbl_users: ok(null), tbl_chef_profile: ok(null) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    await expect(signUpChef(undefined, chefForm())).rejects.toThrow(
      'NEXT_REDIRECT:/login?registered=true&pending=true'
    )
    expect(redirect).toHaveBeenCalledWith('/login?registered=true&pending=true')
  })
})

describe('signIn', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects an invalid submission', async () => {
    const supabase = createSupabaseMock()
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await signIn(undefined, buildForm({ email: 'bad', password: '' }))

    expect(result?.error).toBe('Enter a valid email and password')
  })

  it('rejects invalid credentials', async () => {
    const supabase = createSupabaseMock({
      auth: { signInWithPassword: jest.fn(async () => ({ data: { user: null }, error: { message: 'bad' } })) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    const result = await signIn(undefined, buildForm({ email: 'a@b.com', password: 'wrongpass' }))

    expect(result?.error).toBe('Invalid email or password')
  })

  it('redirects a chef to the chef dashboard', async () => {
    const chefUser = { ...mockUser(), user_metadata: { role: 'chef' } }
    const supabase = createSupabaseMock({
      auth: { signInWithPassword: jest.fn(async () => ({ data: { user: chefUser }, error: null })) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    await expect(
      signIn(undefined, buildForm({ email: 'chef@b.com', password: 'password123' }))
    ).rejects.toThrow('NEXT_REDIRECT:/chef/dashboard')
    expect(redirect).toHaveBeenCalledWith('/chef/dashboard')
  })

  it('redirects a customer to /browse', async () => {
    const supabase = createSupabaseMock({
      auth: { signInWithPassword: jest.fn(async () => ({ data: { user: mockUser() }, error: null })) },
    })
    mockedCreateClient.mockResolvedValue(supabase)

    await expect(
      signIn(undefined, buildForm({ email: 'cust@b.com', password: 'password123' }))
    ).rejects.toThrow('NEXT_REDIRECT:/browse')
    expect(redirect).toHaveBeenCalledWith('/browse')
  })
})

describe('signOut', () => {
  afterEach(() => jest.clearAllMocks())

  it('signs the user out and redirects to /login', async () => {
    const supabase = createSupabaseMock()
    mockedCreateClient.mockResolvedValue(supabase)

    await expect(signOut()).rejects.toThrow('NEXT_REDIRECT:/login')
    expect(supabase.auth.signOut).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/login')
  })
})
