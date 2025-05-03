/**
 * Samudra Paket ERP - Sidebar Navigation
 * Main navigation sidebar for the application
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Package,
  TruckIcon,
  Users,
  Warehouse,
  FileText,
  CreditCard,
  Settings,
  ChevronDown,
  ChevronRight,
  BarChart,
} from 'lucide-react';

const NavItem = ({ href, icon, label, isActive, isOpen, hasChildren, onClick }) => (
  <Link
    href={href || '#'}
    className={cn(
      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
      isActive 
        ? 'bg-primary/10 text-primary' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    )}
    onClick={hasChildren ? onClick : undefined}
  >
    <span className="flex h-6 w-6 items-center justify-center">
      {icon}
    </span>
    <span className="flex-1">{label}</span>
    {hasChildren && (
      <span className="ml-auto h-4 w-4">
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </span>
    )}
  </Link>
);

const NavGroup = ({ children, isOpen }) => (
  <div className={cn(
    'pl-6 overflow-hidden transition-all duration-200',
    isOpen ? 'max-h-96' : 'max-h-0'
  )}>
    <div className="flex flex-col gap-1 pt-1">
      {children}
    </div>
  </div>
);

export function Sidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState({
    shipment: pathname?.startsWith('/shipment'),
    customer: pathname?.startsWith('/customer'),
    report: pathname?.startsWith('/report'),
  });

  const toggleGroup = (group) => {
    setOpenGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="px-3 py-2">
        <h2 className="text-xs font-semibold text-gray-500 uppercase">Main</h2>
      </div>

      <div className="flex flex-col gap-1">
        <NavItem 
          href="/dashboard" 
          icon={<Home className="h-5 w-5" />} 
          label="Dashboard" 
          isActive={pathname === '/dashboard'} 
        />

        {/* Shipment Navigation Group */}
        <NavItem 
          href="#" 
          icon={<Package className="h-5 w-5" />} 
          label="Shipment" 
          isActive={pathname?.startsWith('/shipment')} 
          isOpen={openGroups.shipment}
          hasChildren={true}
          onClick={() => toggleGroup('shipment')}
        />
        <NavGroup isOpen={openGroups.shipment}>
          <NavItem 
            href="/shipment" 
            label="Overview" 
            isActive={pathname === '/shipment'} 
          />
          <NavItem 
            href="/shipment/create" 
            label="Create Shipment" 
            isActive={pathname === '/shipment/create'} 
          />
          <NavItem 
            href="/shipment/list" 
            label="Shipment List" 
            isActive={pathname === '/shipment/list'} 
          />
          <NavItem 
            href="/shipment/tracking" 
            label="Track Shipment" 
            isActive={pathname === '/shipment/tracking'} 
          />
          <NavItem 
            href="/shipment/pricing-calculator" 
            label="Pricing Calculator" 
            isActive={pathname === '/shipment/pricing-calculator'} 
          />
        </NavGroup>

        {/* Inter-Branch Shipment */}
        <NavItem 
          href="/inter-branch-shipments" 
          icon={<TruckIcon className="h-5 w-5" />} 
          label="Inter-Branch" 
          isActive={pathname?.startsWith('/inter-branch-shipments')} 
        />

        {/* Customer Management */}
        <NavItem 
          href="#" 
          icon={<Users className="h-5 w-5" />} 
          label="Customers" 
          isActive={pathname?.startsWith('/customer')} 
          isOpen={openGroups.customer}
          hasChildren={true}
          onClick={() => toggleGroup('customer')}
        />
        <NavGroup isOpen={openGroups.customer}>
          <NavItem 
            href="/customer" 
            label="Overview" 
            isActive={pathname === '/customer'} 
          />
          <NavItem 
            href="/customer/list" 
            label="Customer List" 
            isActive={pathname === '/customer/list'} 
          />
          <NavItem 
            href="/customer/corporate" 
            label="Corporate Clients" 
            isActive={pathname === '/customer/corporate'} 
          />
        </NavGroup>

        {/* Warehouse */}
        <NavItem 
          href="/warehouse" 
          icon={<Warehouse className="h-5 w-5" />} 
          label="Warehouse" 
          isActive={pathname?.startsWith('/warehouse')} 
        />

        {/* Finance */}
        <NavItem 
          href="/finance" 
          icon={<CreditCard className="h-5 w-5" />} 
          label="Finance" 
          isActive={pathname?.startsWith('/finance')} 
        />

        {/* Reports */}
        <NavItem 
          href="#" 
          icon={<BarChart className="h-5 w-5" />} 
          label="Reports" 
          isActive={pathname?.startsWith('/report')} 
          isOpen={openGroups.report}
          hasChildren={true}
          onClick={() => toggleGroup('report')}
        />
        <NavGroup isOpen={openGroups.report}>
          <NavItem 
            href="/report/shipment" 
            label="Shipment Reports" 
            isActive={pathname === '/report/shipment'} 
          />
          <NavItem 
            href="/report/financial" 
            label="Financial Reports" 
            isActive={pathname === '/report/financial'} 
          />
          <NavItem 
            href="/report/performance" 
            label="Performance" 
            isActive={pathname === '/report/performance'} 
          />
        </NavGroup>

        {/* Settings */}
        <NavItem 
          href="/settings" 
          icon={<Settings className="h-5 w-5" />} 
          label="Settings" 
          isActive={pathname?.startsWith('/settings')} 
        />
      </div>
    </div>
  );
}
