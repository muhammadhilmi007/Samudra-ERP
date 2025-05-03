/**
 * Samudra Paket ERP - Pricing Calculator Page
 * Provides a standalone interface for calculating shipping prices
 */

'use client';

import React from 'react';
import PricingCalculator from '@/components/organisms/shipment/PricingCalculator';
import { PageTitle } from '@/components/molecules/PageTitle';

export default function PricingCalculatorPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageTitle 
        title="Shipping Price Calculator" 
        description="Calculate shipping prices based on origin, destination, weight, and dimensions"
        backButton={{
          href: '/shipment/list',
          label: 'Back to Shipments',
        }}
      />
      
      <PricingCalculator />
    </div>
  );
}
