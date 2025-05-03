import React from 'react';
import { Metadata } from 'next';
import PickupRequestList from '@/components/organisms/pickup/PickupRequestList';

export const metadata = {
  title: 'Pickup Requests - Samudra Paket',
  description: 'View and manage pickup requests in the Samudra Paket ERP system',
};

/**
 * Pickup Request List Page
 * Displays all pickup requests with filtering and search capabilities
 */
export default function PickupRequestListPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pickup Requests</h1>
        <a 
          href="/pickup/create" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Create New Request
        </a>
      </div>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <PickupRequestList />
      </div>
    </div>
  );
}
