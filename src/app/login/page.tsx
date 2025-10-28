'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('admin123');
  const [mounted, setMounted] = useState(false);
  const { login, isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    initializeAuth();
  }, [initializeAuth]);

  // Redirect if already authenticated
  useEffect(() => {
    if (mounted && isAuthenticated) {
      const from = new URLSearchParams(window.location.search).get('from') || '/genel';
      router.push(from);
    }
  }, [mounted, isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      toast.success('Giriş başarılı!');

      // Use router.push instead of window.location.href to preserve state
      router.push('/genel');
    } catch (err: any) {
      toast.error(err.message || 'Giriş başarısız');
    }
  };

  // Don't render until mounted (prevent hydration mismatch)
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Don't render the form if already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Dernek Yönetim Sistemi
          </CardTitle>
          <p className="text-center text-sm text-gray-500">
            Hesabınıza giriş yapın
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 mb-2">
                Test Hesapları:
              </p>
              <div className="space-y-1 text-xs text-blue-800">
                <p>Admin: admin@test.com / admin123</p>
                <p>Manager: manager@test.com / manager123</p>
                <p>Member: member@test.com / member123</p>
                <p>Viewer: viewer@test.com / viewer123</p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
