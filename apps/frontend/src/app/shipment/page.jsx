/**
 * Samudra Paket ERP - Shipment Module Index Page
 * Entry point for the shipment module
 */

import React from 'react';
import Link from 'next/link';
import { PageTitle } from '@/components/molecules/PageTitle';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, CreditCard, List, Search, Calculator, Plus } from 'lucide-react';

export const metadata = {
  title: 'Shipment Management | Samudra Paket ERP',
  description: 'Manage shipments, create waybills, and track packages',
};

export default function ShipmentIndexPage() {
  const modules = [
    {
      title: 'Create Shipment',
      description: 'Create a new shipment waybill (STT)',
      icon: <Plus className="h-5 w-5" />,
      href: '/shipment/create',
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Shipment List',
      description: 'Manage and view all shipments',
      icon: <List className="h-5 w-5" />,
      href: '/shipment/list',
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      title: 'Track Shipment',
      description: 'Track shipment status by waybill number',
      icon: <Search className="h-5 w-5" />,
      href: '/shipment/tracking',
      color: 'bg-green-500/10 text-green-500',
    },
    {
      title: 'Pricing Calculator',
      description: 'Calculate shipping prices',
      icon: <Calculator className="h-5 w-5" />,
      href: '/shipment/pricing-calculator',
      color: 'bg-orange-500/10 text-orange-500',
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageTitle 
        title="Shipment Management" 
        description="Create, manage, and track shipments"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{module.title}</CardTitle>
                <div className={`p-2 rounded-full ${module.color}`}>
                  {module.icon}
                </div>
              </div>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-2">
              <Button asChild className="w-full">
                <Link href={module.href}>
                  Go to {module.title}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Shipments</CardTitle>
            <CardDescription>
              Recently created or updated shipments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-6">
              Connect to your account to view recent shipment activity
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
