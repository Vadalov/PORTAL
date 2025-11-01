# PORTAL Mobile App

## Overview

The PORTAL mobile app is a React Native application built with Expo, providing mobile access to the PORTAL association management system. It shares the same Appwrite backend as the web application, ensuring data consistency across platforms.

## Quick Start

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Documentation

For detailed documentation, see:
- **[mobile/README.md](../mobile/README.md)** - Getting started guide
- **[mobile/ARCHITECTURE.md](../mobile/ARCHITECTURE.md)** - Architecture and design decisions

## Features

### Current Features (MVP)
- ✅ User authentication (login/logout)
- ✅ Tab-based navigation
- ✅ Dashboard with statistics
- ✅ Role-based permissions
- ✅ Secure credential storage
- ✅ Appwrite integration

### In Development
- Beneficiaries management
- Donations management
- Aid requests and applications
- File uploads (camera, gallery)
- Push notifications

### Planned Features
- Offline support
- Real-time updates
- Advanced search and filtering
- Reports and analytics
- QR code scanning
- Biometric authentication

## Technology Stack

- **Framework**: React Native with Expo
- **Router**: Expo Router (file-based routing)
- **Backend**: Appwrite (shared with web app)
- **State**: Zustand + TanStack Query
- **Language**: TypeScript (strict mode)
- **Forms**: React Hook Form + Zod

## Architecture Highlights

### Shared with Web App
- Appwrite backend (databases, storage, auth)
- TypeScript types and interfaces
- Zod validation schemas
- Role-based permission system
- Business logic patterns

### Mobile-Specific
- React Native UI components
- Expo Router navigation
- SecureStore for credentials
- Native device features (camera, notifications)
- Offline-first data strategy (planned)

## Project Structure

```
mobile/
├── app/                    # Expo Router (screens)
│   ├── (auth)/            # Authentication flow
│   │   └── login.tsx
│   └── (tabs)/            # Main app navigation
│       ├── dashboard.tsx
│       ├── donations.tsx
│       ├── beneficiaries.tsx
│       └── more.tsx
├── src/
│   ├── components/        # Reusable UI components
│   ├── lib/              # Utilities and API client
│   ├── stores/           # Zustand state management
│   ├── types/            # TypeScript types
│   └── constants/        # Theme and design tokens
└── assets/               # Images, fonts, icons
```

## Development Workflow

### Running the App

1. **Install dependencies** (first time only):
   ```bash
   cd mobile && npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Update with your Appwrite credentials
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

4. **Open on device**:
   - Scan QR code with Expo Go app
   - Or press `i` for iOS simulator
   - Or press `a` for Android emulator

### Adding New Features

1. **Create screen** in `app/` directory
2. **Add types** in `src/types/`
3. **Create components** in `src/components/`
4. **Add store** if needed in `src/stores/`
5. **Integrate API** using Appwrite SDK

### Testing

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Tests (when implemented)
npm test
```

## Environment Configuration

The mobile app requires the following environment variables:

```env
# Appwrite Configuration
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
EXPO_PUBLIC_DATABASE_ID=dernek_db

# Storage Buckets
EXPO_PUBLIC_STORAGE_DOCUMENTS=documents
EXPO_PUBLIC_STORAGE_RECEIPTS=receipts
EXPO_PUBLIC_STORAGE_PHOTOS=photos
EXPO_PUBLIC_STORAGE_REPORTS=reports
```

⚠️ **Note**: Use the same Appwrite project as the web app to share data.

## Authentication

The mobile app uses the same Appwrite authentication as the web app:

1. **Login Flow**:
   - User enters email/password
   - Appwrite creates session
   - Session stored in SecureStore
   - User redirected to dashboard

2. **Session Management**:
   - Sessions persist across app restarts
   - Automatic session refresh
   - Logout clears all stored data

3. **Test Users**:
   - Admin: `admin@test.com` / `admin123`
   - Manager: `manager@test.com` / `manager123`

## Building for Production

### Android

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Create production build
eas build --platform android

# Local build (alternative)
npx expo prebuild
cd android && ./gradlew assembleRelease
```

### iOS

```bash
# Create production build (requires Apple Developer account)
eas build --platform ios

# Local build (requires Mac with Xcode)
npx expo prebuild
cd ios && xcodebuild ...
```

## Common Issues

### Metro bundler cache
```bash
npx expo start --clear
```

### Platform-specific errors
```bash
# iOS
cd ios && pod install

# Android
cd android && ./gradlew clean
```

### Environment variables not loading
- Restart Expo server after changing `.env`
- Clear cache: `npx expo start --clear`

## Performance Tips

1. **Use FlatList** for long lists
2. **Optimize images** with expo-image
3. **Memoize expensive components**
4. **Enable Hermes** (default in Expo)
5. **Profile with Flipper**

## Security Considerations

- ✅ Credentials stored in SecureStore
- ✅ No API keys in code
- ✅ HTTPS-only communication
- ✅ Input validation with Zod
- ✅ Role-based access control

## Roadmap

### Phase 1 (Current) - MVP
- [x] Authentication
- [x] Basic navigation
- [x] Dashboard
- [ ] Beneficiaries CRUD
- [ ] Donations CRUD

### Phase 2 - Core Features
- [ ] Aid requests and applications
- [ ] File uploads (camera, gallery)
- [ ] Push notifications
- [ ] Search and filtering

### Phase 3 - Enhanced Features
- [ ] Offline support
- [ ] Background sync
- [ ] Real-time updates
- [ ] Advanced reports

### Phase 4 - Advanced Features
- [ ] QR code scanning
- [ ] Biometric authentication
- [ ] In-app messaging
- [ ] Calendar integration

## Contributing

When contributing to the mobile app:

1. Follow existing code patterns
2. Use TypeScript strict mode
3. Write meaningful commit messages
4. Test on both iOS and Android
5. Update documentation

## Resources

- **Web App Docs**: [CLAUDE.md](../CLAUDE.md)
- **Mobile README**: [mobile/README.md](../mobile/README.md)
- **Architecture**: [mobile/ARCHITECTURE.md](../mobile/ARCHITECTURE.md)
- **Expo Docs**: https://docs.expo.dev/
- **Appwrite Docs**: https://appwrite.io/docs

## Support

For issues:
- Mobile app: Create issue with `[mobile]` prefix
- Backend/Appwrite: Check with web app team
- React Native/Expo: Check official docs

---

**Status**: MVP in development
**Platform**: iOS & Android
**Framework**: React Native + Expo
**Backend**: Appwrite (shared with web)
