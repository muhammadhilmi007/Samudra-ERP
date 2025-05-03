import React from 'react';
import { Metadata } from 'next';
import PickupTrackingDashboard from '@/components/organisms/pickup/PickupTrackingDashboard';

export const metadata = {
  title: 'Pickup Tracking - Samudra Paket',
  description: 'Real-time tracking and monitoring of pickup operations in the Samudra Paket ERP system',
};

/**
 * Pickup Tracking Dashboard Page
 * Provides real-time tracking and monitoring of pickup operations
 * Displays status updates, location tracking, and performance metrics
 */
export default function PickupTrackingPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pickup Tracking Dashboard</h1>
      </div>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <PickupTrackingDashboard />
      </div>
    </div>
  );
}
