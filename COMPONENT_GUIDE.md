# Component Usage Guide

## Quick Reference

### PageLayout

```tsx
import { PageLayout } from '@/components/layouts/PageLayout';
import { Users } from 'lucide-react';

<PageLayout
  title="Page Title"
  description="Optional description"
  icon={Users}
  badge={{ text: 'Status', variant: 'default' }}
  actions={<Button>Action</Button>}
  showBackButton={true}
>
  {children}
</PageLayout>
```

**Props:**
- `title` (required): string - Page title
- `description` (optional): string - Page description
- `icon` (optional): LucideIcon - Icon component
- `badge` (optional): { text: string, variant?: string } - Status badge
- `actions` (optional): ReactNode - Action buttons
- `showBackButton` (optional): boolean - Show back button

---

### DataTable

```tsx
import { DataTable, Column } from '@/components/ui/data-table';

const columns: Column<MyDataType>[] = [
  {
    key: 'name',
    label: 'Name',
    render: (item) => <span className="font-medium">{item.name}</span>
  },
  {
    key: 'email',
    label: 'Email',
  }
];

<DataTable
  data={data}
  columns={columns}
  isLoading={isLoading}
  error={error}
  searchable={true}
  searchPlaceholder="Search..."
  pagination={{
    page,
    totalPages,
    total,
    onPageChange: setPage
  }}
  onRowClick={(item) => router.push(`/detail/${item.id}`)}
/>
```

**Props:**
- `data` (required): T[] - Array of data items
- `columns` (required): Column<T>[] - Column definitions
- `isLoading` (optional): boolean - Loading state
- `error` (optional): Error | null - Error state
- `emptyMessage` (optional): string - Empty state message
- `emptyDescription` (optional): string - Empty state description
- `pagination` (optional): { page, totalPages, total, onPageChange }
- `searchable` (optional): boolean - Enable search
- `searchValue` (optional): string - Controlled search value
- `onSearchChange` (optional): (value: string) => void
- `searchPlaceholder` (optional): string
- `striped` (optional): boolean - Striped rows (default: true)
- `hoverable` (optional): boolean - Hoverable rows (default: true)
- `onRowClick` (optional): (item: T, index: number) => void

---

### StatCard

```tsx
import { StatCard } from '@/components/ui/stat-card';
import { Users } from 'lucide-react';

<StatCard
  title="Total Users"
  value="1,234"
  icon={Users}
  variant="blue"
  trend={{ value: '+12%', direction: 'up' }}
  description="Optional description"
/>
```

**Props:**
- `title` (required): string - Card title
- `value` (required): string | number - Main value
- `icon` (required): LucideIcon - Icon component
- `variant` (optional): 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'cyan'
- `trend` (optional): { value: string, direction?: 'up' | 'down' | 'neutral' }
- `description` (optional): string
- `className` (optional): string

---

### PlaceholderPage

```tsx
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { Settings } from 'lucide-react';

<PlaceholderPage
  title="Settings"
  description="Manage application settings"
  icon={Settings}
  estimatedDate="Q2 2025"
  features={[
    'User preferences',
    'Theme customization',
    'Notification settings'
  ]}
/>
```

**Props:**
- `title` (required): string - Feature title
- `description` (optional): string - Feature description
- `icon` (optional): LucideIcon - Feature icon
- `estimatedDate` (optional): string - Estimated completion
- `features` (optional): string[] - Planned features

---

## Complete Examples

### List Page Example

```tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layouts/PageLayout';
import { DataTable, Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Download, Eye } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function UsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => api.users.getUsers({ page, limit, search }),
  });

  const users = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const columns: Column<UserType>[] = [
    {
      key: 'actions',
      label: '',
      render: (item) => (
        <Link href={`/users/${item.id}`}>
          <Button variant="ghost" size="icon-sm">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ),
      className: 'w-12',
    },
    {
      key: 'name',
      label: 'Name',
      render: (item) => (
        <span className="font-medium">{item.name}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'role',
      label: 'Role',
      render: (item) => (
        <Badge variant="secondary">{item.role}</Badge>
      ),
    },
  ];

  return (
    <PageLayout
      title="Users"
      description="Manage system users"
      icon={Users}
      actions={
        <>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </>
      }
    >
      <DataTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        error={error as Error}
        searchable={true}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users..."
        pagination={{
          page,
          totalPages,
          total,
          onPageChange: setPage,
        }}
        onRowClick={(user) => router.push(`/users/${user.id}`)}
      />
    </PageLayout>
  );
}
```

### Dashboard Example

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '@/components/layouts/PageLayout';
import { StatCard } from '@/components/ui/stat-card';
import { Home, Users, DollarSign, TrendingUp, Heart } from 'lucide-react';
import api from '@/lib/api';

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: api.dashboard.getStats,
  });

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users || '0',
      icon: Users,
      variant: 'blue' as const,
      trend: { value: '+12%', direction: 'up' as const }
    },
    {
      title: 'Revenue',
      value: `${stats?.revenue || '0'} ₺`,
      icon: DollarSign,
      variant: 'green' as const,
      trend: { value: '+8%', direction: 'up' as const }
    },
    {
      title: 'Donations',
      value: stats?.donations || '0',
      icon: Heart,
      variant: 'red' as const,
    },
    {
      title: 'Growth',
      value: stats?.growth || '0%',
      icon: TrendingUp,
      variant: 'purple' as const,
      trend: { value: '+15%', direction: 'up' as const }
    },
  ];

  return (
    <PageLayout
      title="Dashboard"
      description="Overview of your system"
      icon={Home}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Additional dashboard content */}
    </PageLayout>
  );
}
```

### Placeholder Example

```tsx
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { BarChart } from 'lucide-react';

export default function ReportsPage() {
  return (
    <PlaceholderPage
      title="Reports"
      description="View and export detailed reports"
      icon={BarChart}
      estimatedDate="March 2025"
      features={[
        'Custom report builder',
        'Export to PDF, Excel, CSV',
        'Scheduled reports',
        'Report templates',
        'Data visualization'
      ]}
    />
  );
}
```

---

## Styling Guidelines

### Using Variants
All components support Tailwind CSS classes for customization:

```tsx
// Add custom classes
<DataTable className="custom-class" />
<StatCard className="hover:scale-105" />
<PageLayout className="max-w-7xl" />
```

### Color Variants
Available color variants:
- `blue` - Default information color
- `red` - Destructive/error color
- `green` - Success color
- `purple` - Special features
- `orange` - Warnings
- `cyan` - Alternative accent

### Dark Mode
All components automatically support dark mode through CSS variables.

---

## Best Practices

### DataTable
1. Always provide meaningful column labels
2. Use custom render for complex cells
3. Keep row actions consistent
4. Provide loading states
5. Handle empty states gracefully

### PageLayout
1. Keep titles concise (< 40 chars)
2. Use descriptions for context
3. Group related actions together
4. Use appropriate icons
5. Only show back button when needed

### StatCard
1. Use appropriate color variants
2. Keep values readable (use formatting)
3. Provide trends when available
4. Use consistent icons
5. Add descriptions for clarity

### PlaceholderPage
1. Be specific about features
2. Provide realistic estimates
3. Use relevant icons
4. Keep descriptions brief
5. List key features (3-5 items)

---

## Animation & Transitions

All components use framer-motion for smooth animations:

- **Page transitions:** 0.3s duration
- **Hover effects:** 0.2s duration
- **Loading states:** Pulse animations
- **Row animations:** Staggered entry (0.02s delay)

To disable animations for accessibility:
```tsx
// Components respect prefers-reduced-motion automatically
```

---

## TypeScript Tips

### Type-safe Columns
```tsx
import type { MyDataType } from '@/types';

// Columns are fully typed
const columns: Column<MyDataType>[] = [
  {
    key: 'name', // ✅ Autocomplete works
    label: 'Name',
    render: (item) => item.name // ✅ item is typed as MyDataType
  }
];
```

### Type-safe Icons
```tsx
import type { LucideIcon } from 'lucide-react';

// Icon prop is properly typed
const icon: LucideIcon = Users;
```

---

## Troubleshooting

### DataTable not showing data
- ✓ Check data prop is an array
- ✓ Verify columns have correct keys
- ✓ Check isLoading state
- ✓ Verify error handling

### PageLayout animations not working
- ✓ Check framer-motion is installed
- ✓ Verify component is client-side
- ✓ Check for conflicting CSS

### StatCard colors not applying
- ✓ Use correct variant names
- ✓ Check CSS variables are defined
- ✓ Verify dark mode classes

---

## Additional Resources

- [Tailwind CSS Docs](https://tailwindcss.com)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Radix UI Docs](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Last Updated:** 2025-10-29
**Version:** 1.0.0
