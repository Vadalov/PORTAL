'use client';

import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { PageLayout } from '@/components/layouts/PageLayout';
import {
  Users,
  Heart,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Show loading if still loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Kimlik Doğrulama Hatası</h2>
          <p className="text-gray-600 mt-2">Lütfen tekrar giriş yapın.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Toplam İhtiyaç Sahibi',
      value: '0',
      icon: Users,
      variant: 'blue' as const,
    },
    {
      title: 'Toplam Bağış',
      value: '0',
      icon: Heart,
      variant: 'red' as const,
    },
    {
      title: 'Bağış Tutarı',
      value: '0 ₺',
      icon: DollarSign,
      variant: 'green' as const,
    },
    {
      title: 'Aktif Kullanıcı',
      value: '1',
      icon: TrendingUp,
      variant: 'purple' as const,
    },
  ];

  const quickActions = [
    {
      title: 'İhtiyaç Sahipleri',
      description: 'Kayıtlı ihtiyaç sahiplerini görüntüle ve yönet',
      icon: Users,
      href: '/yardim/ihtiyac-sahipleri',
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Bağışlar',
      description: 'Bağış kayıtlarını görüntüle ve yönet',
      icon: Heart,
      href: '/bagis/liste',
      color: 'from-red-500 to-red-600',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'Raporlar',
      description: 'Detaylı raporları ve istatistikleri incele',
      icon: BarChart3,
      href: '/bagis/raporlar',
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-600 dark:text-green-400',
    },
  ];

  const recentActivities = [
    {
      type: 'success',
      title: 'Yeni bağış kaydedildi',
      description: '500 ₺ bağış kaydı oluşturuldu',
      time: '2 dakika önce',
      icon: CheckCircle2,
    },
    {
      type: 'info',
      title: 'İhtiyaç sahibi güncellendi',
      description: 'Ahmet Yılmaz bilgileri güncellendi',
      time: '15 dakika önce',
      icon: AlertCircle,
    },
    {
      type: 'success',
      title: 'Yeni kullanıcı eklendi',
      description: 'Yeni yetkili kullanıcı oluşturuldu',
      time: '1 saat önce',
      icon: Users,
    },
  ];

  return (
    <PageLayout
      title={`Hoş geldiniz, ${user?.name || 'Kullanıcı'}!`}
      description="Sistemin genel durumunu buradan takip edebilirsiniz"
      badge={{ text: 'Sistem Aktif', variant: 'default' }}
    >
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            variant={stat.variant}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card variant="elevated" className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Hızlı Erişim</CardTitle>
                  <CardDescription className="mt-1">
                    Sık kullanılan işlemlere hızlıca erişin
                  </CardDescription>
                </div>
                <Zap className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.title} href={action.href}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          'group relative p-5 rounded-xl border-2 transition-all duration-300',
                          'hover:shadow-lg hover:border-primary/50 cursor-pointer',
                          'bg-gradient-to-br from-background to-muted/20'
                        )}
                      >
                        <div
                          className={cn(
                            'inline-flex p-3 rounded-xl mb-3 transition-transform duration-300 group-hover:scale-110',
                            action.iconBg
                          )}
                        >
                          <Icon className={cn('h-5 w-5', action.iconColor)} />
                        </div>
                        <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                        <ArrowUpRight className="h-4 w-4 absolute top-4 right-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card variant="elevated" className="border-2 h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Son Aktiviteler</CardTitle>
                  <CardDescription className="mt-1">Sistemdeki son işlemler</CardDescription>
                </div>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className={cn(
                          'p-2 rounded-lg',
                          activity.type === 'success' && 'bg-green-500/10',
                          activity.type === 'info' && 'bg-blue-500/10',
                          activity.type === 'warning' && 'bg-yellow-500/10'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            activity.type === 'success' && 'text-green-600 dark:text-green-400',
                            activity.type === 'info' && 'text-blue-600 dark:text-blue-400',
                            activity.type === 'warning' && 'text-yellow-600 dark:text-yellow-400'
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card variant="elevated" className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">Sistem Durumu</CardTitle>
                <CardDescription className="mt-1">
                  Sistemin mevcut durumu ve performans metrikleri
                </CardDescription>
              </div>
              <Target className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Veritabanı</p>
                    <p className="text-xs text-muted-foreground">Bağlantı aktif</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-600">
                  Aktif
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Kimlik Doğrulama</p>
                    <p className="text-xs text-muted-foreground">Servis aktif</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-600">
                  Aktif
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">API Servisleri</p>
                    <p className="text-xs text-muted-foreground">Tüm servisler aktif</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-600">
                  Aktif
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </PageLayout>
  );
}
