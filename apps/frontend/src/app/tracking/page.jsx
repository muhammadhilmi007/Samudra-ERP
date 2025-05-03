/**
 * Samudra Paket ERP - Enhanced Tracking Page
 * Provides comprehensive shipment tracking interface with timeline and map visualization
 */

'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import EnhancedShipmentTracker from '@/components/organisms/tracking/EnhancedShipmentTracker';
import { PageTitle } from '@/components/molecules/PageTitle';

export default function EnhancedTrackingPage() {
  const searchParams = useSearchParams();
  const waybill = searchParams.get('waybill') || '';
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageTitle 
        title="Shipment Tracking" 
        description="Track your shipment with comprehensive details and real-time updates"
        backButton={{
          href: '/shipment/list',
          label: 'Back to Shipments',
        }}
      />
      
      <EnhancedShipmentTracker initialWaybill={waybill} />
    </div>
  );
}
