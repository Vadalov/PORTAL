'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { ModernSidebar } from '@/components/ui/modern-sidebar';
import { LogOut, Menu, ChevronDown, Settings, Building2, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { SuspenseBoundary } from '@/components/ui/suspense-boundary';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types/auth';
import Link from 'next/link';
import logger from '@/lib/logger';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized, user, logout, initializeAuth } = useAuthStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const stored = window.localStorage.getItem('sidebar-collapsed');
    return stored === 'true';
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Helper function to get initials from name
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Helper function to get role badge variant
  const getRoleBadgeVariant = (
    role: UserRole
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
      case UserRole.ADMIN:
        return 'destructive';
      case UserRole.MANAGER:
        return 'default';
      case UserRole.MEMBER:
      case UserRole.VOLUNTEER:
        return 'secondary';
      case UserRole.VIEWER:
        return 'outline';
      default:
        return 'default';
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Dashboard: Initializing auth', { isInitialized, isAuthenticated });
      logger.debug('Dashboard: LocalStorage check', { 
        hasSession: !!localStorage.getItem('auth-session') 
      });
      logger.debug('Dashboard: Hydration status', { 
        hydrated: useAuthStore.persist?.hasHydrated?.() 
      });
    }

    initializeAuth();

    if (process.env.NODE_ENV === 'development') {
      logger.debug('Dashboard: Auth initialized', { isInitialized, isAuthenticated, userId: user?.id });
    }
  }, [initializeAuth, isInitialized, isAuthenticated, user]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Dashboard: Redirecting to login', { isInitialized, isAuthenticated });
      }
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  // Sync sidebar collapsed state across tabs
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = () => {
      const stored = window.localStorage.getItem('sidebar-collapsed');
      setIsSidebarCollapsed(stored === 'true');

      if (process.env.NODE_ENV === 'development') {
        logger.debug('Dashboard: Sidebar state changed', { collapsed: stored === 'true' });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Detect scroll for header shadow effect
  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const scrolled = window.scrollY > 20;
        setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const handleLogout = () => {
    logout(() => {
      toast.success('Başarıyla çıkış yaptınız');
      router.push('/login');
    });
  };

  if (!isInitialized || !isAuthenticated) {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Dashboard: Loading state', { isInitialized, isAuthenticated });
    }
    return <LoadingOverlay variant="pulse" fullscreen={true} text="Yükleniyor..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50">

      {/* Premium Header */}
      <header
        className={cn(
          'sticky top-0 z-50 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/60',
          'transition-all duration-300 ease-out',
          isScrolled && 'shadow-lg shadow-slate-200/50 bg-white/98'
        )}
      >
        <div className="flex h-full items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100/80 transition-all duration-200 active:scale-95"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </button>
            <button
              className="hidden lg:flex p-2 rounded-lg hover:bg-slate-100/80 transition-all duration-200 active:scale-95"
              onClick={() => {
                const newState = !isSidebarCollapsed;
                setIsSidebarCollapsed(newState);
                if (typeof window !== 'undefined') {
                  window.localStorage.setItem('sidebar-collapsed', String(newState));
                  window.dispatchEvent(new Event('storage'));
                }
              }}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-5 w-5 text-slate-600" />
              ) : (
                <PanelLeftClose className="h-5 w-5 text-slate-600" />
              )}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-500/20">
                <Building2 className="w-4.5 h-4.5 text-white" />
              </div>
              <h1 className="hidden md:block text-lg font-semibold text-slate-800 tracking-tight">Dernek Yönetim Sistemi</h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ara..."
                className="w-full h-9 pl-9 pr-3 text-sm bg-slate-100/80 border border-slate-200/60 rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Popover open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-100/80 transition-all duration-200 active:scale-95">
                  <Avatar size="sm" className="h-8 w-8 ring-2 ring-slate-200">
                    <AvatarImage src={user?.avatar ?? undefined} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xs font-semibold">
                      {user?.name ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className={cn('h-4 w-4 text-slate-500 transition-transform duration-200', isUserMenuOpen && 'rotate-180')} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0 border-slate-200/60 shadow-xl" align="end">
                <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 ring-2 ring-slate-200">
                      <AvatarImage src={user?.avatar ?? undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                        {user?.name ? getInitials(user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">{user?.name || 'Kullanıcı'}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email || ''}</p>
                      <Badge variant={getRoleBadgeVariant(user?.role || UserRole.VIEWER)} className="text-xs mt-2">
                        {user?.role || 'Viewer'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="p-1.5">
                  <Link
                    href="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-slate-100/80 transition-colors duration-200 text-slate-700"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Ayarlar</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-red-50/80 hover:text-red-600 transition-colors duration-200 text-left text-slate-700"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <SuspenseBoundary loadingVariant="spinner">
          <ModernSidebar
            isMobileOpen={isMobileSidebarOpen}
            onMobileToggle={() => setIsMobileSidebarOpen(false)}
          />
        </SuspenseBoundary>

        {/* Spacer for fixed sidebar */}
        <div
          className={cn('hidden lg:block transition-all duration-300', isSidebarCollapsed ? 'w-16' : 'w-64')}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-4rem)]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SuspenseBoundary
                loadingVariant="pulse"
                loadingText="Sayfa yükleniyor..."
                onSuspend={() => {
                  if (process.env.NODE_ENV === 'development') {
                    logger.debug('Dashboard: Page suspended', { pathname });
                  }
                }}
                onResume={() => {
                  if (process.env.NODE_ENV === 'development') {
                    logger.debug('Dashboard: Page resumed', { pathname });
                  }
                }}
              >
                {children}
              </SuspenseBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
