/**
 * Samudra Paket ERP - Shipment Module Layout
 * Provides common layout elements for all shipment pages
 */

'use client';

import React from 'react';
import { ShipmentFormProvider } from '@/store/context/ShipmentFormContext';
import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';

export default function ShipmentLayout({ children }) {
  return (
    <ShipmentFormProvider>
      <div className="space-y-4">
        <div className="container mx-auto px-4 pt-2">
          <Breadcrumbs homeHref="/dashboard" />
        </div>
        {children}
      </div>
    </ShipmentFormProvider>
  );
}
