import React from 'react';
import { Metadata } from 'next';
import PickupRequestForm from '@/components/organisms/pickup/PickupRequestForm';

export const metadata = {
  title: 'Create Pickup Request - Samudra Paket',
  description: 'Create a new pickup request in the Samudra Paket ERP system',
};

/**
 * Create Pickup Request Page
 * Allows users to create new pickup requests with all necessary information
 */
export default function CreatePickupRequestPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Create Pickup Request</h1>
      </div>
      <div className="bg-white shadow-sm rounded-lg p-6">
        <PickupRequestForm />
      </div>
    </div>
  );
}
