import { rest } from 'msw';

export const handlers = [
  // CSRF token handler
  rest.get('/api/csrf', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        token: 'mock-csrf-token-123',
      })
    );
  }),

  // Auth handlers
  rest.post('https://cloud.appwrite.io/v1/account/sessions/email', async (req, res, ctx) => {
    const { email, password } = await req.json();

    if (email === 'admin@test.com' && password === 'admin123') {
      return res(
        ctx.json({
          $id: 'session-123',
          userId: 'user-123',
          expire: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          accessToken: 'mock-access-token',
        })
      );
    }

    return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }));
  }),

  rest.get('https://cloud.appwrite.io/v1/account', (req, res, ctx) => {
    return res(
      ctx.json({
        $id: 'user-123',
        name: 'Test Admin',
        email: 'admin@test.com',
      })
    );
  }),

  // Beneficiaries handlers
  rest.get(
    'https://cloud.appwrite.io/v1/databases/*/collections/beneficiaries/documents',
    (req, res, ctx) => {
      return res(
        ctx.json({
          documents: [
            {
              $id: 'beneficiary-1',
              name: 'Ahmet Yılmaz',
              tcNo: '12345678901',
              status: 'active',
            },
          ],
          total: 1,
        })
      );
    }
  ),

  // Logout handler
  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),

  // Dashboard metrics handler
  rest.get('https://cloud.appwrite.io/v1/functions/getDashboardMetrics', (req, res, ctx) => {
    return res(
      ctx.json({
        data: {
          totalBeneficiaries: 150,
          totalDonations: 75,
          totalDonationAmount: 125000,
          activeUsers: 12,
        },
      })
    );
  }),
];
