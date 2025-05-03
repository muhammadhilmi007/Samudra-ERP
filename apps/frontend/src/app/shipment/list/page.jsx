/**
 * Samudra Paket ERP - Shipment List Page
 * List of all shipments with search and filtering capabilities
 */

import React from 'react';
import ShipmentList from '@/components/organisms/shipment/ShipmentList';
import { PageTitle } from '@/components/molecules/PageTitle';

export const metadata = {
  title: 'Shipment List | Samudra Paket ERP',
  description: 'Manage and track shipments',
};

export default function ShipmentListPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageTitle 
        title="Shipment List" 
        description="Manage and track all shipments"
        actionButton={{
          href: '/shipment/create',
          label: 'Create Shipment',
        }}
      />
      
      <ShipmentList />
    </div>
  );
}
