/**
 * Mock Authentication API
 * Temporary fallback for development when Appwrite users don't exist yet
 */

import { User, UserRole, ROLE_PERMISSIONS } from '@/types/auth';

interface MockUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

const mockUsers: MockUser[] = [
  {
    id: 'mock-admin-1',
    email: 'admin@test.com',
    password: 'admin123',
    name: 'Admin User',
    role: UserRole.ADMIN,
  },
  {
    id: 'mock-manager-1',
    email: 'manager@test.com',
    password: 'manager123',
    name: 'Manager User',
    role: UserRole.MANAGER,
  },
  {
    id: 'mock-member-1',
    email: 'member@test.com',
    password: 'member123',
    name: 'Member User',
    role: UserRole.MEMBER,
  },
  {
    id: 'mock-viewer-1',
    email: 'viewer@test.com',
    password: 'viewer123',
    name: 'Viewer User',
    role: UserRole.VIEWER,
  },
];

export const mockAuthApi = {
  async login(email: string, password: string) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const user = mockUsers.find((u) => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid credentials. Please check the email and password.');
    }

    // Convert to store user format
    const storeUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: '',
      permissions: ROLE_PERMISSIONS[user.role] || [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create mock session
    const session = {
      $id: `mock-session-${user.id}`,
      userId: user.id,
      providerAccessToken: 'mock-token',
      providerAccessTokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      providerRefreshToken: 'mock-refresh-token',
      ip: '127.0.0.1',
      osCode: 'unknown',
      osName: 'unknown',
      osVersion: 'unknown',
      clientType: 'web',
      clientCode: 'unknown',
      clientName: 'unknown',
      clientVersion: 'unknown',
      clientEngine: 'unknown',
      clientEngineVersion: 'unknown',
      deviceName: 'unknown',
      deviceBrand: 'unknown',
      deviceModel: 'unknown',
      countryCode: 'TR',
      countryName: 'Turkey',
      current: true,
      factors: [],
      secret: 'mock-secret',
      mfaUpdatedAt: new Date().toISOString(),
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
    };

    return { session, user: storeUser };
  },

  async logout() {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { success: true };
  },

  async getCurrentUser() {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    throw new Error('No active session');
  },

  async createAccount(email: string, password: string, name: string) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser: MockUser = {
      id: `mock-user-${Date.now()}`,
      email,
      password,
      name,
      role: UserRole.MEMBER,
    };

    mockUsers.push(newUser);

    return {
      $id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
    };
  },

  async getDashboardMetrics() {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      data: {
        totalBeneficiaries: 45,
        totalDonations: 128,
        totalDonationAmount: 125000,
        activeUsers: 12,
      },
      error: null,
    };
  },

  async getBeneficiaries(_params?: unknown) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const mockBeneficiaries = [
      {
        $id: 'ben-1',
        name: 'Ahmet Yılmaz',
        tc_no: '12345678901',
        phone: '0532 123 45 67',
        address: 'Caferağa Mahallesi, Moda Caddesi No:15',
        city: 'İstanbul',
        district: 'Kadıköy',
        neighborhood: 'Caferağa',
        income_level: '0-3000' as const,
        family_size: 4,
        health_status: 'İyi durumda',
        employment_status: 'İşsiz',
        notes: 'Üç çocuklu bir aile',
        status: 'active' as const,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
      },
      {
        $id: 'ben-2',
        name: 'Fatma Demir',
        tc_no: '23456789012',
        phone: '0533 987 65 43',
        address: 'Çankaya Mahallesi, Atatürk Bulvarı No:25',
        city: 'Ankara',
        district: 'Çankaya',
        neighborhood: 'Çankaya',
        income_level: '3000-5000' as const,
        family_size: 3,
        health_status: 'Düzenli ilaç kullanıyor',
        employment_status: 'Ev Hanımı',
        notes: 'Engelli çocuğu var',
        status: 'active' as const,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
      },
      {
        $id: 'ben-3',
        name: 'Mehmet Kaya',
        tc_no: '34567890123',
        phone: '0534 555 77 99',
        address: 'Alsancak Mahallesi, Kıbrıs Şehitleri Caddesi No:10',
        city: 'İzmir',
        district: 'Konak',
        neighborhood: 'Alsancak',
        income_level: '0-3000' as const,
        family_size: 5,
        health_status: 'Kalp rahatsızlığı',
        employment_status: 'Emekli',
        notes: 'Acil yardım bekliyor',
        status: 'active' as const,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
      },
    ];

    return {
      data: mockBeneficiaries,
      total: mockBeneficiaries.length,
      error: null,
    };
  },

  async getDonations(_params?: unknown) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const mockDonations = [
      {
        $id: 'don-1',
        donor_name: 'Ali Veli',
        donor_phone: '0532 111 22 33',
        donor_email: 'ali@example.com',
        amount: 500,
        currency: 'TRY' as const,
        donation_type: 'Nakit',
        payment_method: 'Kredi Kartı',
        donation_purpose: 'Genel',
        notes: 'Teşekkürler',
        receipt_number: 'RCP-001',
        receipt_file_id: 'file-12345',
        status: 'completed' as const,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
      },
      {
        $id: 'don-2',
        donor_name: 'Ayşe Özkan',
        donor_phone: '0533 444 55 66',
        donor_email: 'ayse@example.com',
        amount: 1000,
        currency: 'TRY' as const,
        donation_type: 'Nakit',
        payment_method: 'Banka Havalesi',
        donation_purpose: 'Eğitim',
        notes: 'Eğitim yardımı için',
        receipt_number: 'RCP-002',
        receipt_file_id: 'file-67890',
        status: 'completed' as const,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
      },
      {
        $id: 'don-3',
        donor_name: 'Mustafa Çelik',
        donor_phone: '0534 777 88 99',
        donor_email: 'mustafa@example.com',
        amount: 250,
        currency: 'TRY' as const,
        donation_type: 'Nakit',
        payment_method: 'Nakit',
        donation_purpose: 'Sağlık',
        notes: 'Acil durum yardımı',
        receipt_number: 'RCP-003',
        status: 'pending' as const,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
      },
    ];

    return {
      data: mockDonations,
      total: mockDonations.length,
      error: null,
    };
  },
};
