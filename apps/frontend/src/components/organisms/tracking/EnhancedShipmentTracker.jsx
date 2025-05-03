/**
 * Samudra Paket ERP - Enhanced Shipment Tracker Component
 * Comprehensive shipment tracking interface with timeline visualization and map integration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShipmentByWaybill, refreshShipmentLocation } from '@/store/slices/shipment/shipmentSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Printer, Package, Search, Loader2, MapPin, Clock, Truck } from 'lucide-react';
import StatusBadge from '@/components/atoms/tracking/StatusBadge';
import TrackingTimeline from '@/components/molecules/tracking/TrackingTimeline';
import ShipmentMap from '@/components/organisms/tracking/ShipmentMap';
import { formatDate, formatTime } from '@/lib/dateUtils';

const EnhancedShipmentTracker = ({ initialWaybill = '' }) => {
  const dispatch = useDispatch();
  const [waybillNo, setWaybillNo] = useState(initialWaybill);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const { currentShipment, loading, locationLoading } = useSelector((state) => state.shipment);
  
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
  
  // Refresh location data
  const handleRefreshLocation = async () => {
    if (!currentShipment) return;
    
    try {
      await dispatch(refreshShipmentLocation(currentShipment._id)).unwrap();
    } catch (error) {
      console.error('Failed to refresh location:', error);
    }
  };
  
  // Print tracking information
  const handlePrint = () => {
    window.print();
  };
  
  // Extract coordinates for map
  const getTrackingPoints = () => {
    if (!currentShipment || !currentShipment.tracking) return [];
    
    return currentShipment.tracking.filter(point => 
      point.location && 
      point.location.coordinates && 
      point.location.coordinates.length === 2
    );
  };
  
  // Get origin and destination coordinates
  const getOriginCoordinates = () => {
    return currentShipment?.originLocation?.coordinates || null;
  };
  
  const getDestinationCoordinates = () => {
    return currentShipment?.destinationLocation?.coordinates || null;
  };
  
  useEffect(() => {
    if (initialWaybill) {
      handleTrackShipment();
    }
  }, [initialWaybill]);
  
  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Enhanced Shipment Tracker
          </CardTitle>
          <CardDescription>
            Enter waybill number to track your shipment in real-time
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
                  <StatusBadge 
                    status={currentShipment.status} 
                    withTooltip={true}
                    description={`Last updated: ${formatDate(currentShipment.updatedAt)} ${formatTime(currentShipment.updatedAt)}`}
                  />
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
            
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <div className="px-6">
                <TabsList className="w-full">
                  <TabsTrigger value="overview" className="flex-1">
                    <Package className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="flex-1">
                    <Clock className="h-4 w-4 mr-2" />
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex-1">
                    <MapPin className="h-4 w-4 mr-2" />
                    Map View
                  </TabsTrigger>
                  <TabsTrigger value="details" className="flex-1">
                    <Truck className="h-4 w-4 mr-2" />
                    Details
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="overview" className="m-0 p-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
                      <div className="space-y-3 print:space-y-1">
                        <h3 className="text-sm font-semibold text-muted-foreground">Sender</h3>
                        <div className="text-sm">
                          <p className="font-medium">{currentShipment.sender?.name || currentShipment.senderName}</p>
                          <p>{currentShipment.sender?.address?.city || currentShipment.senderCity}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 print:space-y-1">
                        <h3 className="text-sm font-semibold text-muted-foreground">Recipient</h3>
                        <div className="text-sm">
                          <p className="font-medium">{currentShipment.receiver?.name || currentShipment.recipientName}</p>
                          <p>{currentShipment.receiver?.address?.city || currentShipment.recipientCity}</p>
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
                        <p className="text-sm">{currentShipment.paymentType}</p>
                      </div>
                      
                      <div className="space-y-3 print:space-y-1">
                        <h3 className="text-sm font-semibold text-muted-foreground">Ship Date</h3>
                        <p className="text-sm">{formatDate(currentShipment.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground">Current Status</h3>
                    
                    <div className="bg-muted/30 p-4 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <StatusBadge status={currentShipment.status} />
                          <p className="mt-2 text-sm">
                            {currentShipment.statusHistory && currentShipment.statusHistory.length > 0 && 
                              currentShipment.statusHistory[currentShipment.statusHistory.length - 1].notes}
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>Last Updated</p>
                          <p>{formatDate(currentShipment.updatedAt)}</p>
                          <p>{formatTime(currentShipment.updatedAt)}</p>
                        </div>
                      </div>
                      
                      {currentShipment.estimatedDelivery && (
                        <div className="mt-4 pt-4 border-t border-muted">
                          <p className="text-sm font-medium">Estimated Delivery</p>
                          <p className="text-sm">{formatDate(currentShipment.estimatedDelivery)}</p>
                        </div>
                      )}
                    </div>
                    
                    {currentShipment.tracking && currentShipment.tracking.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-muted-foreground">Last Known Location</p>
                        <p className="text-sm">
                          {currentShipment.tracking[currentShipment.tracking.length - 1].address || 'Location data not available'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                {currentShipment.shipmentItems && currentShipment.shipmentItems.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Shipment Items</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              {item.dimensions?.length} × {item.dimensions?.width} × {item.dimensions?.height} cm
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="timeline" className="m-0 p-6 border-t">
                <div className="space-y-4">
                  <div className="bg-muted/20 p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Shipment Timeline</h3>
                    <p className="text-sm text-muted-foreground">
                      Track all status updates and location changes for your shipment
                    </p>
                  </div>
                  
                  <TrackingTimeline statusHistory={currentShipment.statusHistory} />
                </div>
              </TabsContent>
              
              <TabsContent value="map" className="m-0 p-6 border-t">
                <ShipmentMap 
                  shipmentData={currentShipment}
                  trackingPoints={getTrackingPoints()}
                  originCoordinates={getOriginCoordinates()}
                  destinationCoordinates={getDestinationCoordinates()}
                  isLoading={locationLoading}
                  onRefresh={handleRefreshLocation}
                />
              </TabsContent>
              
              <TabsContent value="details" className="m-0 p-6 border-t">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Shipment Details</h3>
                      <div className="bg-muted/20 p-4 rounded-md space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <p className="text-muted-foreground">Waybill Number:</p>
                          <p className="font-medium">{currentShipment.waybillNo}</p>
                          
                          <p className="text-muted-foreground">Origin Branch:</p>
                          <p>{currentShipment.originBranch?.name || 'N/A'}</p>
                          
                          <p className="text-muted-foreground">Destination Branch:</p>
                          <p>{currentShipment.destinationBranch?.name || 'N/A'}</p>
                          
                          <p className="text-muted-foreground">Total Weight:</p>
                          <p>{currentShipment.totalWeight || 'N/A'} kg</p>
                          
                          <p className="text-muted-foreground">Total Items:</p>
                          <p>{currentShipment.totalItems || 'N/A'}</p>
                          
                          <p className="text-muted-foreground">Created At:</p>
                          <p>{formatDate(currentShipment.createdAt)} {formatTime(currentShipment.createdAt)}</p>
                          
                          {currentShipment.departureDate && (
                            <>
                              <p className="text-muted-foreground">Departure Date:</p>
                              <p>{formatDate(currentShipment.departureDate)} {formatTime(currentShipment.departureDate)}</p>
                            </>
                          )}
                          
                          {currentShipment.estimatedArrival && (
                            <>
                              <p className="text-muted-foreground">Estimated Arrival:</p>
                              <p>{formatDate(currentShipment.estimatedArrival)} {formatTime(currentShipment.estimatedArrival)}</p>
                            </>
                          )}
                          
                          {currentShipment.actualArrival && (
                            <>
                              <p className="text-muted-foreground">Actual Arrival:</p>
                              <p>{formatDate(currentShipment.actualArrival)} {formatTime(currentShipment.actualArrival)}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {(currentShipment.vehicle || currentShipment.driver || currentShipment.notes) && (
                      <div>
                        <h3 className="font-semibold mb-3">Transportation Details</h3>
                        <div className="bg-muted/20 p-4 rounded-md space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {currentShipment.vehicle && (
                              <>
                                <p className="text-muted-foreground">Vehicle:</p>
                                <p>{currentShipment.vehicle.plateNumber || currentShipment.vehicle}</p>
                                
                                {currentShipment.vehicle.type && (
                                  <>
                                    <p className="text-muted-foreground">Vehicle Type:</p>
                                    <p>{currentShipment.vehicle.type}</p>
                                  </>
                                )}
                              </>
                            )}
                            
                            {currentShipment.driver && (
                              <>
                                <p className="text-muted-foreground">Driver:</p>
                                <p>{currentShipment.driver.name || currentShipment.driver}</p>
                              </>
                            )}
                            
                            {currentShipment.helper && (
                              <>
                                <p className="text-muted-foreground">Helper:</p>
                                <p>{currentShipment.helper.name || currentShipment.helper}</p>
                              </>
                            )}
                          </div>
                          
                          {currentShipment.notes && (
                            <div className="pt-3 border-t border-muted">
                              <p className="text-muted-foreground text-sm mb-1">Notes:</p>
                              <p className="text-sm">{currentShipment.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {currentShipment.documents && currentShipment.documents.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold">Shipment Documents</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {currentShipment.documents.map((doc, index) => (
                          <div key={index} className="border rounded-md p-3">
                            <p className="font-medium text-sm">{doc.type}</p>
                            <p className="text-xs text-muted-foreground">
                              Uploaded: {formatDate(doc.uploadedAt)}
                            </p>
                            <Button variant="outline" size="sm" className="mt-2" asChild>
                              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                View Document
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
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

export default EnhancedShipmentTracker;
