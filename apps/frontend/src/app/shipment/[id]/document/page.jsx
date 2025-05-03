/**
 * Samudra Paket ERP - Shipment Document Viewer Page
 * Displays and prints shipment document/waybill
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShipmentById, generateWaybillDocument } from '@/store/slices/shipment/shipmentSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ChevronLeft, Printer, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';

export default function ShipmentDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { currentShipment, loading, error } = useSelector((state) => state.shipment);
  const [generating, setGenerating] = useState(false);
  
  useEffect(() => {
    if (params.id) {
      dispatch(fetchShipmentById(params.id));
    }
  }, [dispatch, params.id]);
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleDownloadPDF = async () => {
    if (!currentShipment?._id) return;
    
    try {
      setGenerating(true);
      await dispatch(generateWaybillDocument(currentShipment._id)).unwrap();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF document.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading shipment document...</p>
        </div>
      </div>
    );
  }
  
  if (error || !currentShipment) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[60vh]">
        <div className="bg-destructive/10 p-6 rounded-lg text-center max-w-lg">
          <h2 className="text-xl font-semibold mb-2">Error Loading Document</h2>
          <p className="text-muted-foreground">
            {error?.message || 'Failed to load shipment document. Please try again later.'}
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/shipment/list')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Shipments
          </Button>
        </div>
      </div>
    );
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
  
  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex justify-between items-center print:hidden">
        <Button 
          variant="outline" 
          onClick={() => router.push(`/shipment/${currentShipment._id}`)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Details
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          
          <Button 
            variant="default" 
            onClick={handleDownloadPDF}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download PDF
          </Button>
        </div>
      </div>
      
      <div className="my-6 print:my-0 max-w-4xl mx-auto">
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="print:pt-0 flex flex-row items-center justify-between border-b pb-6">
            <div className="flex items-center">
              <div className="mr-4">
                <div className="h-12 w-24 bg-primary/20 flex items-center justify-center text-primary font-bold">
                  LOGO
                </div>
              </div>
              <div>
                <CardTitle>Shipping Waybill</CardTitle>
                <p className="text-sm text-muted-foreground">PT. Sarana Mudah Raya</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{currentShipment.waybillNo}</div>
              <div className="text-sm text-muted-foreground">
                Date: {formatDate(currentShipment.createdAt)}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold border-b pb-1">Sender</h3>
                <p className="font-medium">{currentShipment.senderName}</p>
                <p className="text-sm">{currentShipment.senderPhone}</p>
                <p className="text-sm">{currentShipment.senderAddress}</p>
                <p className="text-sm">{currentShipment.senderCity} {currentShipment.senderPostalCode}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-semibold border-b pb-1">Recipient</h3>
                <p className="font-medium">{currentShipment.recipientName}</p>
                <p className="text-sm">{currentShipment.recipientPhone}</p>
                <p className="text-sm">{currentShipment.recipientAddress}</p>
                <p className="text-sm">{currentShipment.recipientCity} {currentShipment.recipientPostalCode}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-3 gap-8">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Service Type</h3>
                <p className="text-sm capitalize">{currentShipment.serviceType}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Payment Method</h3>
                <p className="text-sm">{currentShipment.paymentMethod}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Status</h3>
                <p className="text-sm">
                  <Badge variant="outline" className="capitalize">
                    {currentShipment.status.replace(/_/g, ' ')}
                  </Badge>
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Shipment Items</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Weight (kg)</TableHead>
                    <TableHead>Dimensions</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentShipment.shipmentItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{item.weight.toFixed(2)}</TableCell>
                      <TableCell>{`${item.dimensions.length} × ${item.dimensions.width} × ${item.dimensions.height} cm`}</TableCell>
                      <TableCell className="capitalize">{item.category}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Additional Notes</h3>
                <p className="text-sm border p-3 rounded min-h-[60px]">
                  {currentShipment.notes || 'No additional notes'}
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Price Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between border-b pb-1">
                    <span>Base Price:</span>
                    <span>Rp {currentShipment.priceBreakdown?.basePrice?.toLocaleString('id-ID') || '0'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>Weight Charge:</span>
                    <span>Rp {currentShipment.priceBreakdown?.weightCharge?.toLocaleString('id-ID') || '0'}</span>
                  </div>
                  {currentShipment.priceBreakdown?.insuranceCharge > 0 && (
                    <div className="flex justify-between border-b pb-1">
                      <span>Insurance:</span>
                      <span>Rp {currentShipment.priceBreakdown.insuranceCharge.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b pb-1">
                    <span>Tax:</span>
                    <span>Rp {currentShipment.priceBreakdown?.tax?.toLocaleString('id-ID') || '0'}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1">
                    <span>Total Price:</span>
                    <span>Rp {currentShipment.totalPrice?.toLocaleString('id-ID') || '0'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Sender Signature</h3>
                <div className="border rounded-md h-24 mt-2"></div>
                <p className="text-sm text-center mt-2">{currentShipment.senderName}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Recipient Signature</h3>
                <div className="border rounded-md h-24 mt-2"></div>
                <p className="text-sm text-center mt-2">{currentShipment.recipientName}</p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-6 print:flex-col">
            <div className="w-full">
              <div className="text-sm text-center pb-2">
                <p className="font-semibold">PT. Sarana Mudah Raya (Samudra Paket)</p>
                <p className="text-xs text-muted-foreground">
                  Jl. Raya Utama No. 123, Jakarta Pusat • Tel: (021) 1234-5678 • Email: info@samudraaket.co.id
                </p>
              </div>
              
              <div className="text-xs text-muted-foreground text-center border-t pt-2">
                <p>For tracking, please visit: samudrapaket.co.id/tracking or call our customer service.</p>
                <p>Waybill No: {currentShipment.waybillNo}</p>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
