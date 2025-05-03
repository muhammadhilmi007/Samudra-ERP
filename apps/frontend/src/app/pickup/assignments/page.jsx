import React from 'react';
import { Metadata } from 'next';
import PickupAssignmentManagement from '@/components/organisms/pickup/PickupAssignmentManagement';

export const metadata = {
  title: 'Pickup Assignments - Samudra Paket',
  description: 'Manage pickup assignments and route optimization in the Samudra Paket ERP system',
};

/**
 * Pickup Assignment Management Page
 * Allows operations team to manage pickup assignments, including team allocation and route optimization
 */
export default function PickupAssignmentPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pickup Assignments</h1>
      </div>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <PickupAssignmentManagement />
      </div>
    </div>
  );
}
