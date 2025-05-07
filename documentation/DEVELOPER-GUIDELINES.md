# Developer Guidelines and Coding Standards

## General Code Style & Formatting

- Follow the Airbnb Style Guide for code formatting
- Use ESLint and Prettier for consistent code styling across the codebase
- Use PascalCase for React component file names (e.g., `PickupForm.jsx`, not `pickup-form.jsx`)
- Use camelCase for JavaScript/TypeScript variables, functions, and instances
- Use PascalCase for TypeScript interfaces and types
- Prefer named exports for components to improve code traceability and debugging
- Add JSDoc comments for complex functions explaining their purpose and parameters
- Limit line length to 100 characters for improved readability
- Use async/await over promise chains for asynchronous operations

## Project Structure & Architecture

### Frontend Structure

```
/frontend
├── /public  # Static assets
├── /src
    ├── /components  # Reusable UI components
    │   ├── /atoms  # Basic building blocks (buttons, inputs)
    │   ├── /molecules  # Combinations of atoms (form fields, cards)
    │   ├── /organisms  # Complex UI components (tables, forms)
    │   └── /templates  # Page layouts
    ├── /features  # Feature-based modules
    │   ├── /auth  # Authentication related features
    │   ├── /dashboard  # Dashboard related features
    │   ├── /pickup  # Pickup related features
    │   └── ...
    ├── /hooks  # Custom React hooks
    ├── /lib  # Utility libraries
    ├── /pages  # Next.js pages
    ├── /services  # API service integrations
    ├── /store  # Context providers
    ├── /styles  # Global styles and themes
    └── /types  # TypeScript type definitions
```

### Backend Structure

```
/service-name
├── /src
│   ├── /api  # API Layer
│   ├── /domain  # Domain Layer
│   ├── /infrastructure  # Infrastructure Layer
│   ├── /app  # Application Layer
│   └── /config  # Service configuration
├── /tests
│   ├── /unit
│   ├── /integration
│   └── /e2e
├── package.json
└── Dockerfile
```

## Styling & UI

- Use Tailwind CSS for styling
- Implement the color palette:
  - Primary: `#2563EB` (Blue)
  - Secondary: `#10B981` (Green)
  - Accent: `#F59E0B` (Amber)
  - Neutral: `#64748B` (Slate)
- Use Shadcn UI for components integrated with Tailwind CSS
- Follow the spacing system based on a 4px unit
- Implement responsive design with breakpoints:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
  - Large desktop: > 1280px
- Ensure accessibility compliance with WCAG 2.1 Level AA

## Data Fetching & Forms

- Use TanStack Query (react-query) for frontend data fetching
- Implement optimistic updates for UI responsiveness
- Use React Hook Form for form handling, including validation and error messages
- Use Zod for schema validation in both frontend and backend
- Follow consistent error handling patterns
- Implement the API format standards:
  - Request format: URL parameters, query parameters, request body (JSON)
  - Success response: `{ success: true, data: {...}, meta: {...} }`
  - Error response: `{ success: false, error: { code: "...", message: "...", details: {...} } }`

## State Management & Logic

- Use React Context for state management, structuring contexts by feature domain
- Use Redux Toolkit for global state management
- Use Context API for localized state
- Implement the event-driven architecture for service communication
- Follow the business logic separation as outlined in the hexagonal architecture pattern
- Implement proper error boundaries and fallbacks for resilient UI

## Backend & Database

- Use MongoDB with Mongoose ODM
- Use embedded document structure
- Follow the database schema design for all collections
- Implement the indexing strategy
- Use Node.js with Express.js for backend services
- Implement JWT-based authentication
- Follow the RBAC authorization model
- Use Redis for caching
- Implement the API endpoints as defined in the TDD

## Mobile Development

- Use React Native with Expo and TypeScript for mobile development
- Implement offline-first architecture with synchronization queue
- Use Watermelon DB for local database
- Follow the mobile app module structure for Checker App, Driver App, and Debt Collector App
- Optimize for battery life and data usage
- Implement secure local storage for sensitive data

## Testing & Quality Assurance

- Maintain minimum 70% code coverage for unit tests
- Implement end-to-end testing for critical user flows
- Use Jest for unit testing JavaScript/TypeScript
- Use React Testing Library for component testing
- Use Supertest for API testing

## Version Control & Deployment

### Branching Strategy

- `main`: Kode produksi yang stabil
- `develop`: Branch pengembangan utama
- `feature/*`: Fitur baru
- `bugfix/*`: Perbaikan bug
- `release/*`: Persiapan rilis

### Commit and Push

- Commit sering dengan perubahan kecil dan terfokus
- Tulis pesan commit yang jelas dengan format: `[MODULE] Brief description`
- Jangan commit kode yang rusak atau tidak lulus test

### Pull Request and Merge

- Setiap PR harus ditinjau oleh minimal 1 developer lain
- PR harus lulus semua automated test dan build
- Gunakan squash merge untuk menjaga history yang bersih
