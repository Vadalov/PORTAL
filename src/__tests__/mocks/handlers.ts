import { http, HttpResponse } from 'msw';

export const handlers = [
  // CSRF token handler
  http.get('/api/csrf', () => {
    return HttpResponse.json({
      success: true,
      token: 'mock-csrf-token-123',
    });
  }),

  // Auth handlers
  http.post('https://cloud.appwrite.io/v1/account/sessions/email', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    const { email, password } = body;

    if (email === 'admin@test.com' && password === 'admin123') {
      return HttpResponse.json({
        $id: 'session-123',
        userId: 'user-123',
        expire: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        accessToken: 'mock-access-token',
      });
    }

    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  http.get('https://cloud.appwrite.io/v1/account', () => {
    return HttpResponse.json({
      $id: 'user-123',
      name: 'Test Admin',
      email: 'admin@test.com',
    });
  }),

  // Beneficiaries handlers
  http.get(
    'https://cloud.appwrite.io/v1/databases/*/collections/beneficiaries/documents',
    () => {
      return HttpResponse.json({
        documents: [
          {
            $id: 'beneficiary-1',
            name: 'Ahmet Yılmaz',
            tcNo: '12345678901',
            status: 'active',
          },
        ],
        total: 1,
      });
    }
  ),

  // Logout handler
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),

  // Dashboard metrics handler
  http.get('https://cloud.appwrite.io/v1/functions/getDashboardMetrics', () => {
    return HttpResponse.json({
      data: {
        totalBeneficiaries: 150,
        totalDonations: 75,
        totalDonationAmount: 125000,
        activeUsers: 12,
      },
    });
  }),
];
