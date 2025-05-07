# Frontend Document

## Overview

#

This document describes the frontend architecture and design patterns for the Samudra Paket ERP System. The frontend consists of two main applications:

1.  Web Application: A Next.js application with JavaScript for administrative users, management, and office staff
2.  Mobile Application: A React Native (Expo) application with TypeScript for field operations staff

Both applications follow consistent design principles and share common components and utilities where appropriate.

## Design System

### Design Principles

#

The frontend follows these core design principles:

1.  Consistency: Uniform design language across all interfaces
2.  Efficiency: Optimized for common tasks with minimal steps
3.  Clarity: Clear and intuitive interfaces that reduce cognitive load
4.  Responsiveness: Adapts to different screen sizes and devices
5.  Accessibility: Usable by people with varying abilities

### Color Palette

#

The system uses a consistent color palette:

- Primary: #2563EB (Blue)
- Secondary: #10B981 (Green)
- Accent: #F59E0B (Amber)
- Neutral: #64748B (Slate)
- Semantic Colors:

- Success: #10B981 (Green)
- Warning: #F59E0B (Amber)
- Error: #EF4444 (Red)
- Info: #3B82F6 (Blue)

### Typography

#

- Heading Font: Inter
- Body Font: Inter
- Monospace Font: JetBrains Mono
- Type Scale:

- H1: 2.5rem (40px)
- H2: 2rem (32px)
- H3: 1.5rem (24px)
- H4: 1.25rem (20px)
- H5: 1rem (16px)
- H6: 0.875rem (14px)
- Body: 1rem (16px)
- Small: 0.875rem (14px)
- Caption: 0.75rem (12px)

### Spacing System

#

- Base Unit: 4px
- Spacing Scale:

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px
- 4xl: 96px

### Icons and Imagery

#

- Icon System: Lucide React for consistent iconography
- Icon Sizes:

- Small: 16px
- Medium: 20px
- Large: 24px
- XLarge: 32px

- Imagery: Custom illustrations for empty states and onboarding

### Components

#

The design system includes a comprehensive component library built with Tailwind CSS and organized following the Atomic Design methodology:

1.  Atoms: Basic building blocks

- Button
- Input
- Checkbox
- Radio
- Toggle
- Icon
- Text
- Badge

3.  Molecules: Combinations of atoms

- Form Field
- Search Bar
- Pagination
- Dropdown
- Alert
- Card
- Tabs

5.  Organisms: Complex UI components

- DataTable
- Form
- Modal
- Sidebar
- Header
- Dashboard Widget
- Calendar

7.  Templates: Page layouts

- Admin Layout
- Dashboard Layout
- Form Layout
- Report Layout
- Login Layout

## Web Application Architecture

### Technology Stack

#

- Framework: Next.js with JavaScript
- UI Library: React
- Styling: Tailwind CSS
- State Management: Redux Toolkit + React Query
- Form Handling: React Hook Form + Zod

### Application Structure

#

/frontend

├── /public              # Static assets

├── /src

│   ├── /components      # Reusable UI components

│   │   ├── /atoms       # Basic building blocks

│   │   ├── /molecules   # Combinations of atoms

│   │   ├── /organisms   # Complex UI components

│   │   └── /templates   # Page layouts

│   ├── /features        # Feature-based modules

│   │   ├── /auth        # Authentication related features

│   │   ├── /dashboard   # Dashboard related features

│   │   ├── /pickup      # Pickup related features

│   │   └── ...

│   ├── /hooks           # Custom React hooks

│   ├── /lib             # Utility libraries

│   ├── /pages           # Next.js pages

│   ├── /services        # API service integrations

│   ├── /store           # Redux store configuration

│   ├── /styles          # Global styles and themes

│   └── /types           # Type definitions

### Feature Module Structure

#

Each feature module follows a consistent structure:

/features/example-feature

├── /components          # Feature-specific components

├── /hooks               # Feature-specific hooks

├── /services            # Feature-specific API services

├── /store               # Feature-specific state management

│   ├── exampleSlice.js  # Redux slice

│   └── selectors.js     # State selectors

├── index.js             # Public API exports

└── types.js             # Feature-specific types

### State Management

#

The web application uses a combination of state management solutions:

1.  Redux Toolkit: For global application state

- User information and authentication
- Application-wide configuration
- Cross-cutting concerns
- Persistent state

3.  React Query: For server state

- Data fetching, caching, and synchronization
- Pagination handling
- Mutations and optimistic updates
- Background refetching

5.  React Context: For component-level state

- Theme settings
- Feature-specific state
- Component composition state

7.  Local State: For component-specific state

- Form state (field values, validation)
- UI state (expanded/collapsed, selected items)
- Temporary state (modals, tooltips)

### Routing

#

The application uses Next.js pages router with:

- Structured route organization by feature area
- Dynamic routes for resource-specific pages
- Route guards for authenticated routes
- Role-based route access control
- Nested layouts for consistent UI

### Data Fetching Strategy

#

Data fetching follows these patterns:

1.  Server-Side Rendering (SSR):

- Initial page load data
- SEO-critical pages
- Authentication-dependent pages

3.  Client-Side Fetching:

- Dynamic data that changes frequently
- User-specific data
- Data that depends on client state

5.  Incremental Static Regeneration (ISR):

- Semi-static data that updates periodically
- Reference data (product catalogs, etc.)
- Data shared across multiple users

### Component Architecture

#

Components follow these design patterns:

1.  Container/Presentational Pattern:

- Container components handle data and state
- Presentational components focus on UI rendering
- Separation of concerns for better testability

3.  Compound Components:

- Related components grouped together
- Shared context between components
- Flexible composition and customization

5.  Render Props / Higher-Order Components:

- Used for cross-cutting concerns
- Code reuse across components
- Separation of behavior from rendering

### Form Handling

#

Form implementation follows these patterns:

1.  Form Structure:

- Form components built with React Hook Form
- Zod schemas for validation
- Controlled inputs for complex cases
- Uncontrolled inputs for performance

3.  Validation Strategy:

- Client-side validation for immediate feedback
- Server-side validation for security
- Field-level and form-level validation rules
- Dynamic validation based on form state

5.  Form Submission:

- Optimistic updates where appropriate
- Loading states during submission
- Comprehensive error handling
- Form persistence for multi-step forms

### Internationalization

#

The application supports multiple languages:

- i18next for translation management
- Locale-specific formatting for dates, numbers, and currencies
- RTL support for appropriate languages
- Language selection persistence

### Error Handling

#

Error handling strategy includes:

1.  API Errors:

- Consistent error response format
- Error categorization (validation, authentication, server)
- Retry logic for transient errors
- Fallback UI for critical errors

3.  UI Error Boundaries:

- Component-level error containment
- Fallback UI for component failures
- Error logging and reporting
- Recovery options where possible

5.  Form Errors:

- Field-level error messages
- Form-level error summaries
- Validation timing (onBlur, onChange, onSubmit)
- Error focus management

### Performance Optimization

#

Performance optimization techniques include:

1.  Code Splitting:

- Route-based code splitting
- Component-level dynamic imports
- Lazy loading for heavy components
- Prefetching for critical paths

3.  Rendering Optimization:

- Memoization of expensive computations
- React.memo for pure components
- Virtual scrolling for long lists
- Debounced and throttled events

5.  Asset Optimization:

- Image optimization with Next.js Image
- Font optimization with preloading
- SVG optimization for icons
- CSS optimization with Tailwind

7.  Caching Strategy:

- Browser caching for static assets
- React Query caching for API data
- LocalStorage for user preferences
- Service Worker for offline support

## Mobile Application Architecture

### Technology Stack

#

- Framework: React Native (Expo) with TypeScript
- State Management: Redux Toolkit + React Query
- UI Components: React Native Paper + Custom Components
- Navigation: React Navigation v6

### Application Structure

#

/mobile

├── /assets              # Static assets

├── /src

│   ├── /components      # Reusable UI components

│   ├── /features        # Feature-based modules

│   ├── /hooks           # Custom React hooks

│   ├── /lib             # Utility libraries

│   ├── /navigation      # Navigation configuration

│   ├── /screens         # App screens

│   ├── /services        # API service integrations

│   ├── /store           # Redux store configuration

│   ├── /styles          # Global styles and themes

│   └── /types           # TypeScript definitions

### Screen Structure

#

Each screen follows a consistent structure:

/screens/example-screen

├── ExampleScreen.tsx               # Main screen component

├── components/                     # Screen-specific components

│   ├── ExampleHeader.tsx           # Screen header

│   ├── ExampleContent.tsx          # Main content

│   └── ExampleFooter.tsx           # Screen footer

├── hooks/                          # Screen-specific hooks

│   └── useExampleData.ts           # Data fetching logic

└── types.ts                        # Screen-specific types

### Navigation

#

The mobile app uses React Navigation with:

1.  Navigation Types:

- Stack Navigator for sequential screens
- Tab Navigator for main sections
- Drawer Navigator for settings and less frequent options

3.  Navigation Patterns:

- Deep linking support
- Screen transitions
- Navigation state persistence
- Type-safe navigation with TypeScript

### Offline Support

#

The mobile application is designed with offline-first principles:

1.  Data Persistence:

- Watermelon DB for structured data storage
- AsyncStorage for simple key-value storage
- File system for images and documents

3.  Synchronization:

- Background synchronization when online
- Queue-based operations for offline actions
- Conflict resolution strategies
- Sync status indicators

5.  Offline UI:

- Offline mode indicators
- Graceful degradation of features
- Cached content display
- Offline form submission

### Device Features Integration

#

The mobile app leverages device capabilities:

1.  Camera Integration:

- Barcode/QR code scanning
- Photo capture for documentation
- Image processing
- Camera roll access

3.  Location Services:

- GPS tracking
- Geofencing
- Map integration
- Address verification

5.  Notifications:

- Push notifications
- Local notifications
- Notification grouping
- Deep linking from notifications

7.  Sensors:

- Accelerometer for motion detection
- Gyroscope for orientation
- Magnetometer for compass
- Light sensor for adaptive UI

### Performance Considerations

#

Mobile-specific performance optimizations:

1.  Rendering Optimization:

- FlatList with recycling for long lists
- Image caching and lazy loading
- Render throttling for animations
- Component memoization

3.  Memory Management:

- Cleanup of large objects
- Asset unloading when not needed
- Memory usage monitoring
- Screen cleanup on navigation

5.  Battery Optimization:

- Efficient location polling
- Background task management
- Network request batching
- Sensor usage optimization

7.  Network Efficiency:

- Compressed API payloads
- Image resizing before upload
- Selective sync for large datasets
- Connection-aware fetching

## User Interface Screens

### Web Application Screens

#### 1\. Authentication Screens

#

- Login
- Password Reset
- Multi-factor Authentication

#### 2\. Dashboard Screens

#

- Executive Dashboard
- Operational Dashboard
- Financial Dashboard
- Customer Dashboard
- HR Dashboard

#### 3\. Operational Screens

#

- Pickup Management
- Shipment Management
- Loading Management
- Delivery Management
- Return Management
- Tracking & Monitoring

#### 4\. Administrative Screens

#

- Branch Management
- Division Management
- Employee Management
- Vehicle Management
- User Management
- Role Management

#### 5\. Financial Screens

#

- Sales & Invoicing
- Billing & Collection
- Cash Management
- Accounting Management
- Financial Reports

#### 6\. Settings & Configuration Screens

#

- System Settings
- User Preferences
- Notification Settings
- Integration Settings

### Mobile Application Screens

#### 1\. Checker App Screens

#

- Login & Authentication
- Pickup Verification
- Item Inspection
- Photo Documentation
- Digital Forms
- Barcode Scanning
- Weight & Dimensions Recording

#### 2\. Driver App Screens

#

- Login & Authentication
- Daily Tasks
- Navigation & Routes
- Pickup Execution
- Delivery Execution
- Proof of Delivery
- COD Collection
- Status Updates

#### 3\. Debt Collector App Screens

#

- Login & Authentication
- Collection Tasks
- Customer Information
- Payment Recording
- Visit Documentation
- Collection Route
- Collection History

#### 4\. Warehouse App Screens

#

- Login & Authentication
- Inventory Management
- Shipment Processing
- Loading Management
- Returns Processing
- Barcode Operations
- Task Assignment

## Component Library

### Core UI Components

#### 1\. Layout Components

#

- MainLayout: Basic layout with header, sidebar, content area, and footer
- DashboardLayout: Layout for dashboard pages with widgets
- FormLayout: Layout for form pages with consistent styling
- PrintLayout: Layout for printable documents

#### 2\. Navigation Components

#

- Sidebar: Main navigation for web application
- Navbar: Top navigation bar
- Breadcrumbs: Path indication for nested pages
- TabNav: Tab-based navigation for screens
- Pagination: Controls for paginated content

#### 3\. Data Display Components

#

- DataTable: Sortable, filterable, paginated table
- DataGrid: Grid-based data display
- Timeline: Chronological event display
- StatusBadge: Visual indicator for status
- Card: Container for grouped content
- Stats: Numeric statistics with labels

#### 4\. Form Components

#

- FormBuilder: Dynamic form constructor
- Input: Text input field with validation
- Select: Dropdown selection
- DatePicker: Calendar-based date selection
- TimePicker: Time selection
- Checkbox: Boolean selection
- RadioGroup: Exclusive option selection
- FileUpload: File selection and upload
- FormGroup: Grouped form controls
- FormActions: Form button container

#### 5\. Feedback Components

#

- Alert: Contextual feedback messages
- Toast: Temporary notifications
- Progress: Process completion indicator
- Skeleton: Loading placeholder
- Empty: Empty state indication
- ErrorBoundary: Error containment

#### 6\. Modal Components

#

- Modal: Overlay dialog
- Drawer: Side panel
- Popover: Contextual overlay
- Tooltip: Help text on hover
- ConfirmDialog: Action confirmation

#### 7\. Visualization Components

#

- LineChart: Trend visualization
- BarChart: Comparison visualization
- PieChart: Proportion visualization
- GaugeChart: Single metric visualization
- HeatMap: Density visualization

#### 8\. Map Components

#

- LocationMap: Single location display
- RouteMap: Path visualization
- AreaMap: Geographic region display
- ClusterMap: Multiple location visualization

### Mobile-Specific Components

#### 1\. Navigation Components

#

- BottomTabs: Main navigation tabs
- HeaderBar: Screen header with actions
- BackButton: Navigation back control
- MenuDrawer: Side menu

#### 2\. Input Components

#

- TouchableInput: Touch-optimized inputs
- SignaturePad: Digital signature capture
- CameraCapture: Photo capture component
- BarcodeScanner: Code scanning component
- LocationPicker: Map-based location selection

#### 3\. Display Components

#

- SwipeActions: Swipe gesture actions
- CollapsibleSection: Expandable content
- StepIndicator: Multi-step progress
- PullToRefresh: Refresh gesture control
- OfflineIndicator: Connection status display

## User Interactions and Workflows

### Common Web Workflows

#### 1\. Creating a Pickup Request

#

1.  Navigate to Pickup Management
2.  Click "New Pickup Request"
3.  Enter customer information or select existing customer
4.  Enter pickup address and contact details
5.  Enter item details (type, quantity, dimensions)
6.  Select pickup date and time window
7.  Submit request
8.  System validates and confirms creation

#### 2\. Processing a Shipment

#

1.  Navigate to Shipment Management
2.  Filter/search for incoming items
3.  Select items to process
4.  Verify weight and dimensions
5.  Assign service type and calculate cost
6.  Generate waybill
7.  Assign to truck for inter-branch or local delivery
8.  Print necessary documents

#### 3\. Financial Reporting

#

1.  Navigate to Financial Reports
2.  Select report type (revenue, expenses, etc.)
3.  Set date range and other parameters
4.  Generate report
5.  View visualization and data tables
6.  Export to Excel/PDF if needed
7.  Print or share report

### Common Mobile Workflows

#### 1\. Pickup Execution (Driver App)

#

1.  Login to Driver App
2.  View assigned pickup tasks
3.  Select a pickup task
4.  Navigate to pickup location
5.  Update status to "Arrived"
6.  Verify items with customer
7.  Capture photos of items
8.  Get customer signature
9.  Update status to "Completed"
10. System syncs data when online

#### 2\. Item Verification (Checker App)

#

1.  Login to Checker App
2.  Scan waybill barcode
3.  Verify item count and condition
4.  Measure and record dimensions
5.  Weigh items and record weight
6.  Capture photos if needed
7.  Mark verification as complete
8.  System updates item status

#### 3\. Debt Collection (Debt Collector App)

#

1.  Login to Debt Collector App
2.  View assigned collection tasks
3.  Select a collection task
4.  Navigate to customer location
5.  Record visit details
6.  Process payment if collected
7.  Capture payment proof
8.  Update collection status
9.  Get confirmation signature
10. System syncs data when online

## Responsive Design Strategy

### Breakpoints

#

The web application uses responsive breakpoints:

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px
- Large Desktop: > 1280px

### Responsive Patterns

#

1.  Layout Adaptation:

- Stack layouts on small screens
- Side-by-side on larger screens
- Fluid grids for flexibility
- Strategic white space

3.  Navigation Transformation:

- Sidebar collapses to hamburger menu
- Full navigation to priority actions
- Bottom navigation on mobile
- Breadcrumbs collapse on small screens

5.  Content Prioritization:

- Critical content first on mobile
- Progressive disclosure
- Responsive tables with horizontal scroll
- Card-based layouts on small screens

7.  Touch Optimization:

- Larger touch targets on mobile
- Gesture-based interactions
- Mobile-first form elements
- Thumb-friendly action placement

## Accessibility Features

#

The applications follow accessibility best practices:

1.  Semantic Markup:

- Proper heading hierarchy
- Semantic HTML elements
- ARIA roles and attributes
- Meaningful element relationships

3.  Keyboard Navigation:

- Focus management
- Keyboard shortcuts
- Skip navigation links
- Focus indicators

5.  Screen Reader Support:

- Alt text for images
- ARIA labels for UI elements
- Status announcements
- Form field associations

7.  Visual Accessibility:

- Sufficient color contrast
- Text resizing
- Color not used alone for meaning
- Motion/animation controls

## Performance Optimization

### Web Performance

#

1.  Initial Load Optimization:

- Code splitting
- Tree shaking
- Critical CSS
- Font optimization
- Image optimization

3.  Runtime Optimization:

- Virtualized lists
- Memoization
- Debounced inputs
- Deferred rendering
- Web Workers for heavy computation

### Mobile Performance

#

1.  Startup Optimization:

- App size reduction
- Splash screen optimization
- Lazy asset loading
- Component preloading

3.  Runtime Optimization:

- Native list components
- Image caching
- Memory management
- Component recycling
- Background task management

## Testing Strategy

### Unit Testing

#

- Test individual components in isolation
- Verify component behavior under different props
- Test hooks and utility functions
- Mock external dependencies

### Integration Testing

#

- Test component interactions
- Verify form submissions and validations
- Test navigation flows
- Test API integration

### End-to-End Testing

#

- Test complete user flows
- Verify cross-screen functionality
- Test authentication flows
- Test data persistence

### Mobile-Specific Testing

#

- Test on multiple device sizes
- Verify touch interactions
- Test offline functionality
- Test device feature integration

## Implementation Guidelines

### Coding Standards

#

1.  JavaScript/TypeScript Standards:

- Follow Airbnb JavaScript Style Guide
- Use TypeScript for type safety
- Use ES6+ features
- Avoid any and explicit type casting

3.  React Best Practices:

- Functional components with hooks
- Pure components when possible
- Appropriate component splitting
- Consistent prop naming

5.  CSS/Styling Standards:

- Follow Tailwind CSS conventions
- Use utility classes for consistency
- Custom components for complex UI
- Responsive design from the start

### Documentation

#

1.  Component Documentation:

- Purpose and usage
- Props and their types
- Examples
- Edge cases and limitations

3.  Code Comments:

- Document complex logic
- Explain non-obvious solutions
- TODO items for future work
- Reference related issues or PRs

5.  Architectural Documentation:

- Data flow diagrams
- Component hierarchy
- State management patterns
- Integration points

### Development Workflow

#

1.  Feature Development:

- Create feature branch
- Implement components and tests
- Submit pull request
- Address code review feedback
- Merge to main branch

3.  Bug Fixes:

- Reproduce bug
- Write failing test
- Fix bug
- Verify test passes
- Submit pull request

5.  Refactoring:

- Ensure test coverage
- Incremental refactoring
- No feature changes
- Comprehensive testing
