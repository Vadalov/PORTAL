'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Heart,
  HelpingHand,
  GraduationCap,
  Wallet,
  MessageSquare,
  Calendar,
  Users,
  Building2,
  Settings,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SubPage {
  name: string;
  href: string;
}

interface Module {
  id: string;
  name: string;
  icon: React.ReactNode;
  subPages: SubPage[];
  badge?: number;
}

const modules: Module[] = [
  {
    id: 'genel',
    name: 'Ana Sayfa',
    icon: <Home className="w-5 h-5" />,
    subPages: [{ name: 'Dashboard', href: '/genel' }],
  },
  {
    id: 'bagis',
    name: 'Bağışlar',
    icon: <Heart className="w-5 h-5" />,
    subPages: [
      { name: 'Bağış Listesi', href: '/bagis/liste' },
      { name: 'Bağış Raporları', href: '/bagis/raporlar' },
      { name: 'Kumbara', href: '/bagis/kumbara' },
    ],
  },
  {
    id: 'yardim',
    name: 'Yardım',
    icon: <HelpingHand className="w-5 h-5" />,
    subPages: [
      { name: 'İhtiyaç Sahipleri', href: '/yardim/ihtiyac-sahipleri' },
      { name: 'Başvurular', href: '/yardim/basvurular' },
      { name: 'Yardım Listesi', href: '/yardim/liste' },
      { name: 'Nakit Vezne', href: '/yardim/nakdi-vezne' },
    ],
  },
  {
    id: 'burs',
    name: 'Burs',
    icon: <GraduationCap className="w-5 h-5" />,
    subPages: [
      { name: 'Öğrenciler', href: '/burs/ogrenciler' },
      { name: 'Başvurular', href: '/burs/basvurular' },
      { name: 'Yetimler', href: '/burs/yetim' },
    ],
  },
  {
    id: 'fon',
    name: 'Finans',
    icon: <Wallet className="w-5 h-5" />,
    subPages: [
      { name: 'Gelir Gider', href: '/fon/gelir-gider' },
      { name: 'Raporlar', href: '/fon/raporlar' },
    ],
  },
  {
    id: 'mesaj',
    name: 'Mesajlar',
    icon: <MessageSquare className="w-5 h-5" />,
    subPages: [
      { name: 'Kurum İçi', href: '/mesaj/kurum-ici' },
      { name: 'Toplu Mesaj', href: '/mesaj/toplu' },
    ],
  },
  {
    id: 'is',
    name: 'İş Yönetimi',
    icon: <Calendar className="w-5 h-5" />,
    subPages: [
      { name: 'Görevler', href: '/is/gorevler' },
      { name: 'Toplantılar', href: '/is/toplantilar' },
    ],
  },
  {
    id: 'partner',
    name: 'Ortaklar',
    icon: <Building2 className="w-5 h-5" />,
    subPages: [{ name: 'Ortak Listesi', href: '/partner/liste' }],
  },
  {
    id: 'kullanici',
    name: 'Kullanıcılar',
    icon: <Users className="w-5 h-5" />,
    subPages: [{ name: 'Kullanıcı Yönetimi', href: '/kullanici' }],
  },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

export function Sidebar({ isMobileOpen = false, onMobileToggle }: SidebarProps) {
  const pathname = usePathname();
  const [expandedModules, setExpandedModules] = useState<string[]>(['genel']);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored !== null) {
      setIsCollapsed(stored === 'true');
    }
  }, []);

  // Toggle sidebar and save to localStorage
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
    // Dispatch storage event for cross-tab sync
    window.dispatchEvent(new Event('storage'));
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const isActive = (href: string) => pathname === href;

  // Quick action handlers (placeholder)
  const handleSearch = () => {
    console.log('Search clicked');
  };

  const handleNotifications = () => {
    console.log('Notifications clicked');
  };

  return (
    <TooltipProvider delayDuration={300}>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileToggle}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-40 overflow-y-auto transition-all duration-300 ease-in-out backdrop-blur-xl',
          isCollapsed ? 'w-20 sidebar-collapsed' : 'w-64 sidebar-expanded',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Sidebar"
        aria-expanded={!isCollapsed}
      >
        {/* Quick Actions Bar */}
        <div
          className={cn('px-4 pb-4 pt-4', isCollapsed && 'flex flex-col items-center')}
          aria-label="Quick actions"
        >
          {!isCollapsed ? (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearch}
                className="flex-1 justify-start hover:bg-accent hover:text-accent-foreground transition-colors"
                data-testid="search-button"
              >
                <Search className="w-4 h-4 mr-2" />
                Ara
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNotifications}
                className="relative hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="Bildirimler (3)"
                data-testid="notification-button"
              >
                <Bell className="w-4 h-4" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 px-1.5 text-xs"
                  data-testid="notification-badge"
                >
                  3
                </Badge>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSearch}
                    className="w-10 h-10 p-0 hover:bg-accent hover:text-accent-foreground transition-colors"
                    aria-label="Ara"
                    data-testid="search-button-collapsed"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Ara</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNotifications}
                    className="relative hover:bg-primary/10 hover:text-primary transition-colors"
                    aria-label="Bildirimler (3)"
                    data-testid="notification-button"
                  >
                    <Bell className="w-4 h-4" />
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 px-1.5 text-xs"
                      data-testid="notification-badge-collapsed"
                    >
                      3
                    </Badge>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Bildirimler (3)</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Navigation Modules */}
        <nav className="px-4 space-y-1">
          {modules.map((module, moduleIndex) => {
            const isExpanded = expandedModules.includes(module.id);
            const hasActiveSubpage = module.subPages.some((sub) => isActive(sub.href));

            return (
              <div key={module.id} className="transition-all duration-200 ease-in-out">
                {!isCollapsed ? (
                  // Expanded view - full module with subpages
                  <>
                    <button
                      onClick={() => toggleModule(module.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-heading font-medium transition-all duration-200 ease-in-out',
                        hasActiveSubpage
                          ? 'bg-sidebar-primary/10 text-sidebar-primary shadow-sm border-l-4 border-sidebar-primary'
                          : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent hover:shadow-sm border-l-4 border-transparent hover:border-sidebar-border'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {module.icon}
                        <span className="letter-spacing-tight">{module.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {module.badge && (
                          <Badge variant="secondary" className="h-5 min-w-5 px-1.5">
                            {module.badge}
                          </Badge>
                        )}
                        <div className="transition-transform duration-200">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="mt-1 ml-4 space-y-0.5">
                        {module.subPages.map((subPage, subIndex) => (
                          <Link
                            key={subPage.href}
                            href={subPage.href}
                            onClick={onMobileToggle}
                            className={cn(
                              'block px-3 py-2 rounded-md text-sm font-body transition-all duration-200',
                              isActive(subPage.href)
                                ? 'bg-sidebar-primary/15 text-sidebar-primary font-medium shadow-sm'
                                : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/70 hover:pl-4',
                              // Stagger animation delays
                              subIndex === 0 && 'delay-75',
                              subIndex === 1 && 'delay-100',
                              subIndex === 2 && 'delay-150'
                            )}
                          >
                            {subPage.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  // Collapsed view - icon only with tooltip
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          if (module.subPages.length === 1) {
                            window.location.href = module.subPages[0].href;
                          } else {
                            toggleModule(module.id);
                          }
                        }}
                        className={cn(
                          'w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 ease-in-out',
                          hasActiveSubpage
                            ? 'bg-sidebar-primary/15 text-sidebar-primary shadow-sm'
                            : 'text-sidebar-foreground/70 hover:text-sidebar-primary hover:bg-sidebar-accent'
                        )}
                        aria-label={module.name}
                      >
                        {module.icon}
                        {module.badge && (
                          <Badge
                            variant="secondary"
                            className="absolute top-1 right-1 h-5 min-w-5 px-1.5 text-xs"
                          >
                            {module.badge}
                          </Badge>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <div>
                        <p className="font-semibold">{module.name}</p>
                        {module.subPages.length > 1 && (
                          <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                            {module.subPages.map((sub) => (
                              <li key={sub.href}>• {sub.name}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Section: Collapse Toggle & Settings */}
        <div className="sticky bottom-0 bg-sidebar border-t border-sidebar-border mt-auto">
          {/* Collapse Toggle */}
          <div className="p-4">
            {!isCollapsed ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-colors"
                aria-label="Toggle sidebar"
                data-testid="sidebar-toggle"
              >
                <PanelLeftClose className="w-4 h-4 mr-2" />
                Daralt
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSidebar}
                    className="w-full justify-center hover:bg-primary/10 hover:text-primary transition-colors"
                    aria-label="Toggle sidebar"
                    data-testid="sidebar-toggle"
                  >
                    <PanelLeftOpen className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Genişlet</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Settings Link */}
          <div className="px-4 pb-4 pb-safe">
            {!isCollapsed ? (
              <Link
                href="/settings"
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-heading font-semibold transition-colors',
                  isActive('/settings')
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-primary/10 hover:text-primary'
                )}
              >
                <Settings className="w-5 h-5" />
                <span>Ayarlar</span>
              </Link>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/settings"
                    className={cn(
                      'flex items-center justify-center p-3 rounded-lg transition-colors',
                      isActive('/settings')
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-primary/10 hover:text-primary'
                    )}
                    aria-label="Ayarlar"
                  >
                    <Settings className="w-5 h-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Ayarlar</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
