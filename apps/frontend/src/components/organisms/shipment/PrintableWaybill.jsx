/**
 * Samudra Paket ERP - Printable Waybill Component
 * Provides a clean, printable version of shipment waybill for physical printing
 */

import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Printer, Download } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/shipmentUtils';
import QRCode from 'react-qr-code';

export default function PrintableWaybill({ shipment }) {
  const waybillRef = useRef();

  // Handle print functionality
  const handlePrint = useReactToPrint({
    content: () => waybillRef.current,
    documentTitle: `Waybill-${shipment?.waybillNo || 'Document'}`,
  });

  // Generate tracking URL for QR code
  const getTrackingUrl = () => {
    // Using window.location would be more dynamic, but for SSR safety, using a hardcoded base
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://samudrapaket.com';
    return `${baseUrl}/shipment/tracking?waybill=${shipment?.waybillNo}`;
  };

  if (!shipment) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 print:hidden">
        <Button 
          variant="outline" 
          className="gap-2" 
          onClick={handlePrint}
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button 
          variant="outline" 
          className="gap-2" 
          onClick={handlePrint}
        >
          <Download className="h-4 w-4" />
          Save PDF
        </Button>
      </div>
      
      <Card className="p-6 bg-white shadow-none border print:shadow-none print:border-0" ref={waybillRef}>
        <div className="print:text-black">
          {/* Header with Logo and Waybill Number */}
          <div className="flex justify-between items-start border-b pb-4 mb-4">
            <div className="flex items-center">
              <div className="text-xl font-bold mr-2">SAMUDRA PAKET</div>
              {/* If there's a real logo, use it here */}
              {/* <img src="/logo.png" alt="Samudra Paket" className="h-10" /> */}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Waybill Number</div>
              <div className="text-xl font-bold">{shipment.waybillNo}</div>
              <div className="text-sm text-gray-500">
                {formatDate(shipment.createdAt, { dateStyle: 'medium' })}
              </div>
            </div>
          </div>
          
          {/* QR Code and Service Info */}
          <div className="flex mb-4">
            <div className="w-1/4">
              <QRCode 
                value={getTrackingUrl()} 
                size={100} 
                className="max-w-full h-auto"
              />
            </div>
            <div className="w-3/4 pl-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <div className="text-sm text-gray-500">Service Type</div>
                  <div className="font-medium">
                    {shipment.serviceType?.toUpperCase() || 'Regular'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Payment Method</div>
                  <div className="font-medium">
                    {shipment.paymentMethod || 'CASH'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Origin</div>
                  <div className="font-medium">{shipment.senderCity}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Destination</div>
                  <div className="font-medium">{shipment.recipientCity}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sender and Recipient Info */}
          <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
            <div>
              <div className="text-sm font-bold uppercase mb-2 pb-1 border-b">Sender</div>
              <div className="font-medium">{shipment.senderName}</div>
              <div>{shipment.senderPhone}</div>
              <div className="text-sm">{shipment.senderEmail}</div>
              <div className="mt-1">{shipment.senderAddress}</div>
              <div>{shipment.senderCity}{shipment.senderPostalCode ? `, ${shipment.senderPostalCode}` : ''}</div>
            </div>
            <div>
              <div className="text-sm font-bold uppercase mb-2 pb-1 border-b">Recipient</div>
              <div className="font-medium">{shipment.recipientName}</div>
              <div>{shipment.recipientPhone}</div>
              <div className="text-sm">{shipment.recipientEmail}</div>
              <div className="mt-1">{shipment.recipientAddress}</div>
              <div>{shipment.recipientCity}{shipment.recipientPostalCode ? `, ${shipment.recipientPostalCode}` : ''}</div>
            </div>
          </div>

          {/* Shipment Items */}
          <div className="mb-4 pb-4 border-b">
            <div className="text-sm font-bold uppercase mb-2">Shipment Items</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-2 px-2 text-left">Description</th>
                  <th className="py-2 px-2 text-center">Qty</th>
                  <th className="py-2 px-2 text-center">Weight (kg)</th>
                  <th className="py-2 px-2 text-center">Dimensions (cm)</th>
                  <th className="py-2 px-2 text-right">Declared Value</th>
                </tr>
              </thead>
              <tbody>
                {shipment.items && shipment.items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-2 px-2">{item.description || 'General Cargo'}</td>
                    <td className="py-2 px-2 text-center">{item.quantity || 1}</td>
                    <td className="py-2 px-2 text-center">{item.weight || 0}</td>
                    <td className="py-2 px-2 text-center">
                      {item.length || 0} x {item.width || 0} x {item.height || 0}
                    </td>
                    <td className="py-2 px-2 text-right">
                      {formatCurrency(item.declaredValue || 0)}
                    </td>
                  </tr>
                ))}
                {(!shipment.items || shipment.items.length === 0) && (
                  <tr className="border-t">
                    <td colSpan="5" className="py-2 px-2 text-center text-gray-500">
                      No items specified
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Price Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-bold uppercase mb-2">Notes</div>
              <div className="text-sm">{shipment.notes || 'No special notes'}</div>
              
              <div className="mt-4 text-sm">
                <div className="font-medium">Terms & Conditions:</div>
                <ol className="list-decimal pl-5 text-xs text-gray-600 mt-1 space-y-1">
                  <li>Sender guarantees all information provided is accurate.</li>
                  <li>Samudra Paket is not responsible for damage due to improper packaging.</li>
                  <li>Claims must be submitted within 7 days of delivery.</li>
                  <li>For full terms visit www.samudrapaket.com/terms</li>
                </ol>
              </div>
            </div>
            <div>
              <div className="text-sm font-bold uppercase mb-2">Price Summary</div>
              <div className="border-t pt-2">
                <div className="grid grid-cols-2 text-sm">
                  <div className="py-1">Shipping Cost</div>
                  <div className="py-1 text-right">{formatCurrency(shipment.shippingCost || 0)}</div>
                  
                  {shipment.additionalServices && shipment.additionalServices.map((service, index) => (
                    <React.Fragment key={index}>
                      <div className="py-1">{service.name}</div>
                      <div className="py-1 text-right">{formatCurrency(service.price || 0)}</div>
                    </React.Fragment>
                  ))}
                  
                  {shipment.insurance && (
                    <>
                      <div className="py-1">Insurance</div>
                      <div className="py-1 text-right">{formatCurrency(shipment.insuranceAmount || 0)}</div>
                    </>
                  )}
                  
                  {shipment.taxAmount > 0 && (
                    <>
                      <div className="py-1">Tax</div>
                      <div className="py-1 text-right">{formatCurrency(shipment.taxAmount || 0)}</div>
                    </>
                  )}
                  
                  {shipment.discount > 0 && (
                    <>
                      <div className="py-1">Discount</div>
                      <div className="py-1 text-right">-{formatCurrency(shipment.discount || 0)}</div>
                    </>
                  )}
                  
                  <div className="py-1 font-bold border-t mt-1 pt-1">Total</div>
                  <div className="py-1 font-bold border-t mt-1 pt-1 text-right">
                    {formatCurrency(shipment.totalPrice || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-6 pt-4 border-t text-center text-xs text-gray-500">
            <div>PT. Sarana Mudah Raya (Samudra Paket) | Customer Service: 0800-1234-5678 | www.samudrapaket.com</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

PrintableWaybill.propTypes = {
  shipment: PropTypes.object.isRequired,
};
