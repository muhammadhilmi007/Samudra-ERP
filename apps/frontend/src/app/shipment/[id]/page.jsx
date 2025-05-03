/**
 * Samudra Paket ERP - Shipment Detail Page
 * Displays details for a specific shipment
 */

'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShipmentById } from '@/store/slices/shipment/shipmentSlice';
import ShipmentDetail from '@/components/organisms/shipment/ShipmentDetail';
import { PageTitle } from '@/components/molecules/PageTitle';
import { Loader2, AlertTriangle, Pencil, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentShipment, loading, error } = useSelector((state) => state.shipment);
  
  useEffect(() => {
    if (params.id) {
      dispatch(fetchShipmentById(params.id));
    }
  }, [dispatch, params.id]);
  
  const handleBack = () => {
    router.push('/shipment/list');
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <PageTitle 
          title="Shipment Details" 
          description="Loading shipment information..."
          backButton={{
            onClick: handleBack,
            label: 'Back to List',
          }}
        />
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading shipment details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <PageTitle 
          title="Shipment Details" 
          description="Error loading shipment"
          backButton={{
            onClick: handleBack,
            label: 'Back to List',
          }}
        />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message || 'Failed to load shipment details. Please try again later.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const waybillNo = currentShipment?.waybillNo || params.id;
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageTitle 
        title={`Shipment ${waybillNo}`} 
        description="View shipment details and tracking information"
        backButton={{
          onClick: handleBack,
          label: 'Back to List',
        }}
        actions={[
          <Button key="edit" variant="outline" asChild className="gap-2">
            <Link href={`/shipment/${params.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>,
          <Button key="print" variant="outline" asChild className="gap-2">
            <Link href={`/shipment/${params.id}/document`} target="_blank">
              <Printer className="h-4 w-4" />
              Waybill
            </Link>
          </Button>
        ]}
      />
      <ShipmentDetail shipment={currentShipment} />
    </div>
  );
}
