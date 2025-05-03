/**
 * Samudra Paket ERP - Status Badge Component
 * Displays shipment status with appropriate color coding
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const StatusBadge = ({ status, withTooltip = false, description = '' }) => {
  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const statusColors = {
      preparing: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      departed: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100',
      in_transit: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      arrived_at_destination: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100',
      unloaded: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
      completed: 'bg-green-100 text-green-800 hover:bg-green-100',
      cancelled: 'bg-red-100 text-red-800 hover:bg-red-100',
      delayed: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
      // For shipment orders
      created: 'bg-slate-100 text-slate-800 hover:bg-slate-100',
      processed: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      out_for_delivery: 'bg-violet-100 text-violet-800 hover:bg-violet-100',
      delivered: 'bg-green-100 text-green-800 hover:bg-green-100',
      failed_delivery: 'bg-rose-100 text-rose-800 hover:bg-rose-100',
      returned: 'bg-amber-100 text-amber-800 hover:bg-amber-100'
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  };
  
  // Format status for display
  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formattedStatus = formatStatus(status);
  
  if (withTooltip && description) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={`${getStatusBadgeColor(status)}`}>
              {formattedStatus}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <Badge className={`${getStatusBadgeColor(status)}`}>
      {formattedStatus}
    </Badge>
  );
};

export default StatusBadge;
