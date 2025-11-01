# PORTAL Mobile - Architecture Documentation

## Overview

PORTAL Mobile is a React Native mobile application built with Expo, designed to provide mobile access to the PORTAL association management system. It follows modern React Native best practices and leverages Appwrite as a Backend-as-a-Service (BaaS) platform.

## Technology Stack

### Core Framework
- **React Native**: v0.74.1
- **Expo**: ~51.0.0
- **TypeScript**: ~5.3.3 (strict mode)
- **Expo Router**: ~3.5.11 (file-based routing)

### State Management
- **Zustand**: v4.4.7 - Lightweight state management
- **Immer**: v10.0.3 - Immutable state updates
- **Expo SecureStore**: ~13.0.1 - Secure credential storage

### Data Fetching
- **TanStack Query**: v5.17.19 - Server state management
  - Automatic caching
  - Background refetching
  - Optimistic updates

### Backend Integration
- **Appwrite**: v14.0.1 - Cloud BaaS
  - Authentication
  - Database
  - Storage
  - Functions

### Form Management
- **React Hook Form**: v7.49.2 - Performant form handling
- **Zod**: v3.22.4 - Schema validation
- **@hookform/resolvers**: v3.3.3 - Zod integration

### UI & Navigation
- **React Navigation**: v6.1.9 - Navigation primitives
- **Expo Vector Icons**: v14.0.0 - Icon library
- **React Native Gesture Handler**: ~2.16.0
- **React Native Reanimated**: ~3.10.0

## Architecture Patterns

### 1. Feature-Based Organization

```
mobile/
├── app/                    # Expo Router (file-based routing)
│   ├── (auth)/            # Authentication routes
│   ├── (tabs)/            # Tab navigation routes
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point
└── src/
    ├── components/        # Reusable components
    ├── lib/              # Libraries & utilities
    ├── stores/           # Zustand stores
    ├── types/            # TypeScript types
    ├── hooks/            # Custom hooks
    ├── screens/          # Screen components
    └── constants/        # Constants & theme
```

### 2. Separation of Concerns

#### Presentation Layer
- **Screens**: Top-level components for each route
- **Components**: Reusable UI components
- **Theme**: Design tokens and styling constants

#### Business Logic Layer
- **Stores**: Application state (Zustand)
- **Hooks**: Reusable logic and effects
- **Validation**: Zod schemas for data validation

#### Data Layer
- **API Client**: Appwrite SDK integration
- **Query Hooks**: TanStack Query for data fetching
- **Types**: TypeScript interfaces and types

### 3. State Management Strategy

#### Local State (React useState)
- Component-specific UI state
- Form inputs
- Modal visibility

#### Global State (Zustand)
- Authentication state
- User preferences
- App-wide settings

#### Server State (TanStack Query)
- API data
- Cache management
- Background synchronization

#### Secure Storage (SecureStore)
- Authentication tokens
- Sensitive credentials

## Authentication Architecture

### Authentication Flow

```
┌─────────────┐
│   Login     │
│   Screen    │
└──────┬──────┘
       │
       ↓ (email, password)
┌─────────────────────┐
│   authStore.login   │
│   (Zustand)         │
└──────┬──────────────┘
       │
       ↓
┌──────────────────────────┐
│  Appwrite Authentication │
│  (createEmailSession)    │
└──────┬───────────────────┘
       │
       ↓ (success)
┌──────────────────────┐
│   Store session in   │
│   SecureStore        │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│   Update auth state  │
│   (user, tokens)     │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│   Navigate to        │
│   Dashboard          │
└──────────────────────┘
```

### Session Management

1. **Initial Load**:
   - Check SecureStore for `isAuthenticated` flag
   - If true, fetch user from Appwrite
   - If session invalid, clear storage and redirect to login

2. **Active Session**:
   - Session managed by Appwrite SDK
   - Automatic token refresh
   - Stored in HttpOnly cookies (web) or native storage (mobile)

3. **Logout**:
   - Delete Appwrite session
   - Clear SecureStore
   - Clear auth state
   - Navigate to login

### Authorization (RBAC)

```typescript
// Role hierarchy
SUPER_ADMIN > ADMIN > MANAGER > MEMBER > VIEWER > VOLUNTEER

// Permission checking
const hasPermission = useAuthStore((s) => s.hasPermission);

if (hasPermission('donations:create')) {
  // Show create button
}

// Role checking
const hasRole = useAuthStore((s) => s.hasRole);

if (hasRole('ADMIN')) {
  // Show admin panel
}
```

## Navigation Architecture

### Expo Router (File-Based Routing)

```
app/
├── _layout.tsx              # Root layout (providers)
├── index.tsx                # Entry point (auth check)
├── (auth)/
│   ├── _layout.tsx         # Auth layout
│   └── login.tsx           # Login screen
└── (tabs)/
    ├── _layout.tsx         # Tab layout
    ├── dashboard.tsx       # Dashboard tab
    ├── donations.tsx       # Donations tab
    ├── beneficiaries.tsx   # Beneficiaries tab
    └── more.tsx            # More menu tab
```

### Navigation Groups

1. **Authentication Stack** `(auth)`
   - Unauthenticated routes
   - Login screen
   - No back button

2. **Tab Navigator** `(tabs)`
   - Authenticated routes
   - Bottom tab navigation
   - 4 main tabs

3. **Modal Routes** (future)
   - Full-screen overlays
   - Forms and details

## Data Flow Architecture

### API Request Flow

```
┌──────────────┐
│  Component   │
└──────┬───────┘
       │
       ↓ (useQuery/useMutation)
┌──────────────────┐
│  TanStack Query  │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│  Appwrite SDK    │
│  (databases)     │
└──────┬───────────┘
       │
       ↓ (HTTP request)
┌──────────────────┐
│  Appwrite Cloud  │
└──────┬───────────┘
       │
       ↓ (response)
┌──────────────────┐
│  Transform data  │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│  Update cache    │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│  Re-render       │
│  Component       │
└──────────────────┘
```

### Example: Fetching Beneficiaries

```typescript
// 1. Define query hook
function useBeneficiaries() {
  return useQuery({
    queryKey: ['beneficiaries'],
    queryFn: async () => {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.BENEFICIARIES
      );
      return response.documents;
    },
  });
}

// 2. Use in component
function BeneficiariesScreen() {
  const { data, isLoading, error } = useBeneficiaries();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  return <BeneficiariesList data={data} />;
}
```

## UI/UX Architecture

### Design System

#### Theme Structure
```typescript
// src/constants/theme.ts
export const colors = {
  primary: '#1e40af',      // Brand color
  success: '#10b981',      // Success states
  error: '#ef4444',        // Error states
  // ... more colors
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32
};

export const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' },
  // ... more text styles
};
```

#### Component Library
- **Card**: Container with shadow
- **Button**: Variants (primary, secondary, outline)
- **Input**: Form inputs with validation
- **Modal**: Full-screen and bottom sheet
- **List**: FlatList with pull-to-refresh

### Responsive Design

#### Screen Sizes
- **Phone**: 320-428px width
- **Tablet**: 768-1024px width
- **Adaptive layouts**: Different layouts for phone/tablet

#### Safe Area Handling
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView edges={['top', 'bottom']}>
  {/* Content */}
</SafeAreaView>
```

## Performance Optimization

### 1. List Rendering
```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={21}
/>
```

### 2. Image Optimization
- Use `expo-image` for better performance
- Implement lazy loading
- Cache images locally

### 3. Bundle Size
- Code splitting with Expo Router
- Tree shaking (automatic)
- Dynamic imports for heavy libraries

### 4. Memory Management
- Unsubscribe from listeners
- Clear timers and intervals
- Remove event listeners on unmount

## Security Architecture

### 1. Secure Data Storage
```typescript
// Sensitive data
await SecureStore.setItemAsync('token', token);

// Non-sensitive data
await AsyncStorage.setItem('theme', 'dark');
```

### 2. API Security
- HTTPS only (enforced by Appwrite)
- No API keys in client code
- Session-based authentication
- CSRF protection (via Appwrite)

### 3. Input Validation
```typescript
// Zod schema validation
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Sanitization (future)
import { sanitizeInput } from '@/lib/sanitization';
```

### 4. Permission Checks
```typescript
// Component-level
if (!hasPermission('donations:create')) {
  return null; // Hide UI
}

// Route-level (future)
// Middleware to protect routes
```

## Testing Strategy (Future Implementation)

### Unit Tests
- Component tests with Testing Library
- Store tests with Zustand
- Utility function tests

### Integration Tests
- API integration tests
- Navigation flow tests
- Form submission tests

### E2E Tests
- Critical user flows
- Authentication flow
- CRUD operations

## Offline Support (Future)

### Strategy
1. **Cache-First**: TanStack Query cache
2. **Local Database**: WatermelonDB or Realm
3. **Sync Queue**: Queue mutations when offline
4. **Conflict Resolution**: Last-write-wins or manual

### Implementation Plan
```typescript
// Offline detection
import NetInfo from '@react-native-community/netinfo';

// Queue mutations
const mutation = useMutation({
  mutationFn: createDonation,
  onError: (error) => {
    if (isNetworkError(error)) {
      queueForLater(mutation);
    }
  },
});
```

## Build & Deployment

### Development
```bash
npm start              # Expo dev server
npm run ios            # iOS simulator
npm run android        # Android emulator
```

### Production Builds

#### EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

#### Local Builds
```bash
# Prebuild native code
npx expo prebuild

# Android
cd android && ./gradlew assembleRelease

# iOS (requires Mac)
cd ios && xcodebuild -workspace ...
```

### Release Process
1. Update version in `app.json`
2. Create changelog
3. Build with EAS
4. Submit to stores
5. Tag release in Git

## Monitoring & Analytics (Future)

### Error Tracking
- Sentry for crash reporting
- Custom error boundaries

### Analytics
- Expo Analytics (basic)
- Custom events tracking
- User behavior insights

### Performance Monitoring
- React Native Performance
- Network request timing
- Screen load times

## Migration from Web

### Shared Code
```
# Shared between web and mobile
- TypeScript types
- Zod validation schemas
- Business logic utilities
- API response types

# Platform-specific
- UI components
- Navigation
- Storage (SecureStore vs localStorage)
- API client (fetch vs Appwrite SDK differences)
```

### Reusable Patterns
- Auth store structure
- Permission system
- Role definitions
- API response format

## Future Enhancements

### Short Term
1. Complete CRUD for all entities
2. File uploads (camera, gallery)
3. Push notifications
4. Biometric authentication
5. Pull-to-refresh

### Medium Term
1. Offline support
2. Background sync
3. Share functionality
4. Export reports
5. Advanced search

### Long Term
1. Real-time updates (WebSockets)
2. In-app messaging
3. Calendar integration
4. Map integration
5. QR code scanning

## Best Practices

### Code Organization
- One component per file
- Co-locate related files
- Keep components small and focused
- Extract reusable logic to hooks

### Naming Conventions
- PascalCase for components
- camelCase for functions/variables
- UPPER_CASE for constants
- kebab-case for files

### TypeScript Usage
- Strict mode enabled
- Avoid `any` type
- Define interfaces for all data
- Use discriminated unions

### Performance
- Use `React.memo()` judiciously
- Avoid inline functions in render
- Use `useCallback` and `useMemo`
- Optimize images and assets

### Error Handling
- Always catch errors
- Show user-friendly messages
- Log errors for debugging
- Provide fallback UI

## Resources

### Documentation
- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Appwrite](https://appwrite.io/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)

### Community
- React Native Discord
- Expo Discord
- Stack Overflow
- GitHub Discussions

## Conclusion

This architecture provides a solid foundation for a scalable, maintainable React Native mobile application. It follows modern best practices, leverages powerful libraries, and integrates seamlessly with the existing PORTAL web application through shared Appwrite backend.
