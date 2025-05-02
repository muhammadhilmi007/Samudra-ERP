/**
 * Samudra Paket ERP - Frontend
 * Root layout component
 */

import './globals.css';
import { Metadata } from 'next';
import ReduxProvider from '../store/provider';

export const metadata: Metadata = {
  title: 'Samudra Paket ERP',
  description: 'Enterprise Resource Planning system for PT. Sarana Mudah Raya',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-screen bg-gray-50">
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
