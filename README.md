# Live URL: https://admin.webdynamo.com.au/auth/login/

# Webdynamo Dashboard

A modern, feature-rich admin dashboard application built with **Next.js 16**, **React 19**, and **TypeScript**. This dashboard provides a comprehensive management interface with authentication, user management, role-based access control, and real-time analytics.

## 🌟 Features

### Core Features
- **Authentication System** - Secure login/logout with JWT token management
- **Dashboard Analytics** - Real-time statistics, charts, and activity tracking
- **User Management** - Complete CRUD operations for user accounts
- **Role Management** - Create and manage user roles
- **Permission Management** - Fine-grained permission control
- **Contact Management** - Contact database and communication features
- **Settings** - User profile and application settings

### UI/UX Features
- **Modern Design** - Clean, intuitive interface with Tailwind CSS
- **Responsive Layout** - Fully responsive design for all devices
- **Animations** - Smooth page transitions and component animations using Framer Motion
- **Dark Mode Support** - Built-in theme switching with Next Themes
- **Interactive Charts** - Data visualization using Recharts
- **Toast Notifications** - Real-time user feedback system
- **Data Tables** - Advanced table components with sorting and filtering

## 🏗️ Project Structure

```
webdynamo-dashboard/
├── app/                          # Next.js App Router
│   ├── auth/                     # Authentication pages
│   │   └── login/               # Login page
│   ├── dashboard/               # Main dashboard area
│   │   ├── analytics/           # Analytics page
│   │   ├── contact/             # Contact management
│   │   ├── settings/            # Settings page
│   │   ├── users/               # User management
│   │   │   ├── user/            # User CRUD
│   │   │   ├── role/            # Role management
│   │   │   └── permission/      # Permission management
│   │   └── logout/              # Logout handler
│   └── layout.tsx               # Root layout
├── components/                   # Reusable React components
│   ├── ui/                      # UI component library
│   ├── animate/                 # Animation components
│   ├── dashboard/               # Dashboard-specific components
│   ├── data-table.tsx           # Advanced table component
│   └── theme-provider.tsx       # Theme configuration
├── lib/                         # Utility functions and API client
│   ├── api/                     # API integration
│   │   ├── client.ts            # API client configuration
│   │   └── services/            # Service modules
│   │       ├── auth.ts          # Auth API functions
│   │       ├── users.ts         # User API functions
│   │       ├── roles.ts         # Role API functions
│   │       ├── permissions.ts   # Permission API functions
│   │       ├── contact.ts       # Contact API functions
│   │       └── types/           # TypeScript types
│   └── utils.ts                 # Utility functions
├── hooks/                       # Custom React hooks
│   ├── use-toast.ts            # Toast notification hook
│   ├── use-mobile.ts           # Mobile detection hook
│   ├── use-controlled-state.tsx # Form state management
│   └── use-is-in-view.tsx      # Intersection observer hook
├── providers/                   # Context providers
│   └── auth-provider.tsx        # Authentication context
├── stores/                      # Zustand state management
│   ├── auth-store.ts           # Authentication state
│   └── sidebar-store.ts        # Sidebar state
├── styles/                      # Global styles
├── public/                      # Static assets
├── components.json              # Shadcn/ui configuration
├── package.json                 # Project dependencies
├── tsconfig.json               # TypeScript configuration
├── next.config.mjs             # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── postcss.config.mjs          # PostCSS configuration
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ or **Bun** runtime
- **pnpm** package manager (recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd webdynamo-dashboard
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

### Available Scripts

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

## 🔐 Authentication

The application uses a token-based authentication system:

- **Login Flow**: Users authenticate via the login page with email and password
- **Token Storage**: JWT tokens are stored in cookies (`auth-token`)
- **Protected Routes**: Dashboard routes require authentication
- **Auto-Redirect**: Unauthenticated users are redirected to the login page
- **Logout**: Sessions can be terminated through the logout feature

### Authentication Provider

The `AuthProvider` component manages authentication state using Zustand:

```tsx
import { useAuth } from '@/providers/auth-provider'

export function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth()
  // ...
}
```

## 📊 API Integration

### API Client

The application uses a custom API client for all backend communications:


**Features**:
- Automatic JWT token injection in headers
- JSON request/response handling
- Error handling and logging
- Cookie-based token management

### Available Services

#### Auth Service
- `login(email, password)` - User login
- `logout()` - User logout
- `getProfile()` - Fetch current user profile

#### User Service
- `getUsers()` - List all users
- `getUser(id)` - Get user details
- `createUser(data)` - Create new user
- `updateUser(id, data)` - Update user
- `deleteUser(id)` - Delete user

#### Role Service
- `getRoles()` - List all roles
- `getRole(id)` - Get role details
- `createRole(data)` - Create new role
- `updateRole(id, data)` - Update role
- `deleteRole(id)` - Delete role

#### Permission Service
- `getPermissions()` - List all permissions
- `getPermission(id)` - Get permission details
- `createPermission(data)` - Create new permission
- `updatePermission(id, data)` - Update permission
- `deletePermission(id)` - Delete permission

#### Contact Service
- `getContacts()` - List all contacts
- `getContact(id)` - Get contact details
- `createContact(data)` - Create new contact
- `updateContact(id, data)` - Update contact
- `deleteContact(id)` - Delete contact

## 🎨 UI Components

The project includes a comprehensive library of UI components from Shadcn/UI:

**Form Components**: Input, Textarea, Select, Checkbox, Radio Group, Toggle, Switch
**Layout**: Card, Sheet, Dialog, Drawer, Popover, Tooltip, Hover Card
**Navigation**: Sidebar, Navbar, Breadcrumb, Pagination, Tabs
**Data Display**: Table, Badge, Avatar, Skeleton, Progress, Carousel
**Feedback**: Toast, Alert, Spinner
**Other**: Command, Calendar, Accordion, Collapsible

## 🎭 Animations

The dashboard features smooth animations powered by **Framer Motion**:

- **Page Transitions** - Fade-in and slide-in effects for page loads
- **Stagger Animations** - Sequential animations for grouped elements
- **Interactive Buttons** - Animated button hover and click states
- **Card Animations** - Smooth card entrance animations

## 🎨 Theming

Themes are managed using **Next Themes** with Tailwind CSS:

- **Dark Mode Support** - Toggle between light and dark themes
- **Custom Configuration** - Modify colors and styles in Tailwind config
- **Persistent Selection** - User theme preference is saved

## 📦 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 16.0.3 | React framework with SSR |
| React | 19.2.0 | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4.1.9 | Utility-first CSS |
| Radix UI | ^1.4.3 | Headless UI components |
| Framer Motion | latest | Animation library |
| Zustand | ^5.0.10 | State management |
| React Hook Form | ^7.60.0 | Form state management |
| Recharts | latest | Chart library |
| Zod | 3.25.76 | Schema validation |
| Lucide React | ^0.454.0 | Icon library |

## 🔧 Configuration

### Next.js Configuration
- **Output**: Static export (`export` mode)
- **Trailing Slash**: Enabled for all routes
- **ESLint**: Ignored during builds
- **TypeScript**: Errors ignored during builds (for development)
- **Images**: Unoptimized static hosting

### Tailwind CSS
- **Custom Colors**: Primary, secondary, destructive, background, foreground, muted
- **Animations**: Custom animation presets from `tailwindcss-animate`
- **Plugins**: CVA for component variants

## 📝 Development Guidelines

### Component Structure
- Components are organized by feature in `/components`
- Use composition for complex components
- Prefer functional components with hooks
- Type all props with TypeScript interfaces

### Styling
- Use Tailwind utility classes for styling
- Use `clsx` or `cn` for conditional classes
- Define component variants in separate files
- Maintain consistent spacing and sizing

### State Management
- Use Zustand for global state (auth, sidebar)
- Use React hooks for local component state
- Use React Hook Form for form management

### API Requests
- Use the provided API client in `lib/api/client.ts`
- Define API services in `lib/api/services/`
- Create TypeScript types for responses in `lib/api/types/`

## 🐛 Troubleshooting

### Login Issues
- Verify API endpoint in `lib/api/client.ts`
- Check network requests in browser DevTools
- Ensure valid email and password credentials

### Missing Components
- Components from Shadcn/UI are pre-configured
- Check `components.json` for component configuration
- Install additional components using Shadcn CLI if needed

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check for conflicting CSS in `globals.css`
- Verify PostCSS configuration

## 📄 License

This project is proprietary and confidential.

## 👥 Support

For issues and questions, please contact the development team or check the project documentation.


