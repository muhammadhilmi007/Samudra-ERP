# File Structure Document

## Overview

#

This document outlines the file and directory structure for the Samudra Paket ERP System. The system is organized into a monorepo structure using Turborepo to manage the various packages and applications, allowing for easier management of shared code and consistent development practices.

## Repository Root Structure

#

/samudra-paket-erp/

├── /apps/                    # Applications directory

│   ├── /web/                 # Web application (Next.js)

│   ├── /mobile/              # Mobile application (React Native/Expo)

│   ├── /api-gateway/         # API Gateway service

│   └── /services/            # Microservices directory

│       ├── /auth-service/    # Authentication service

│       ├── /user-service/    # User management service

│       ├── /operational-service/  # Operational service

│       ├── /finance-service/      # Finance service

│       └── /reporting-service/    # Reporting service

├── /packages/                # Shared packages directory

│   ├── /ui/                  # Shared UI components

│   ├── /config/              # Shared configuration

│   ├── /tsconfig/            # TypeScript configuration

│   ├── /eslint-config/       # ESLint configuration

│   └── /utils/               # Shared utilities

├── /docs/                    # Documentation

├── /infrastructure/          # Infrastructure as Code

├── /scripts/                 # Development and deployment scripts

├── .gitignore                # Git ignore file

├── .eslintrc.js              # ESLint configuration

├── .prettierrc               # Prettier configuration

├── README.md                 # Project overview

├── CHANGELOG.md              # Version history

├── package.json              # Root package file

├── turbo.json                # Turborepo configuration

└── pnpm-workspace.yaml       # PNPM workspace configuration

## Web Application Structure

#

/apps/web/

├── /public/                  # Static assets

├── /src/

│   ├── /components/          # Reusable UI components

│   │   ├── /atoms/           # Basic building blocks

│   │   ├── /molecules/       # Combinations of atoms

│   │   ├── /organisms/       # Complex UI components

│   │   └── /templates/       # Page layouts

│   │

│   ├── /features/            # Feature-based modules

│   │   ├── /auth/            # Authentication feature

│   │   ├── /dashboard/       # Dashboard feature

│   │   ├── /pickup/          # Pickup feature

│   │   ├── /shipment/        # Shipment feature

│   │   ├── /delivery/        # Delivery feature

│   │   ├── /finance/         # Finance feature

│   │   ├── /reporting/       # Reporting feature

│   │   └── /...              # Other features

│   │

│   ├── /hooks/               # Custom React hooks

│   ├── /lib/                 # Utility libraries

│   ├── /pages/               # Next.js pages

│   │   ├── /api/             # API routes

│   │   ├── /auth/            # Auth pages

│   │   ├── /dashboard/       # Dashboard pages

│   │   ├── /pickup/          # Pickup pages

│   │   ├── /shipment/        # Shipment pages

│   │   ├── /delivery/        # Delivery pages

│   │   ├── /finance/         # Finance pages

│   │   ├── /reporting/       # Reporting pages

│   │   ├── /settings/        # Settings pages

│   │   ├── \_app.js           # Application wrapper

│   │   ├── \_document.js      # Document wrapper

│   │   └── index.js          # Home page

│   │

│   ├── /services/            # API service integrations

│   ├── /store/               # Redux store configuration

│   │   ├── /slices/          # Redux slices

│   │   ├── store.js          # Store configuration

│   │   └── hooks.js          # Redux hooks

│   │

│   ├── /styles/              # Global styles and themes

│   ├── /types/               # Type definitions

│   └── /utils/               # Utility functions

│

├── /tests/                   # Tests

│   ├── /unit/                # Unit tests

│   ├── /integration/         # Integration tests

│   └── /e2e/                 # End-to-end tests

│

├── .env.example              # Environment variables example

├── next.config.js            # Next.js configuration

├── postcss.config.js         # PostCSS configuration

├── tailwind.config.js        # Tailwind CSS configuration

├── package.json              # Dependencies

└── README.md                 # Frontend documentation

## Mobile Application Structure

#

/apps/mobile/

├── /assets/                  # Static assets

│   ├── /fonts/               # Custom fonts

│   ├── /images/              # Images

│   └── /icons/               # Icons

│

├── /src/

│   ├── /components/          # Reusable UI components

│   │   ├── /common/          # Common components

│   │   ├── /forms/           # Form components

│   │   ├── /layout/          # Layout components

│   │   └── /specific/        # Feature-specific components

│   │

│   ├── /features/            # Feature-based modules

│   │   ├── /auth/            # Authentication feature

│   │   ├── /pickup/          # Pickup feature

│   │   ├── /delivery/        # Delivery feature

│   │   ├── /collection/      # Debt collection feature

│   │   ├── /warehouse/       # Warehouse feature

│   │   └── /...              # Other features

│   │

│   ├── /hooks/               # Custom React hooks

│   ├── /lib/                 # Utility libraries

│   ├── /navigation/          # Navigation configuration

│   │   ├── /stacks/          # Stack navigators

│   │   ├── /tabs/            # Tab navigators

│   │   ├── /drawer/          # Drawer navigator

│   │   ├── NavigationContainer.tsx  # Navigation container

│   │   ├── linking.ts        # Deep linking configuration

│   │   └── types.ts          # Navigation types

│   │

│   ├── /screens/             # App screens

│   │   ├── /auth/            # Authentication screens

│   │   ├── /checker/         # Checker app screens

│   │   ├── /driver/          # Driver app screens

│   │   ├── /collector/       # Debt collector app screens

│   │   ├── /warehouse/       # Warehouse app screens

│   │   └── /settings/        # Settings screens

│   │

│   ├── /services/            # API service integrations

│   ├── /store/               # Redux store configuration

│   │   ├── /slices/          # Redux slices

│   │   ├── store.ts          # Store configuration

│   │   └── hooks.ts          # Redux hooks

│   │

│   ├── /styles/              # Styles and themes

│   ├── /types/               # TypeScript definitions

│   ├── /utils/               # Utility functions

│   ├── App.tsx               # Main App component

│   └── index.ts              # Entry point

│

├── /tests/                   # Tests

│   ├── /unit/                # Unit tests

│   ├── /integration/         # Integration tests

│   └── /e2e/                 # End-to-end tests

│

├── app.json                  # Expo configuration

├── babel.config.js           # Babel configuration

├── tsconfig.json             # TypeScript configuration

├── package.json              # Dependencies

├── eas.json                  # Expo Application Services config

└── README.md                 # Mobile documentation

## API Gateway Structure

#

/apps/api-gateway/

├── /src/

│   ├── /routes/              # API routes

│   ├── /middlewares/         # Gateway middlewares

│   ├── /auth/                # Auth handlers

│   ├── /docs/                # API documentation

│   ├── /config/              # Gateway configuration

│   ├── index.js              # Gateway entry point

│   └── app.js                # Express application setup

│

├── /tests/                   # Tests

├── Dockerfile                # Docker configuration

├── .env.example              # Environment variables example

├── package.json              # Dependencies

└── README.md                 # Gateway documentation

## Microservice Structure

#

Each microservice follows a consistent structure:

/apps/services/example-service/

├── /src/

│   ├── /api/                 # API Layer

│   │   ├── /controllers/     # Request handlers

│   │   ├── /routes/          # Route definitions

│   │   ├── /middlewares/     # API middlewares

│   │   └── /validations/     # Input validation

│   │

│   ├── /domain/              # Domain Layer

│   │   ├── /models/          # Domain models

│   │   ├── /services/        # Domain services

│   │   ├── /events/          # Domain events

│   │   └── /errors/          # Domain errors

│   │

│   ├── /infrastructure/      # Infrastructure Layer

│   │   ├── /repositories/    # Data access

│   │   ├── /database/        # DB config & models

│   │   ├── /external/        # External services

│   │   └── /queues/          # Message queues

│   │

│   ├── /app/                 # Application Layer

│   │   ├── /use-cases/       # Business logic

│   │   ├── /commands/        # Command handlers

│   │   ├── /queries/         # Query handlers

│   │   └── /dtos/            # Data Transfer Objects

│   │

│   ├── /config/              # Service configuration

│   ├── index.js              # Service entry point

│   └── app.js                # Express application setup

│

├── /tests/                   # Tests

│   ├── /unit/                # Unit tests

│   ├── /integration/         # Integration tests

│   └── /e2e/                 # End-to-end tests

│

├── /scripts/                 # Service-specific scripts

├── Dockerfile                # Docker configuration

├── .env.example              # Environment variables example

├── package.json              # Dependencies

└── README.md                 # Service documentation

## Shared Packages Structure

#

/packages/

├── /ui/                      # Shared UI components

│   ├── /src/                 # Source code

│   │   ├── /atoms/           # Atomic components

│   │   ├── /molecules/       # Molecular components

│   │   ├── /organisms/       # Organism components

│   │   └── /index.ts         # Entry point

│   ├── package.json          # Package dependencies

│   └── tsconfig.json         # TypeScript configuration

│

├── /config/                  # Shared configuration

│   ├── /src/                 # Source code

│   │   ├── /environments/    # Environment configurations

│   │   ├── /constants/       # Shared constants

│   │   └── /index.ts         # Entry point

│   ├── package.json          # Package dependencies

│   └── tsconfig.json         # TypeScript configuration

│

├── /utils/                   # Shared utilities

│   ├── /src/                 # Source code

│   │   ├── /formatting/      # Formatting utilities

│   │   ├── /validation/      # Validation utilities

│   │   ├── /date/            # Date utilities

│   │   └── /index.ts         # Entry point

│   ├── package.json          # Package dependencies

│   └── tsconfig.json         # TypeScript configuration

│

├── /tsconfig/                # TypeScript configurations

│   ├── base.json             # Base configuration

│   ├── nextjs.json           # Next.js configuration

│   ├── react-native.json     # React Native configuration

│   └── node.json             # Node.js configuration

│

└── /eslint-config/           # ESLint configurations

    ├── base.js               # Base configuration

    ├── nextjs.js             # Next.js configuration

    ├── react-native.js       # React Native configuration

    └── node.js               # Node.js configuration

## Documentation Directory Structure

#

/docs/

├── /architecture/            # Architecture documentation

│   ├── overview.md           # System overview

│   ├── backend.md            # Backend architecture

│   ├── frontend.md           # Frontend architecture

│   ├── database.md           # Database design

│   └── integrations.md       # External integrations

│

├── /api/                     # API documentation

│   ├── auth.md               # Auth API

│   ├── users.md              # Users API

│   ├── pickup.md             # Pickup API

│   └── ...                   # Other API documentation

│

├── /deployment/              # Deployment documentation

│   ├── setup.md              # Environment setup

│   ├── railway.md            # Railway deployment

│   ├── ci-cd.md              # CI/CD pipeline

│   └── monitoring.md         # Monitoring setup

│

├── /development/             # Development guides

│   ├── getting-started.md    # Getting started guide

│   ├── coding-standards.md   # Coding standards

│   ├── testing.md            # Testing guidelines

│   └── contribution.md       # Contribution guidelines

│

└── /user/                    # User documentation

    ├── installation.md       # Installation guide

    ├── configuration.md      # Configuration guide

    ├── usage.md              # Usage instructions

    └── troubleshooting.md    # Troubleshooting guide

## Infrastructure Directory Structure

#

/infrastructure/

├── /railway/                 # Railway deployment configuration

│   ├── /dev/                 # Development environment

│   ├── /staging/             # Staging environment

│   └── /prod/                # Production environment

│

├── /docker/                  # Docker configurations

│   ├── /services/            # Service-specific Dockerfiles

│   └── docker-compose.yml    # Docker Compose configuration

│

├── /monitoring/              # Monitoring configurations

│   ├── /prometheus/          # Prometheus configuration

│   └── /grafana/             # Grafana dashboards

│

└── /scripts/                 # Infrastructure scripts

    ├── deploy.sh             # Deployment script

    ├── backup.sh             # Backup script

    └── restore.sh            # Restore script

## Scripts Directory Structure

#

/scripts/

├── /setup/                   # Setup scripts

│   ├── install-deps.sh       # Install dependencies

│   ├── setup-dev-env.sh      # Set up development environment

│   └── setup-db.sh           # Set up database

│

├── /development/             # Development scripts

│   ├── start-dev.sh          # Start development environment

│   ├── generate-api-docs.sh  # Generate API documentation

│   └── seed-db.sh            # Seed database with test data

│

├── /testing/                 # Testing scripts

│   ├── run-tests.sh          # Run all tests

│   ├── run-unit-tests.sh     # Run unit tests

│   └── run-e2e-tests.sh      # Run end-to-end tests

│

├── /deployment/              # Deployment scripts

│   ├── deploy-dev.sh         # Deploy to development

│   ├── deploy-staging.sh     # Deploy to staging

│   └── deploy-prod.sh        # Deploy to production

│

└── /maintenance/             # Maintenance scripts

    ├── backup-db.sh          # Backup database

    ├── migrate-db.sh         # Run database migrations

    └── clear-logs.sh         # Clear log files

## Turborepo Configuration

#

The turbo.json file at the root of the project defines the Turborepo configuration:

{

  "$schema": "https://turbo.build/schema.json",

  "pipeline": {

    "build": {

      "dependsOn": \["^build"\],

      "outputs": \["dist/\*\*", ".next/\*\*", "build/\*\*"\]

    },

    "test": {

      "dependsOn": \["^build"\],

      "outputs": \[\]

    },

    "lint": {

      "outputs": \[\]

    },

    "dev": {

      "cache": false

    }

  }

}

## PNPM Workspace Configuration

#

The pnpm-workspace.yaml file at the root of the project defines the PNPM workspace:

packages:

  - 'apps/\*'

  - 'packages/\*'

## File Naming Conventions

### General Conventions

#

- Use kebab-case for directory names: /example-directory/
- Use camelCase for file names: exampleFile.js
- Use PascalCase for React components: ExampleComponent.jsx
- Use camelCase for utility functions: exampleUtil.js
- Use snake_case for environment variables: EXAMPLE_ENV_VAR

### JavaScript/TypeScript Files

#

- React components: ComponentName.jsx or ComponentName.tsx
- Hooks: useHookName.js or useHookName.ts
- Context providers: NameContext.js or NameContext.ts
- Redux slices: nameSlice.js or nameSlice.ts
- API services: nameService.js or nameService.ts
- Utility files: nameUtil.js or nameUtil.ts
- Type definitions: nameTypes.js or nameTypes.ts
- Test files: fileName.test.js or fileName.test.ts

### CSS/Styling Files

#

- Component styles: ComponentName.module.css or ComponentName.styles.js
- Global styles: global.css or theme.js
- Tailwind configuration: tailwind.config.js

### Configuration Files

#

- Environment variables: .env.development, .env.production
- Configuration files: name.config.js
- Package manager files: package.json
- Git configuration: .gitignore, .gitattributes
- Editor configuration: .editorconfig
- Linting configuration: .eslintrc.js, .prettierrc

## Import Conventions

### Absolute Imports

#

The project uses absolute imports for better readability and maintainability:

// Backend

import { someUtil } from '@shared/utils';

import { SomeModel } from '@domain/models';

import { SomeService } from '@app/services';

// Frontend

import { Button } from '@components/atoms';

import { useAuth } from '@hooks/auth';

import { userService } from '@services/user';

import { formatDate } from '@utils/date';

### Import Ordering

#

Imports should be ordered as follows:

1.  External libraries and frameworks
2.  Absolute imports from project
3.  Relative imports
4.  Style imports

Example:

// External libraries

import React, { useState, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

// Absolute imports

import { Button } from '@components/atoms';

import { useAuth } from '@hooks/auth';

// Relative imports

import { someFunction } from '../utils';

import { SomeComponent } from './SomeComponent';

// Styles

import styles from './styles.module.css';

## Development Environment Setup

#

To set up the development environment:

Clone the repository

git clone https://github.com/your-org/samudra-paket-erp.git

cd samudra-paket-erp

1.

Install PNPM (if not already installed)

npm install -g pnpm

2.

Install dependencies

pnpm install

3.

Set up environment variables

cp apps/api-gateway/.env.example apps/api-gateway/.env

cp apps/web/.env.example apps/web/.env

cp apps/mobile/.env.example apps/mobile/.env

4.

Start development servers

\# Start all services in development mode

pnpm dev

\# Or start specific services

pnpm --filter web dev

pnpm --filter api-gateway dev

pnpm --filter mobile dev

5.

## Version Control Guidelines

### Branch Naming Convention

#

- Feature branches: feature/feature-name
- Bug fix branches: fix/bug-name
- Release branches: release/version-number
- Hotfix branches: hotfix/issue-name

### Commit Message Convention

#

- Format: type(scope): message
- Types: feat, fix, docs, style, refactor, test, chore
- Example: feat(auth): implement multi-factor authentication

### Pull Request Guidelines

#

- Descriptive title that summarizes the change
- Reference related issues with #issue-number
- Clear description of changes and testing performed
- Request reviews from appropriate team members
- Ensure all CI checks pass before merging

## Conclusion

#

This file structure document provides a comprehensive overview of the organization and naming conventions for the Samudra Paket ERP System using Turborepo. Following these guidelines will ensure consistency across the codebase and make it easier for team members to navigate and contribute to the project.
