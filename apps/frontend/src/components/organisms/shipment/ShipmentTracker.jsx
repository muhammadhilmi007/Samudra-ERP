/**
 * Samudra Paket ERP - Shipment Tracker Component
 * Provides interface for tracking shipments by waybill number
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShipmentByWaybill } from '@/store/slices/shipment/shipmentSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Printer, Package, Search, Loader2 } from 'lucide-react';

const ShipmentTracker = ({ initialWaybill = '' }) => {
  const dispatch = useDispatch();
  const [waybillNo, setWaybillNo] = useState(initialWaybill);
  const [error, setError] = useState('');
  const { currentShipment, loading } = useSelector((state) => state.shipment);
  
  // Track shipment
  const handleTrackShipment = async () => {
    if (!waybillNo.trim()) {
      setError('Please enter a waybill number');
      return;
    }
    
    setError('');
    try {
      await dispatch(fetchShipmentByWaybill(waybillNo.trim())).unwrap();
    } catch (error) {
      setError(error.message || 'Failed to track shipment. Please verify the waybill number.');
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };
  
  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const statusColors = {
      created: 'bg-gray-500',
      processed: 'bg-blue-500',
      in_transit: 'bg-yellow-500',
      arrived_at_destination: 'bg-indigo-500',
      out_for_delivery: 'bg-purple-500',
      delivered: 'bg-green-500',
      failed_delivery: 'bg-red-500',
      returned: 'bg-orange-500',
      cancelled: 'bg-rose-500',
    };
    
    return statusColors[status] || 'bg-gray-500';
  };
  
  // Format status for display
  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };
  
  // Print tracking information
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Shipment Tracker
          </CardTitle>
          <CardDescription>
            Enter waybill number to track your shipment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter waybill number"
                value={waybillNo}
                onChange={(e) => setWaybillNo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTrackShipment()}
              />
              {error && <p className="text-destructive text-sm mt-1">{error}</p>}
            </div>
            <Button onClick={handleTrackShipment} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Track
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {currentShipment && (
        <div className="space-y-6 print:space-y-4">
          <Card>
            <CardHeader className="print:py-3">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <CardTitle>Tracking Information</CardTitle>
                  <CardDescription className="mt-1">
                    Waybill: <span className="font-medium">{currentShipment.waybillNo}</span>
                  </CardDescription>
                </div>
                <div className="flex items-center mt-2 md:mt-0 gap-2">
                  <Badge className={`${getStatusBadgeColor(currentShipment.status)}`}>
                    {formatStatus(currentShipment.status)}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="print:hidden"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 print:space-y-3 print:py-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
                <div className="space-y-3 print:space-y-1">
                  <h3 className="text-sm font-semibold text-muted-foreground">Sender</h3>
                  <div className="text-sm">
                    <p className="font-medium">{currentShipment.senderName}</p>
                    <p>{currentShipment.senderCity}</p>
                  </div>
                </div>
                
                <div className="space-y-3 print:space-y-1">
                  <h3 className="text-sm font-semibold text-muted-foreground">Recipient</h3>
                  <div className="text-sm">
                    <p className="font-medium">{currentShipment.recipientName}</p>
                    <p>{currentShipment.recipientCity}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:gap-2">
                <div className="space-y-3 print:space-y-1">
                  <h3 className="text-sm font-semibold text-muted-foreground">Service Type</h3>
                  <p className="text-sm capitalize">{currentShipment.serviceType}</p>
                </div>
                
                <div className="space-y-3 print:space-y-1">
                  <h3 className="text-sm font-semibold text-muted-foreground">Payment Method</h3>
                  <p className="text-sm">{currentShipment.paymentMethod}</p>
                </div>
                
                <div className="space-y-3 print:space-y-1">
                  <h3 className="text-sm font-semibold text-muted-foreground">Ship Date</h3>
                  <p className="text-sm">{formatDate(currentShipment.createdAt)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3 print:space-y-1">
                <h3 className="font-semibold">Tracking History</h3>
                
                <div className="relative">
                  <div className="absolute top-0 bottom-0 left-6 border-l-2 border-muted"></div>
                  
                  {currentShipment.statusHistory && currentShipment.statusHistory.length > 0 ? (
                    <div className="space-y-8 print:space-y-4 relative">
                      {currentShipment.statusHistory.map((status, index) => (
                        <div key={index} className="flex gap-4 relative">
                          <div className={`w-3 h-3 rounded-full mt-1.5 ${getStatusBadgeColor(status.status)}`}></div>
                          <div className="flex-1">
                            <h4 className="font-medium">{formatStatus(status.status)}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(status.timestamp)} • {formatTime(status.timestamp)}
                            </p>
                            {status.location && (
                              <p className="text-sm">{status.location}</p>
                            )}
                            {status.notes && (
                              <p className="text-sm mt-1 text-muted-foreground">{status.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground py-4">No status history available</p>
                  )}
                </div>
              </div>
              
              {currentShipment.shipmentItems && currentShipment.shipmentItems.length > 0 && (
                <>
                  <Separator />
                  
                  <div className="space-y-3 print:space-y-1">
                    <h3 className="font-semibold">Shipment Items</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
                      {currentShipment.shipmentItems.map((item, index) => (
                        <div key={index} className="text-sm border rounded-md p-3">
                          <p className="font-medium">{item.description}</p>
                          <div className="grid grid-cols-2 gap-1 mt-1">
                            <p className="text-muted-foreground">Quantity:</p>
                            <p>{item.quantity}</p>
                            
                            <p className="text-muted-foreground">Weight:</p>
                            <p>{item.weight} kg</p>
                            
                            <p className="text-muted-foreground">Dimensions:</p>
                            <p>
                              {item.dimensions.length} × {item.dimensions.width} × {item.dimensions.height} cm
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6 print:hidden">
              <div className="text-xs text-muted-foreground">
                <p>If you have any questions about this shipment, please contact us.</p>
                <p>Waybill number: {currentShipment.waybillNo}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={`/shipment/${currentShipment._id}/document`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  View Document
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ShipmentTracker;
