'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Home Page
 * Redirects to login page or dashboard based on authentication status
 */
export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is authenticated (could be enhanced with actual auth check)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  // Return a loading state while redirecting
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">Samudra Paket ERP</h1>
        <p className="text-gray-600">Memuat aplikasi...</p>
      </div>
    </main>
  );
}
