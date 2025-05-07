# Samudra Paket ERP

Enterprise Resource Planning system for PT. Sarana Mudah Raya (Samudra Paket), a logistics and shipping company operating throughout Indonesia.

## Tentang Proyek (About the Project)

Samudra Paket ERP adalah sistem terintegrasi yang mencakup seluruh proses bisnis perusahaan, dari pengambilan barang, pemrosesan di cabang, pengiriman antar cabang, penerimaan di cabang tujuan, hingga pengiriman ke penerima serta pengelolaan keuangan dan pelaporan.

### Modul Utama (Main Modules)

1. **Manajemen Cabang & Divisi** - Pengelolaan cabang, area layanan, divisi, dan posisi
2. **Manajemen Pegawai** - Pengelolaan data pegawai, absensi, dan cuti
3. **Pengambilan Barang (Pickup)** - Permintaan pickup, penugasan, dan eksekusi
4. **Penjualan & Pembuatan Resi** - Pembuatan order pengiriman dan perhitungan harga
5. **Muat & Langsir Barang** - Pengelolaan pemuatan dan pengiriman antar cabang
6. **Tracking & Monitoring** - Pelacakan kiriman dan notifikasi
7. **Keuangan & Akuntansi** - Pengelolaan kas, bank, dan pembukuan
8. **Penagihan** - Pengelolaan piutang dan penagihan
9. **HRD & Pelaporan** - Pengelolaan SDM dan laporan

## Project Structure

This project is set up as a monorepo using Turborepo and Yarn workspaces, with a mix of JavaScript and TypeScript.

### Apps and Packages

- `apps/backend`: Node.js/Express backend services (JavaScript)
- `apps/frontend`: Next.js web application (JavaScript)
- `apps/mobile`: React Native/Expo mobile application (TypeScript)
- `packages/shared`: Shared utilities and components (JavaScript)
- `packages/types`: TypeScript type definitions

## Development

### Prerequisites

- Node.js >= 18
- Yarn >= 1.22
- Git

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Start development servers:
   ```bash
   yarn dev
   ```

### Available Scripts

- `yarn build`: Build all packages and applications
- `yarn dev`: Start development servers for all applications
- `yarn lint`: Run linting for all packages and applications
- `yarn test`: Run tests for all packages and applications
- `yarn format`: Format code using Prettier
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
pnpm dev
```

## Deployment

This project is configured for deployment on Railway.app. For detailed setup instructions, see the [Railway Setup Guide](./documentation/RAILWAY-SETUP.md).

### Quick Deployment Steps

1. Create a Railway project
2. Set up MongoDB and Redis services
3. Configure environment variables
4. Connect to GitHub repository
5. Deploy the application

### Environment Variables

The application requires several environment variables to function properly. See the `.env.example` files in each application directory for the required variables.

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript
- **Database**: MongoDB
- **Cache**: Redis
- **Authentication**: JWT
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js with React
- **Language**: JavaScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Data Fetching**: React Query
- **Form Handling**: React Hook Form
- **Visualization**: Recharts

### Mobile
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **State Management**: Redux
- **Offline Storage**: WatermelonDB
- **Maps**: React Native Maps
- **Device Features**: Expo Camera, Expo Location

### DevOps
- **Deployment Platform**: Railway.app
- **CI/CD**: GitHub Actions (Railway integration)
- **Monitoring**: Railway built-in monitoring
- **Logging**: Railway logs
- **Database**: MongoDB on Railway
- **Caching**: Redis on Railway

## Project Timeline

- **Durasi Total:** 8 bulan
- **Pendekatan:** Agile dengan implementasi bertahap (modular)
- **Go-Live Target:** Akhir bulan ke-8

## Useful Links

- [Business Requirement Document (BRD)](./documentation/BRD.md)
- [Software Requirement Specification (SRS)](./documentation/SRS.md)
- [Technical Design Document (TDD)](./documentation/TDD.md)
- [Task Breakdown List](./documentation/Task-Breakdown-List.md)
- [Developer Guidelines](./documentation/DEVELOPER-GUIDELINES.md)
