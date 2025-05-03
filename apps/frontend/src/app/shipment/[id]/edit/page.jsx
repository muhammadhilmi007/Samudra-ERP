/**
 * Samudra Paket ERP - Edit Shipment Page
 * Page for editing existing shipment details
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { PageTitle } from '@/components/molecules/PageTitle';
import ShipmentForm from '@/components/organisms/shipment/ShipmentForm';
import { fetchShipmentById, resetCurrentShipment } from '@/store/slices/shipment/shipmentSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function EditShipmentPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentShipment, loading, error } = useSelector((state) => state.shipment);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Fetch shipment data when component mounts
    dispatch(fetchShipmentById(id));

    return () => {
      // Reset current shipment when component unmounts
      dispatch(resetCurrentShipment());
    };
  }, [dispatch, id]);

  useEffect(() => {
    // Set isInitialized to true once data is loaded
    if (currentShipment && !loading && !isInitialized) {
      setIsInitialized(true);
    }
  }, [currentShipment, loading, isInitialized]);

  const handleBackClick = () => {
    router.back();
  };

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <PageTitle 
          title="Edit Shipment" 
          description="Update shipment details"
          backButton={{
            onClick: handleBackClick,
            label: 'Back',
          }}
        />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || 'Failed to load shipment data. Please try again later.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageTitle 
        title="Edit Shipment" 
        description="Update shipment details"
        backButton={{
          href: `/shipment/${id}`,
          label: 'Back to Shipment Details',
        }}
      />

      {loading && !isInitialized ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-36 w-full" />
          </CardContent>
        </Card>
      ) : (
        <ShipmentForm 
          initialData={currentShipment} 
          isEdit={true} 
          shipmentId={id} 
        />
      )}
    </div>
  );
}
