# Project Structure & Architecture

## Root Structure
```
├── src/                    # Main source code
├── android/               # Android-specific files
├── ios/                   # iOS-specific files
├── .expo/                 # Expo build cache
├── node_modules/          # Dependencies
└── config files           # Various config files
```

## Source Code Organization (`src/`)

### Core Directories
- **`components/`** - Reusable UI components with `Cs` prefix (CsButton, CsCard, etc.)
- **`modules/`** - Feature-based modules (app, chat, profile, schedule, school)
- **`hooks/`** - Custom React hooks
- **`providers/`** - React context providers
- **`styles/`** - Theme system, colors, typography, spacing
- **`utils/`** - Utility functions and helpers
- **`store/`** - Redux store configuration
- **`db/`** - Database schema and configuration
- **`lib/`** - External library configurations (Supabase)

### Module Structure Pattern
Each module follows a consistent structure:
```
src/modules/{feature}/
├── components/           # Feature-specific components
├── screens/             # Screen components
├── hooks/               # Feature-specific hooks
├── services/            # API and business logic
├── types/               # TypeScript type definitions
└── redux/               # Redux slices (if needed)
```

## Path Aliases
The project uses TypeScript path aliases for clean imports:
- `@components/*` → `./src/components/*`
- `@modules/*` → `./src/modules/*`
- `@hooks/*` → `./src/hooks/*`
- `@styles/*` → `./src/styles/*`
- `@utils/*` → `./src/utils/*`
- `@store/*` → `./src/store/*`
- `@assets/*` → `./src/assets/*`
- `@providers/*` → `./src/providers/*`
- `@src/*` → `./src/*`

## Component Architecture

### Custom Components
- All custom components use `Cs` prefix (Custom System)
- Each component has its own folder with:
  - `index.tsx` - Main component
  - `style.ts` - Styled components
  - `type.ts` - TypeScript interfaces
  - `{Component}.test.tsx` - Unit tests

### Component Export Pattern
Components are exported through barrel exports (`index.js`) for clean imports.

## Styling System
- **Theme-based**: Light/Dark mode support
- **Responsive**: Screen size utilities
- **Consistent**: Spacing, typography, and color systems
- **Typed**: TypeScript interfaces for all style objects

## State Management
- **Redux Toolkit**: Global state with typed selectors
- **Local State**: React hooks for component-specific state
- **Async State**: Custom hooks for data fetching patterns

## Database Layer
- **Schema**: Defined in `src/db/schema.ts` using Drizzle ORM
- **Migrations**: Auto-generated in `src/drizzle/`
- **Services**: Feature-specific database operations in module services

## Testing Strategy
- **Unit Tests**: Component and utility testing with Jest
- **Test Files**: Co-located with components (`*.test.tsx`)
- **Coverage**: Configured for comprehensive coverage reporting

## File Naming Conventions
- **Components**: PascalCase (`CsButton.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)
- **Services**: camelCase with `Service` suffix (`authService.ts`)
- **Types**: PascalCase with interface prefix (`IUserData.ts`)
- **Utils**: camelCase (`formatDate.ts`)

## Import/Export Guidelines
- Use barrel exports for public APIs
- Prefer named exports over default exports
- Use path aliases for internal imports
- Group imports: external libraries, internal modules, relative imports
