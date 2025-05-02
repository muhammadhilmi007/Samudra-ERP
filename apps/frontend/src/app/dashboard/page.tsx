'use client';

import React from 'react';
import MainLayout from '@/components/templates/MainLayout';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Dashboard Page
 * Main entry point after authentication
 */
const DashboardPage = () => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <MainLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary/10 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-primary mb-2">Pickup</h2>
            <p className="text-gray-600">Kelola permintaan pickup paket</p>
            <div className="mt-4">
              <span className="text-3xl font-bold">0</span>
              <span className="text-sm text-gray-500 ml-2">permintaan baru</span>
            </div>
          </div>
          
          <div className="bg-secondary/10 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-secondary mb-2">Pengiriman</h2>
            <p className="text-gray-600">Pantau status pengiriman paket</p>
            <div className="mt-4">
              <span className="text-3xl font-bold">0</span>
              <span className="text-sm text-gray-500 ml-2">dalam proses</span>
            </div>
          </div>
          
          <div className="bg-accent/10 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-accent mb-2">Pendapatan</h2>
            <p className="text-gray-600">Ringkasan pendapatan harian</p>
            <div className="mt-4">
              <span className="text-3xl font-bold">Rp0</span>
              <span className="text-sm text-gray-500 ml-2">hari ini</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h2>
          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
            Belum ada aktivitas terbaru
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
