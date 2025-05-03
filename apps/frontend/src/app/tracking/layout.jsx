/**
 * Samudra Paket ERP - Tracking & Monitoring Layout
 * Layout component for tracking and monitoring section
 */

'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, BarChart2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function TrackingLayout({ children }) {
  const pathname = usePathname();
  const currentPath = pathname.split('/').pop();
  
  const isActive = (path) => {
    if (path === 'tracking' && currentPath === 'tracking') {
      return true;
    }
    return currentPath === path;
  };

  return (
    <div className="space-y-6">
      <div className="border-b">
        <div className="container flex h-14 items-center px-4 sm:px-6">
          <Tabs value={isActive('dashboard') ? 'dashboard' : 'tracking'} className="w-full">
            <TabsList className="w-full max-w-md">
              <TabsTrigger value="tracking" asChild className="flex-1">
                <Link href="/tracking" className="w-full">
                  <MapPin className="h-4 w-4 mr-2" />
                  Shipment Tracking
                </Link>
              </TabsTrigger>
              <TabsTrigger value="dashboard" asChild className="flex-1">
                <Link href="/tracking/dashboard" className="w-full">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Operational Dashboard
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div className="container">{children}</div>
    </div>
  );
}
