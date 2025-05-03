import React from 'react';
import { Metadata } from 'next';
import PickupScheduleVisualization from '@/components/organisms/pickup/PickupScheduleVisualization';

export const metadata = {
  title: 'Pickup Schedule - Samudra Paket',
  description: 'Visual representation of pickup schedules in the Samudra Paket ERP system',
};

/**
 * Pickup Schedule Visualization Page
 * Provides a visual representation of pickup schedules
 * Helps operations teams to better plan and manage pickup activities
 */
export default function PickupSchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pickup Schedule</h1>
      </div>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <PickupScheduleVisualization />
      </div>
    </div>
  );
}
