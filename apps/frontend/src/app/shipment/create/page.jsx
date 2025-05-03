/**
 * Samudra Paket ERP - Create Shipment Page
 * Form for creating new shipments
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ShipmentForm from '@/components/organisms/shipment/ShipmentForm';
import { PageTitle } from '@/components/molecules/PageTitle';

export default function CreateShipmentPage() {
  const router = useRouter();
  
  const handleSuccess = () => {
    router.push('/shipment/list');
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageTitle 
        title="Create Shipment" 
        description="Create a new shipment/resi"
        backButton={{
          href: '/shipment/list',
          label: 'Back to Shipments',
        }}
      />
      
      <ShipmentForm onSuccess={handleSuccess} />
    </div>
  );
}
