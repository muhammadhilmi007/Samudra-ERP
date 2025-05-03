/**
 * Samudra Paket ERP - Shipment Tracking Page
 * Allows tracking shipments by waybill number
 */

'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ShipmentTracker from '@/components/organisms/shipment/ShipmentTracker';
import { PageTitle } from '@/components/molecules/PageTitle';

export default function ShipmentTrackingPage() {
  const searchParams = useSearchParams();
  const waybill = searchParams.get('waybill') || '';
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageTitle 
        title="Shipment Tracking" 
        description="Track your shipment by waybill number"
        backButton={{
          href: '/shipment/list',
          label: 'Back to Shipments',
        }}
      />
      
      <ShipmentTracker initialWaybill={waybill} />
    </div>
  );
}
