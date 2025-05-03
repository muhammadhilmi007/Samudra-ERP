/**
 * Samudra Paket ERP - Tracking Timeline Component
 * Visualizes the shipment journey with a timeline interface
 */

import React from 'react';
import { formatDate, formatTime } from '@/lib/dateUtils';
import StatusBadge from '@/components/atoms/tracking/StatusBadge';

const TrackingTimeline = ({ statusHistory = [] }) => {
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-muted-foreground">No tracking information available</p>
      </div>
    );
  }

  // Sort status history by timestamp in descending order (newest first)
  const sortedStatusHistory = [...statusHistory].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="relative">
      {/* Timeline connector line */}
      <div className="absolute top-0 bottom-0 left-6 border-l-2 border-muted"></div>
      
      <div className="space-y-8 relative">
        {sortedStatusHistory.map((status, index) => (
          <div key={index} className="flex gap-4 relative">
            <div className="w-3 h-3 rounded-full mt-1.5 bg-primary border-4 border-background z-10"></div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-2">
                <StatusBadge 
                  status={status.status} 
                  withTooltip={!!status.notes}
                  description={status.notes}
                />
                <span className="text-sm text-muted-foreground">
                  {formatDate(status.timestamp)} • {formatTime(status.timestamp)}
                </span>
              </div>
              {status.location && (
                <p className="text-sm mt-1">{status.location}</p>
              )}
              {status.user && (
                <p className="text-xs text-muted-foreground mt-1">
                  Updated by: {status.user.name || status.user}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackingTimeline;
