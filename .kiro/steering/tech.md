# Technology Stack

## Framework & Platform
- **React Native**: Cross-platform mobile development
- **Expo SDK 52**: Development platform and build system
- **TypeScript**: Primary language with strict type checking
- **Metro**: JavaScript bundler

## State Management & Data
- **Redux Toolkit**: Global state management
- **Drizzle ORM**: Type-safe database operations
- **SQLite**: Local database with encryption support
- **Supabase**: Backend-as-a-Service for sync and authentication

## UI & Styling
- **React Native Reanimated**: Animations and gestures
- **React Navigation**: Navigation system (Stack + Bottom Tabs)
- **Styled Components Pattern**: Component-specific styling
- **Theme System**: Light/Dark mode support

## Development Tools
- **ESLint**: Code linting with @antfu/eslint-config
- **Jest**: Testing framework with React Native Testing Library
- **Babel**: JavaScript compilation with module resolution
- **TypeScript**: Type checking with path aliases

## Common Commands

### Development
```bash
# Start development server
bun run start
# or
expo start

# Run on Android
bun run android
# or
bun run dev

# Run on iOS
bun run ios

# Run on web
bun run web
```

### Code Quality
```bash
# Lint code
bun run lint

# Fix linting issues
bun run lint:fix

# Type checking
bun run typecheck
```

### Testing
```bash
# Run tests
bun run test

# Run tests in watch mode
bun run testDebug

# Run tests with coverage
bun run testFinal

# Update test snapshots
bun run updateSnapshots
```

### Database
```bash
# Generate database types from Supabase
supabase gen types --lang=typescript --project-id ${PROJECT_ID} --schema public > src/lib/supabase/types.ts

# Generate types from local Supabase
supabase gen types --lang=typescript --local > src/lib/supabase/types.ts

# Run Drizzle migrations
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

## Build Configuration
- **EAS Build**: Production builds via Expo Application Services
- **Bundle ID**: `io.ldsgroups.yekoTeach` (iOS), `io.ldsgroups.yeko_teach` (Android)
- **Runtime Version**: 1.0.0 for OTA updates
