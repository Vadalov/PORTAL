'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { Sidebar } from '@/components/layouts/Sidebar';
import { LogOut, Menu, ChevronDown, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { BackgroundPattern } from '@/components/ui/background-pattern';
import { AnimatedGradient } from '@/components/ui/animated-gradient';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { SuspenseBoundary } from '@/components/ui/suspense-boundary';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types/auth';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      console.log('🔐 [Dashboard] Initializing auth...', { isInitialized, isAuthenticated });
      console.log('💾 [Dashboard] LocalStorage:', localStorage.getItem('auth-session'));
      console.log('🔄 [Dashboard] Hydration status:', useAuthStore.persist?.hasHydrated?.());
    }

    initializeAuth();

    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 [Dashboard] Auth initialized:', { isInitialized, isAuthenticated, user });
    }
  }, [initializeAuth, isInitialized, isAuthenticated, user]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔀 [Dashboard] Redirecting to login...', { isInitialized, isAuthenticated });
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
        console.log('📱 [Dashboard] Sidebar state changed:', stored === 'true');
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
        setIsScrolled((prev) => prev !== scrolled ? scrolled : prev);
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
      console.log('⏳ [Dashboard] Loading...', { isInitialized, isAuthenticated });
    }
    return <LoadingOverlay variant="pulse" fullscreen={true} text="Yükleniyor..." />;
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Layers */}
      <BackgroundPattern
        variant="dots"
        opacity={0.08}
        className="text-muted-foreground"
      />
      <AnimatedGradient
        variant="subtle"
        speed="slow"
        className="opacity-25 dark:opacity-20"
      />

      {/* Header - Premium Top Bar */}
      <header
        className={cn(
          'sticky top-0 z-50 relative',
          'border-b border-border/50',
          'bg-card/80 backdrop-blur-xl backdrop-saturate-150',
          'transition-all duration-300',
          isScrolled ? 'shadow-card-hover border-border' : 'shadow-sm'
        )}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 relative z-10"
        >
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              aria-label="Toggle mobile menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-heading font-bold text-foreground">
              Dernek Yönetim Sistemi
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Popover open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
              <PopoverTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full p-1.5 hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="Kullanıcı menüsü"
                >
                  <Avatar size="sm">
                    <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'User'} />
                    <AvatarFallback className="text-xs font-semibold">
                      {user?.name ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground hidden sm:block transition-transform duration-200",
                    isUserMenuOpen && "rotate-180"
                  )} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="end" sideOffset={8}>
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar size="md">
                      <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'User'} />
                      <AvatarFallback className="font-semibold">
                        {user?.name ? getInitials(user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {user?.name || 'Kullanıcı'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email || ''}
                      </p>
                      <Badge
                        variant={getRoleBadgeVariant(user?.role || UserRole.VIEWER)}
                        className="text-xs mt-1"
                      >
                        {user?.role || 'Viewer'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="p-2">
                  <Link
                    href="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Ayarlar</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </motion.div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <SuspenseBoundary loadingVariant="spinner">
          <Sidebar
            isMobileOpen={isMobileSidebarOpen}
            onMobileToggle={() => setIsMobileSidebarOpen(false)}
          />
        </SuspenseBoundary>

        {/* Spacer for fixed sidebar on desktop */}
        <div
          className={cn(
            'hidden lg:block transition-all duration-300',
            isSidebarCollapsed ? 'w-20' : 'w-64'
          )}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto w-full relative transition-all duration-300">
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
                onSuspend={() => console.log('📄 [Dashboard] Page suspended:', pathname)}
                onResume={() => console.log('✅ [Dashboard] Page resumed:', pathname)}
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
