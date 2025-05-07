import React from 'react';
import Head from 'next/head';
import PickupDashboard from '../../components/organisms/pickup/PickupDashboard';

export const metadata = {
  title: 'Manajemen Pengambilan',
  description: 'Kelola proses pengambilan paket',
};

/**
 * Pickup Management Dashboard Page
 * Displays overview of pickup operations including requests, assignments, and tracking
 */
export default function PickupManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pickup Management</h1>
      </div>
      <PickupDashboard />
    </div>
  );
}
