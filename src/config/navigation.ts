// Navigation modules configuration
// Single source of truth for all navigation items

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
} from 'lucide-react';
import type { ComponentType } from 'react';

export interface SubPage {
  name: string;
  href: string;
  description?: string;
  badge?: number | string;
}

export interface NavigationModule {
  id: string;
  name: string;
  icon: ComponentType<{ className?: string }>;
  subPages: SubPage[];
  badge?: number | string;
  description?: string;
  category?: 'core' | 'management' | 'reports' | 'settings';
}

export const navigationModules: NavigationModule[] = [
  {
    id: 'genel',
    name: 'Ana Sayfa',
    icon: Home,
    category: 'core',
    subPages: [{ name: 'Dashboard', href: '/genel', description: 'Sistem genel görünümü' }],
  },
  {
    id: 'bagis',
    name: 'Bağış Yönetimi',
    icon: Heart,
    category: 'management',
    description: 'Bağış süreçlerini yönet',
    subPages: [
      { name: 'Bağış Listesi', href: '/bagis/liste', description: 'Tüm bağış kayıtları' },
      { name: 'Bağış Raporları', href: '/bagis/raporlar', description: 'Detaylı analiz ve raporlar' },
      { name: 'Kumbara', href: '/bagis/kumbara', description: 'Bağış kampanyaları' },
    ],
  },
  {
    id: 'yardim',
    name: 'Yardım Programları',
    icon: HelpingHand,
    category: 'management',
    description: 'Yardım süreçlerini koordine et',
    subPages: [
      { name: 'İhtiyaç Sahipleri', href: '/yardim/ihtiyac-sahipleri', description: 'Kayıtlı ihtiyaç sahipleri' },
      { name: 'Başvurular', href: '/yardim/basvurular', description: 'Yardım başvurularını yönet' },
      { name: 'Yardım Listesi', href: '/yardim/liste', description: 'Verilen yardımlar' },
      { name: 'Nakit Vezne', href: '/yardim/nakdi-vezne', description: 'Nakit yardım yönetimi' },
    ],
  },
  {
    id: 'burs',
    name: 'Burs Sistemi',
    icon: GraduationCap,
    category: 'management',
    description: 'Burs başvuru ve takip sistemi',
    subPages: [
      { name: 'Öğrenciler', href: '/burs/ogrenciler', description: 'Kayıtlı öğrenciler' },
      { name: 'Başvurular', href: '/burs/basvurular', description: 'Burs başvuruları' },
      { name: 'Yetimler', href: '/burs/yetim', description: 'Yetim burs sistemi' },
    ],
  },
  {
    id: 'fon',
    name: 'Finansal Yönetim',
    icon: Wallet,
    category: 'management',
    description: 'Mali işlemler ve raporlama',
    subPages: [
      { name: 'Gelir Gider', href: '/fon/gelir-gider', description: 'Mali durum takibi' },
      { name: 'Raporlar', href: '/fon/raporlar', description: 'Mali raporlar' },
    ],
  },
  {
    id: 'mesaj',
    name: 'İletişim',
    icon: MessageSquare,
    category: 'core',
    description: 'İletişim ve bildirim sistemi',
    subPages: [
      { name: 'Kurum İçi', href: '/mesaj/kurum-ici', description: 'İç iletişim' },
      { name: 'Toplu Mesaj', href: '/mesaj/toplu', description: 'Toplu bildirimler' },
    ],
  },
  {
    id: 'is',
    name: 'İş Yönetimi',
    icon: Calendar,
    category: 'core',
    description: 'Görev ve toplantı yönetimi',
    subPages: [
      { name: 'Görevler', href: '/is/gorevler', description: 'Proje görevleri' },
      { name: 'Toplantılar', href: '/is/toplantilar', description: 'Toplantı takvimi' },
    ],
  },
  {
    id: 'partner',
    name: 'Ortak Yönetimi',
    icon: Building2,
    category: 'management',
    description: 'Partner kuruluş yönetimi',
    subPages: [{ name: 'Ortak Listesi', href: '/partner/liste', description: 'Partner kuruluşlar' }],
  },
  {
    id: 'kullanici',
    name: 'Kullanıcı Yönetimi',
    icon: Users,
    category: 'settings',
    description: 'Kullanıcı ve yetki yönetimi',
    subPages: [{ name: 'Kullanıcı Yönetimi', href: '/kullanici', description: 'Kullanıcı rolleri ve yetkileri' }],
  },
  {
    id: 'ayarlar',
    name: 'Sistem Ayarları',
    icon: Settings,
    category: 'settings',
    description: 'Sistem konfigürasyonu',
    subPages: [{ name: 'Ayarlar', href: '/settings', description: 'Sistem ayarları' }],
  },
];

