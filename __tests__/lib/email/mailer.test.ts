jest.mock('resend', () => {
  const mockSend = jest.fn()
  return {
    Resend: jest.fn().mockImplementation(() => ({ emails: { send: mockSend } })),
  }
})

import { Resend } from 'resend'
import {
  sendEmail,
  sendChefApprovedEmail,
  sendChefRejectedEmail,
  sendChefSuspendedEmail,
} from '@/lib/email/mailer'

// mailer.ts constructs `new Resend(...)` once at module load, so the mocked
// constructor's first (and only) call result holds the shared `send` mock.
const mockSend = (Resend as unknown as jest.Mock).mock.results[0].value.emails.send

describe('sendEmail', () => {
  afterEach(() => jest.clearAllMocks())

  it('sends an email through the Resend facade', async () => {
    mockSend.mockResolvedValue({ error: null })

    const result = await sendEmail({ to: 'user@example.com', subject: 'Hi', html: '<p>Hi</p>' })

    expect(result.error).toBeUndefined()
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'user@example.com', subject: 'Hi', html: '<p>Hi</p>' })
    )
  })

  it('returns an error message when Resend fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockSend.mockResolvedValue({ error: { message: 'send failed' } })

    const result = await sendEmail({ to: 'user@example.com', subject: 'Hi', html: '<p>Hi</p>' })

    expect(result.error).toBe('send failed')
  })
})

describe('templated chef emails', () => {
  afterEach(() => jest.clearAllMocks())

  it('sends a chef approved email', async () => {
    mockSend.mockResolvedValue({ error: null })

    await sendChefApprovedEmail('chef@example.com', 'Chef Ana')

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'chef@example.com', subject: expect.stringContaining('verified') })
    )
  })

  it('sends a chef rejected email', async () => {
    mockSend.mockResolvedValue({ error: null })

    await sendChefRejectedEmail('chef@example.com', 'Chef Ana')

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'chef@example.com', subject: expect.stringContaining('application') })
    )
  })

  it('sends a chef suspended email', async () => {
    mockSend.mockResolvedValue({ error: null })

    await sendChefSuspendedEmail('chef@example.com', 'Chef Ana')

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'chef@example.com', subject: expect.stringContaining('suspended') })
    )
  })
})
