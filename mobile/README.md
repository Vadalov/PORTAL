# PORTAL Mobile - Dernek Yönetim Sistemi

React Native mobile application for the PORTAL association management system.

## Tech Stack

- **Framework:** React Native with Expo (~51.0.0)
- **Router:** Expo Router (~3.5.11)
- **Backend:** Appwrite (Cloud BaaS)
- **Language:** TypeScript (Strict mode)
- **State Management:** Zustand with Immer middleware
- **Data Fetching:** TanStack Query (React Query v5)
- **Forms:** React Hook Form + Zod validation
- **Icons:** Expo Vector Icons (Ionicons)
- **Navigation:** React Navigation (via Expo Router)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your Appwrite credentials
```

### Environment Configuration

Create a `.env` file in the `mobile/` directory:

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
EXPO_PUBLIC_DATABASE_ID=dernek_db
```

### Running the App

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## Project Structure

```
mobile/
├── app/                          # Expo Router app directory
│   ├── (auth)/                   # Authentication routes
│   │   ├── _layout.tsx          # Auth layout
│   │   └── login.tsx            # Login screen
│   ├── (tabs)/                  # Tab navigation routes
│   │   ├── _layout.tsx          # Tabs layout
│   │   ├── dashboard.tsx        # Dashboard screen
│   │   ├── donations.tsx        # Donations screen
│   │   ├── beneficiaries.tsx    # Beneficiaries screen
│   │   └── more.tsx             # More menu screen
│   ├── _layout.tsx              # Root layout
│   └── index.tsx                # Entry point
├── src/
│   ├── components/
│   │   └── ui/                  # UI components
│   │       ├── Card.tsx
│   │       └── Button.tsx
│   ├── lib/
│   │   └── appwrite/            # Appwrite SDK
│   │       ├── config.ts        # Configuration
│   │       └── client.ts        # Client SDK
│   ├── stores/
│   │   └── authStore.ts         # Authentication store (Zustand)
│   ├── types/
│   │   ├── auth.ts              # Auth types & permissions
│   │   └── api.ts               # API types
│   ├── constants/
│   │   └── theme.ts             # Theme & design tokens
│   ├── hooks/                   # Custom hooks
│   ├── screens/                 # Screen components
│   └── navigation/              # Navigation helpers
├── assets/                      # Images, fonts, etc.
├── package.json
├── tsconfig.json
├── app.json                     # Expo configuration
└── babel.config.js
```

## Features

### Implemented

- ✅ Authentication flow (login/logout)
- ✅ Tab-based navigation
- ✅ Dashboard with statistics
- ✅ Donations list (placeholder)
- ✅ Beneficiaries list (placeholder)
- ✅ More menu with user profile
- ✅ Zustand state management with SecureStore
- ✅ Appwrite integration
- ✅ TypeScript strict mode
- ✅ Role-based permissions system

### Planned

- [ ] Beneficiaries management (CRUD)
- [ ] Donations management (CRUD)
- [ ] Aid requests and applications
- [ ] Scholarships management
- [ ] Tasks and meetings
- [ ] Messages (internal messaging)
- [ ] Finance reports
- [ ] File uploads (receipts, documents)
- [ ] Push notifications
- [ ] Offline support
- [ ] Biometric authentication

## Navigation Structure

### Authentication Stack
- `/login` - Login screen

### Tab Navigation
- `/dashboard` - Dashboard (home)
- `/donations` - Donations list
- `/beneficiaries` - Beneficiaries list
- `/more` - More menu with additional modules

### More Menu Modules
- Burslar (Scholarships)
- Fonlar (Funds)
- Mesajlar (Messages)
- Görevler (Tasks)
- Toplantılar (Meetings)
- Partnerler (Partners)
- Kullanıcılar (Users)
- Ayarlar (Settings)

## Authentication

The app uses Appwrite authentication with session management:

1. **Login:** Email/password authentication via Appwrite
2. **Session:** Stored securely using Expo SecureStore
3. **Permissions:** Role-based access control (RBAC)
4. **Roles:** SUPER_ADMIN, ADMIN, MANAGER, MEMBER, VIEWER, VOLUNTEER

Test credentials (if test users are created):
- Admin: `admin@test.com` / `admin123`
- Manager: `manager@test.com` / `manager123`

## State Management

### Zustand Store Pattern

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

const useStore = create()(
  immer((set) => ({
    // state
    count: 0,
    // actions
    increment: () => set((state) => { state.count++; }),
  }))
);
```

## Theme & Styling

The app uses a custom theme system defined in `src/constants/theme.ts`:

```typescript
import { colors, spacing, shadows, typography } from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.background,
    ...shadows.sm,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
});
```

## API Integration

### Appwrite Client

```typescript
import { account, databases, storage } from '@/lib/appwrite/client';
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';

// Example: Fetch beneficiaries
const response = await databases.listDocuments(
  DATABASE_ID,
  COLLECTIONS.BENEFICIARIES
);
```

## Development Workflow

### Adding a New Screen

1. Create screen file in `app/` directory
2. Use Expo Router file-based routing
3. Add navigation link if needed
4. Implement screen logic with hooks and stores

### Adding a New Feature

1. Create types in `src/types/`
2. Add API methods using Appwrite SDK
3. Create Zustand store if needed
4. Build UI components
5. Add to navigation

## Building for Production

### Android

```bash
# Create production build
npm run build:android

# Generate APK locally
npx expo prebuild
cd android && ./gradlew assembleRelease
```

### iOS

```bash
# Create production build
npm run build:ios

# Requires Apple Developer account and EAS Build
```

## Testing

```bash
# Run tests (when implemented)
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

## Common Issues

### Metro bundler cache issues
```bash
npx expo start --clear
```

### iOS simulator not opening
```bash
npx expo run:ios
```

### Android build errors
```bash
cd android && ./gradlew clean
cd .. && npx expo prebuild --clean
```

## Performance Optimization

- Use `React.memo()` for expensive components
- Implement FlatList for long lists
- Use `useCallback` and `useMemo` appropriately
- Optimize images with expo-image
- Enable Hermes engine (enabled by default in Expo)

## Security

- Sensitive data stored in SecureStore
- No API keys in client code
- Session tokens in HttpOnly cookies (via Appwrite)
- Input validation with Zod schemas
- HTTPS only communication

## Contributing

This mobile app is part of the PORTAL project. See main project README for contribution guidelines.

## License

Private - Association Management System

## Support

For issues related to:
- **Web app:** See main PORTAL project
- **Mobile app:** Create issue in mobile/ directory
- **Appwrite:** Check Appwrite documentation
- **Expo:** Check Expo documentation
