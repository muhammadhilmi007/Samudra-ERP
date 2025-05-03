/**
 * Samudra Paket ERP - Tracking & Monitoring Dashboard Page
 * Central operational monitoring dashboard for shipment tracking and alerts
 */

'use client';

import React from 'react';
import OperationalDashboard from '@/components/organisms/tracking/OperationalDashboard';
import NotificationCenter from '@/components/organisms/tracking/NotificationCenter';
import { PageTitle } from '@/components/molecules/PageTitle';

export default function TrackingDashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageTitle 
        title="Tracking & Monitoring Dashboard" 
        description="Monitor shipment operations and performance metrics"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OperationalDashboard />
        </div>
        <div>
          <NotificationCenter />
        </div>
      </div>
    </div>
  );
}
