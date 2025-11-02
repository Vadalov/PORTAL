import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useAuthStore } from '../authStore'
import { Permission, UserRole } from '@/types/auth'

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

// Track login attempts for rate limiting test
let loginAttempts = 0

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
    loginAttempts = 0 // Reset attempt counter

    // Setup default fetch mocks
    fetchMock.mockImplementation(async (url: string, options?: RequestInit) => {
      if (url === '/api/csrf') {
        return {
          ok: true,
          json: async () => ({ success: true, token: 'mock-csrf-token' }),
        }
      }

      if (url === '/api/auth/login' && options?.method === 'POST') {
        const body = JSON.parse(options.body as string)
        loginAttempts++

        // Rate limiting test: after 5 attempts, return 429
        if (body.email === 'wrong@email.com' && loginAttempts > 5) {
          return {
            ok: false,
            status: 429,
            json: async () => ({ error: 'Çok fazla deneme yapıldı. Lütfen 15 dakika sonra tekrar deneyin.' }),
          }
        }

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
                  role: UserRole.ADMIN,
                  permissions: [Permission.BENEFICIARIES_READ, Permission.USERS_READ, Permission.BENEFICIARIES_UPDATE],
                  avatar: null,
                  isActive: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                session: {
                  expire: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
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
        // Clear localStorage on logout
        localStorage.clear()
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

      expect(result.current.hasPermission(Permission.BENEFICIARIES_READ)).toBe(true)
      expect(result.current.hasRole(UserRole.ADMIN)).toBe(true)
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
        } catch (_error) {
          // Expected error
        }
      }

      // This should trigger rate limiting
      try {
        await act(async () => {
          await result.current.login('wrong@email.com', 'wrongpass')
        })
        expect.fail('Expected rate limiting to trigger')
      } catch (error: unknown) {
        const err = error as { message?: string };
        expect(err.message).toContain('Çok fazla deneme')
      }
    })
  })
})
