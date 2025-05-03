/**
 * Samudra Paket ERP - Shipment Detail Component
 * Displays detailed information about a shipment
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft,
  FileText,
  Printer,
  ExternalLink,
  TruckIcon,
  Package,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  CreditCard,
} from 'lucide-react';

const ShipmentDetail = ({ shipment }) => {
  const router = useRouter();
  
  if (!shipment) {
    return null;
  }
  
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
  
  // Format datetime
  const formatDateTime = (dateString) => {
    return `${formatDate(dateString)} ${formatTime(dateString)}`;
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
  
  // Calculate total weight
  const totalWeight = shipment.shipmentItems.reduce(
    (sum, item) => sum + (item.weight * item.quantity),
    0
  );
  
  // Calculate volumetric weight
  const calculateVolumetricWeight = (dimensions) => {
    const { length, width, height } = dimensions;
    return (length * width * height) / 6000;
  };
  
  // Get chargeable weight per item
  const getChargeableWeight = (item) => {
    const volumetricWeight = calculateVolumetricWeight(item.dimensions);
    return Math.max(item.weight, volumetricWeight);
  };
  
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/shipment/list')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/shipment/${shipment._id}/document`)}
          >
            <FileText className="mr-2 h-4 w-4" />
            View Document
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/shipment/tracking?waybill=${shipment.waybillNo}`)}
          >
            <TruckIcon className="mr-2 h-4 w-4" />
            Track Shipment
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Shipment Details</CardTitle>
            <CardDescription>
              Waybill No: {shipment.waybillNo}
            </CardDescription>
          </div>
          <Badge className={`${getStatusBadgeColor(shipment.status)}`}>
            {formatStatus(shipment.status)}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <InfoCard 
              icon={<CalendarIcon className="h-4 w-4" />}
              label="Created Date"
              value={formatDate(shipment.createdAt)}
            />
            
            <InfoCard 
              icon={<Package className="h-4 w-4" />}
              label="Total Items"
              value={shipment.shipmentItems.reduce((sum, item) => sum + item.quantity, 0)}
            />
            
            <InfoCard 
              icon={<CreditCard className="h-4 w-4" />}
              label="Payment Method"
              value={shipment.paymentMethod}
            />
            
            <InfoCard 
              icon={<ExternalLink className="h-4 w-4" />}
              label="Service Type"
              value={shipment.serviceType}
            />
          </div>
          
          <Tabs defaultValue="shipment-info">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="shipment-info">Shipment Info</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="tracking">Status History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="shipment-info" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Sender</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p className="font-semibold">{shipment.senderName}</p>
                    <p>{shipment.senderPhone}</p>
                    <p className="text-muted-foreground">{shipment.senderAddress}</p>
                    <p>{shipment.senderCity} {shipment.senderPostalCode}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Recipient</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p className="font-semibold">{shipment.recipientName}</p>
                    <p>{shipment.recipientPhone}</p>
                    <p className="text-muted-foreground">{shipment.recipientAddress}</p>
                    <p>{shipment.recipientCity} {shipment.recipientPostalCode}</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Shipment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Weight:</p>
                      <p className="font-medium">{totalWeight.toFixed(2)} kg</p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Chargeable Weight:</p>
                      <p className="font-medium">
                        {Math.max(
                          totalWeight,
                          ...shipment.shipmentItems.map(item => 
                            calculateVolumetricWeight(item.dimensions) * item.quantity
                          )
                        ).toFixed(2)} kg
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Insurance:</p>
                      <p className="font-medium">
                        {shipment.insurance ? 'Yes' : 'No'}
                        {shipment.insurance && shipment.insuranceAmount && 
                          ` (Rp ${shipment.insuranceAmount.toLocaleString('id-ID')})`
                        }
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Notes:</p>
                      <p className="font-medium">{shipment.notes || 'No notes'}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Price Breakdown</h4>
                    <div className="grid grid-cols-2 text-sm">
                      <p className="text-muted-foreground">Base Price:</p>
                      <p className="font-medium">
                        Rp {shipment.priceBreakdown?.basePrice?.toLocaleString('id-ID') || '0'}
                      </p>
                      
                      <p className="text-muted-foreground">Weight Charge:</p>
                      <p className="font-medium">
                        Rp {shipment.priceBreakdown?.weightCharge?.toLocaleString('id-ID') || '0'}
                      </p>
                      
                      {shipment.priceBreakdown?.insuranceCharge > 0 && (
                        <>
                          <p className="text-muted-foreground">Insurance:</p>
                          <p className="font-medium">
                            Rp {shipment.priceBreakdown.insuranceCharge.toLocaleString('id-ID')}
                          </p>
                        </>
                      )}
                      
                      <p className="text-muted-foreground">Tax:</p>
                      <p className="font-medium">
                        Rp {shipment.priceBreakdown?.tax?.toLocaleString('id-ID') || '0'}
                      </p>
                      
                      <p className="text-muted-foreground font-medium">Total Price:</p>
                      <p className="font-semibold">
                        Rp {shipment.totalPrice?.toLocaleString('id-ID') || '0'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="items" className="pt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Shipment Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Weight (kg)</TableHead>
                        <TableHead>Dimensions (cm)</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Packaging</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shipment.shipmentItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.weight.toFixed(2)}</TableCell>
                          <TableCell>
                            {`${item.dimensions.length} × ${item.dimensions.width} × ${item.dimensions.height}`}
                          </TableCell>
                          <TableCell className="capitalize">{item.category}</TableCell>
                          <TableCell className="capitalize">{item.packaging}</TableCell>
                          <TableCell>{item.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tracking" className="pt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Status History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute top-0 bottom-0 left-6 border-l-2 border-muted"></div>
                    
                    {shipment.statusHistory && shipment.statusHistory.length > 0 ? (
                      <div className="space-y-8 relative">
                        {shipment.statusHistory.map((status, index) => (
                          <div key={index} className="flex gap-4 relative">
                            <div className={`w-3 h-3 rounded-full mt-1.5 ${getStatusBadgeColor(status.status)}`}></div>
                            <div className="flex-1">
                              <h4 className="font-medium">{formatStatus(status.status)}</h4>
                              <p className="text-sm text-muted-foreground">
                                {formatDateTime(status.timestamp)}
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {shipment.documents && shipment.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {shipment.documents.map((doc, index) => (
                <AccordionItem key={index} value={`document-${index}`}>
                  <AccordionTrigger>{doc.name}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Added on {formatDate(doc.uploadedAt)}
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Document
                        </a>
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Informational card component
const InfoCard = ({ icon, label, value }) => {
  return (
    <div className="flex flex-col p-3 border rounded-md bg-muted/10">
      <div className="flex items-center text-muted-foreground mb-1">
        {icon}
        <span className="text-xs ml-1">{label}</span>
      </div>
      <div className="text-lg font-semibold leading-none">
        {value}
      </div>
    </div>
  );
};

export default ShipmentDetail;
