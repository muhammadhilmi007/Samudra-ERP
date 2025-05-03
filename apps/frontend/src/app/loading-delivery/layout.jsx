/**
 * Samudra Paket ERP - Loading & Delivery Layout
 * Layout wrapper for all loading and delivery related pages
 */

import React from 'react';

export const metadata = {
  title: 'Loading & Delivery - Samudra Paket ERP',
  description: 'Loading and delivery management for Samudra Paket ERP System',
};

export default function LoadingDeliveryLayout({ children }) {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Loading & Delivery Operations</h1>
      <div className="bg-white rounded-lg p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
