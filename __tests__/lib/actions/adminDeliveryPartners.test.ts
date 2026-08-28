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
import { createDeliveryPartner, deleteDeliveryPartner } from '@/lib/actions/adminDeliveryPartners'

const mockedCreateAdminClient = createAdminClient as jest.Mock
const mockedRequireAdmin = requireAdmin as jest.Mock

const admin = { adm_id: 1, adm_email: 'admin@chefnextdoor.com', adm_access_level: 'full' }

function buildForm(fields: Record<string, string>) {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) form.set(key, value)
  return form
}

const validFields = { name: 'Rahim Uddin', phone: '01711223344', vehicleType: 'Motorbike' }

describe('createDeliveryPartner', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects unauthorized callers before validating input', async () => {
    mockedRequireAdmin.mockResolvedValue(null)

    const result = await createDeliveryPartner(undefined, buildForm(validFields))

    expect(result?.error).toBe('Not authorized')
  })

  it('rejects invalid input', async () => {
    mockedRequireAdmin.mockResolvedValue(admin)

    const result = await createDeliveryPartner(
      undefined,
      buildForm({ ...validFields, phone: '1' })
    )

    expect(result?.error).toMatch(/phone number/i)
  })

  it('creates the partner and redirects on success', async () => {
    mockedRequireAdmin.mockResolvedValue(admin)
    const supabase = createSupabaseMock({ from: { tbl_delivery_partner: ok(null) } })
    mockedCreateAdminClient.mockReturnValue(supabase)

    await expect(createDeliveryPartner(undefined, buildForm(validFields))).rejects.toThrow(
      'NEXT_REDIRECT:/admin/delivery-partners'
    )
    expect(redirect).toHaveBeenCalledWith('/admin/delivery-partners')
  })

  it('surfaces a database error instead of redirecting', async () => {
    mockedRequireAdmin.mockResolvedValue(admin)
    const supabase = createSupabaseMock({
      from: { tbl_delivery_partner: fail('insert failed') },
    })
    mockedCreateAdminClient.mockReturnValue(supabase)

    const result = await createDeliveryPartner(undefined, buildForm(validFields))

    expect(result?.error).toBe('insert failed')
    expect(redirect).not.toHaveBeenCalled()
  })
})

describe('deleteDeliveryPartner', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects unauthorized callers', async () => {
    mockedRequireAdmin.mockResolvedValue(null)
    const result = await deleteDeliveryPartner(1)
    expect(result.error).toBe('Not authorized')
  })

  it('deletes the partner', async () => {
    mockedRequireAdmin.mockResolvedValue(admin)
    const supabase = createSupabaseMock({ from: { tbl_delivery_partner: ok(null) } })
    mockedCreateAdminClient.mockReturnValue(supabase)

    const result = await deleteDeliveryPartner(1)

    expect(result.error).toBeUndefined()
  })

  it('surfaces a database error', async () => {
    mockedRequireAdmin.mockResolvedValue(admin)
    const supabase = createSupabaseMock({
      from: { tbl_delivery_partner: fail('fk violation') },
    })
    mockedCreateAdminClient.mockReturnValue(supabase)

    const result = await deleteDeliveryPartner(1)

    expect(result.error).toBe('fk violation')
  })
})
