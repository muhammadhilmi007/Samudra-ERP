/**
 * Samudra Paket ERP - Breadcrumbs Component
 * Navigation breadcrumbs for improved user experience
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Breadcrumbs({ items, className, homeHref = "/" }) {
  const pathname = usePathname();
  
  // Generate breadcrumb items from current path if not provided
  const breadcrumbs = items || generateBreadcrumbs(pathname);
  
  return (
    <nav className={cn("flex text-sm text-muted-foreground", className)} aria-label="Breadcrumbs">
      <ol className="flex flex-wrap items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link 
            href={homeHref}
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>
        
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={index} className="inline-flex items-center space-x-1 md:space-x-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" aria-hidden="true" />
            {index === breadcrumbs.length - 1 ? (
              <span className="text-foreground font-medium" aria-current="page">
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Generate breadcrumb items based on current path
 * @param {string} pathname - Current path
 * @returns {Array} Array of breadcrumb items
 */
function generateBreadcrumbs(pathname) {
  if (!pathname) return [];
  
  const segments = pathname.split('/').filter(Boolean);
  
  // Map special cases and ID segments to readable names
  const pathMap = {
    'shipment': 'Shipment Management',
    'create': 'Create Shipment',
    'list': 'Shipment List',
    'edit': 'Edit Shipment',
    'tracking': 'Track Shipment',
    'document': 'Waybill Document',
    'pricing-calculator': 'Pricing Calculator',
    'customer': 'Customer Management',
    'warehouse': 'Warehouse Management',
    'finance': 'Finance Management',
    'settings': 'Settings',
    'dashboard': 'Dashboard',
  };
  
  return segments.map((segment, index) => {
    // Build the href based on segments up to this point
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    
    // Check if this is an ID segment (UUID or waybill number pattern)
    const isIdSegment = segment.match(/^[a-f0-9]{24}$/) || // MongoDB ObjectId
                        segment.match(/^SM\d{8}\w{4}$/); // Waybill pattern
    
    // For ID segments, use a generic label or fetch data
    let label = isIdSegment ? 'Details' : (pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1));
    
    return { href, label };
  });
}
