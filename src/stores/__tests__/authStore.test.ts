import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useAuthStore } from '../authStore'

// Mock fetch globally
const fetchMock = vi.fn()
global.fetch = fetchMock

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Helper to create a fresh store instance for testing
function createTestStore() {
  // Reset any global state
  return () => useAuthStore()
}

describe('AuthStore', () => {
  beforeAll(() => {
    // Mock window.location to prevent navigation errors
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost:3000', assign: vi.fn(), replace: vi.fn() },
      writable: true,
    })
  })

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    fetchMock.mockClear()

    // Setup default fetch mocks
    fetchMock.mockImplementation(async (url: string, options?: any) => {
      if (url === '/api/csrf') {
        return {
          ok: true,
          json: async () => ({ success: true, token: 'mock-csrf-token' }),
        }
      }

      if (url === '/api/auth/login' && options?.method === 'POST') {
        const body = JSON.parse(options.body)
        if (body.email === 'admin@test.com' && body.password === 'admin123') {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: {
                user: {
                  id: 'user-123',
                  name: 'Test Admin',
                  email: 'admin@test.com',
                  role: 'ADMIN',
                  permissions: ['beneficiaries.read', 'beneficiaries.write', 'users.read'],
                },
              },
            }),
          }
        }
        return {
          ok: false,
          json: async () => ({ error: 'Invalid credentials' }),
        }
      }

      if (url === '/api/auth/logout' && options?.method === 'POST') {
        return {
          ok: true,
          json: async () => ({ success: true }),
        }
      }

      throw new Error(`Unhandled fetch to ${url}`)
    })
  })

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useAuthStore())

      expect(result.current.user).toBeNull()
      expect(result.current.session).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('login', () => {
    it('should handle successful login', async () => {
      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.login('admin@test.com', 'admin123')
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toBeTruthy()
      expect(result.current.error).toBeNull()
    })

    it('should handle login failure', async () => {
      const { result } = renderHook(() => useAuthStore())

      try {
        await act(async () => {
          await result.current.login('wrong@email.com', 'wrongpass')
        })
        expect.fail('Expected login to throw an error')
      } catch (error) {
        expect(error).toBeTruthy()
        expect((error as Error).message).toBe('Invalid credentials')
      }
    })


  })

  describe('logout', () => {
    it('should clear user data and session', async () => {
      // Use a separate hook instance to avoid rate limiting interference
      const { result } = renderHook(createTestStore())

      // First login
      await act(async () => {
        await result.current.login('admin@test.com', 'admin123')
      })

      // Then logout
      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.session).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('permissions', () => {
    it('should check user permissions correctly', async () => {
      // Use a separate hook instance to avoid rate limiting interference
      const { result } = renderHook(createTestStore())

      await act(async () => {
        await result.current.login('admin@test.com', 'admin123')
      })

      expect(result.current.hasPermission('beneficiaries:read' as any)).toBe(true)
      expect(result.current.hasRole('ADMIN' as any)).toBe(true)
    })
  })

  // Run rate limiting test last to avoid interference
  describe('rate limiting', () => {
    it('should handle rate limiting', async () => {
      const { result } = renderHook(createTestStore())

      // Simulate multiple failed attempts
      for (let i = 0; i < 6; i++) {
        try {
          await act(async () => {
            await result.current.login('wrong@email.com', 'wrongpass')
          })
        } catch (error) {
          // Expected error
        }
      }

      // This should trigger rate limiting
      try {
        await act(async () => {
          await result.current.login('wrong@email.com', 'wrongpass')
        })
        expect.fail('Expected rate limiting to trigger')
      } catch (error: any) {
        expect(error.message).toContain('Çok fazla deneme')
      }
    })
  })
})
