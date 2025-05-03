/**
 * Samudra Paket ERP - Frontend
 * Root layout component
 */


import './globals.css';
import ReduxProvider from '../store/provider';
import { NotificationProvider } from '../store/context/NotificationContext';

export const metadata = {
  title: 'Samudra Paket ERP',
  description: 'Enterprise Resource Planning system for PT. Sarana Mudah Raya',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-screen bg-gray-50">
        <ReduxProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
