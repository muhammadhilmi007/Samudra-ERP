/**
 * Samudra Paket ERP - Frontend
 * Root layout component
 */

import './globals.css';

export const metadata = {
  title: 'Samudra Paket ERP',
  description: 'Enterprise Resource Planning system for PT. Sarana Mudah Raya',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
