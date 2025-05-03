/**
 * Samudra Paket ERP - Shipment Form Component
 * Form for creating and editing shipments/resi
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  createShipment, 
  updateShipment, 
  calculateShippingPrice, 
  validateDestination,
} from '@/store/slices/shipment/shipmentSlice';
import ShipmentItemsForm from './ShipmentItemsForm';
import PricingCalculator from './PricingCalculator';
import { Loader2 } from 'lucide-react';

// Form schema validation
const formSchema = z.object({
  // Sender Information
  senderName: z.string().min(3, 'Sender name is required'),
  senderPhone: z.string().min(10, 'Valid phone number is required'),
  senderAddress: z.string().min(5, 'Sender address is required'),
  senderCity: z.string().min(2, 'City is required'),
  senderPostalCode: z.string().optional(),
  
  // Recipient Information
  recipientName: z.string().min(3, 'Recipient name is required'),
  recipientPhone: z.string().min(10, 'Valid phone number is required'),
  recipientAddress: z.string().min(5, 'Recipient address is required'),
  recipientCity: z.string().min(2, 'City is required'),
  recipientPostalCode: z.string().optional(),
  
  // Shipment Details
  serviceType: z.string().min(1, 'Service type is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  shipmentItems: z.array(
    z.object({
      description: z.string().min(1, 'Description is required'),
      quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
      weight: z.coerce.number().min(0.1, 'Weight must be greater than 0'),
      dimensions: z.object({
        length: z.coerce.number().min(1, 'Length must be at least 1'),
        width: z.coerce.number().min(1, 'Width must be at least 1'),
        height: z.coerce.number().min(1, 'Height must be at least 1'),
        unit: z.string().default('cm'),
      }),
      value: z.coerce.number().optional(),
      category: z.string().default('parcel'),
      packaging: z.string().default('box'),
      notes: z.string().optional(),
    })
  ).min(1, 'At least one item is required'),
  
  notes: z.string().optional(),
  insurance: z.boolean().default(false),
  insuranceAmount: z.coerce.number().optional(),
});

const ShipmentForm = ({ initialData = null, onSuccess }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('sender');
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [isDestinationValid, setIsDestinationValid] = useState(null);
  
  const { loading, error, success } = useSelector((state) => state.shipment);
  
  // Initialize form with default values or initial data
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      senderName: '',
      senderPhone: '',
      senderAddress: '',
      senderCity: '',
      senderPostalCode: '',
      recipientName: '',
      recipientPhone: '',
      recipientAddress: '',
      recipientCity: '',
      recipientPostalCode: '',
      serviceType: 'regular',
      paymentMethod: 'CASH',
      shipmentItems: [
        {
          description: '',
          quantity: 1,
          weight: 0.5,
          dimensions: {
            length: 10,
            width: 10,
            height: 10,
            unit: 'cm',
          },
          value: 0,
          category: 'parcel',
          packaging: 'box',
          notes: '',
        },
      ],
      notes: '',
      insurance: false,
      insuranceAmount: 0,
    },
  });
  
  // Handle form submission
  const onSubmit = async (data) => {
    if (!isDestinationValid) {
      toast({
        title: "Invalid Destination",
        description: "Recipient address is not within service area. Please check the address or choose a forwarder.",
        variant: "destructive",
      });
      return;
    }
    
    if (!calculatedPrice) {
      toast({
        title: "Price not calculated",
        description: "Please calculate shipping price before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    const shipmentData = {
      ...data,
      totalPrice: calculatedPrice.total,
      priceBreakdown: calculatedPrice,
    };
    
    try {
      if (initialData?._id) {
        await dispatch(updateShipment({ id: initialData._id, data: shipmentData })).unwrap();
        toast({
          title: "Shipment Updated",
          description: "Shipment details have been successfully updated.",
        });
      } else {
        await dispatch(createShipment(shipmentData)).unwrap();
        toast({
          title: "Shipment Created",
          description: "New shipment has been successfully created.",
        });
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  // Check destination validity when recipient city changes
  useEffect(() => {
    const checkDestinationValidity = async () => {
      const recipientCity = form.watch('recipientCity');
      if (recipientCity && recipientCity.length > 2) {
        try {
          const result = await dispatch(validateDestination({ city: recipientCity })).unwrap();
          setIsDestinationValid(result.data.isValid);
        } catch (error) {
          setIsDestinationValid(false);
        }
      }
    };
    
    const timer = setTimeout(checkDestinationValidity, 500);
    return () => clearTimeout(timer);
  }, [form.watch('recipientCity')]);
  
  // Calculate shipping price
  const handleCalculatePrice = async () => {
    try {
      setIsCalculatingPrice(true);
      const formData = form.getValues();
      
      // Basic validation before calculation
      if (!formData.recipientCity || formData.shipmentItems.length === 0) {
        toast({
          title: "Incomplete Information",
          description: "Please fill in recipient details and shipment items.",
          variant: "destructive",
        });
        setIsCalculatingPrice(false);
        return;
      }
      
      const result = await dispatch(calculateShippingPrice({
        origin: formData.senderCity,
        destination: formData.recipientCity,
        weight: formData.shipmentItems.reduce((sum, item) => sum + (item.weight * item.quantity), 0),
        dimensions: formData.shipmentItems.map(item => item.dimensions),
        serviceType: formData.serviceType,
        insurance: formData.insurance,
        insuranceAmount: formData.insuranceAmount,
      })).unwrap();
      
      setCalculatedPrice(result.data);
      
      toast({
        title: "Price Calculated",
        description: `Total shipping price: Rp ${result.data.total.toLocaleString('id-ID')}`,
      });
    } catch (error) {
      toast({
        title: "Calculation Failed",
        description: error.message || "Failed to calculate shipping price.",
        variant: "destructive",
      });
    } finally {
      setIsCalculatingPrice(false);
    }
  };
  
  return (
    <div className="w-full">
      <Tabs defaultValue="sender" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sender">Sender Information</TabsTrigger>
          <TabsTrigger value="recipient">Recipient Information</TabsTrigger>
          <TabsTrigger value="details">Shipment Details</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <TabsContent value="sender">
              <Card>
                <CardHeader>
                  <CardTitle>Sender Information</CardTitle>
                  <CardDescription>
                    Enter the sender's details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="senderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter sender name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="senderPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="senderAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter complete address" 
                            className="min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="senderCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="senderPostalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter postal code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button type="button" onClick={() => setActiveTab('recipient')}>
                    Next: Recipient
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="recipient">
              <Card>
                <CardHeader>
                  <CardTitle>Recipient Information</CardTitle>
                  <CardDescription>
                    Enter the recipient's details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="recipientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter recipient name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="recipientPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="recipientAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter complete address" 
                            className="min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="recipientCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          {isDestinationValid !== null && (
                            <div className={`text-sm mt-1 ${isDestinationValid ? 'text-green-600' : 'text-red-600'}`}>
                              {isDestinationValid 
                                ? 'Destination is within service area'
                                : 'Destination is outside service area'}
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="recipientPostalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter postal code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab('sender')}>
                    Back
                  </Button>
                  <Button type="button" onClick={() => setActiveTab('details')}>
                    Next: Shipment Details
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Shipment Details</CardTitle>
                  <CardDescription>
                    Enter shipment information and items
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select service type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="regular">Regular</SelectItem>
                              <SelectItem value="express">Express</SelectItem>
                              <SelectItem value="priority">Priority</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CASH">Cash</SelectItem>
                              <SelectItem value="COD">COD</SelectItem>
                              <SelectItem value="CAD">CAD (Invoice)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-md font-medium mb-4">Shipment Items</h3>
                    <ShipmentItemsForm 
                      form={form} 
                      name="shipmentItems" 
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Additional notes or special instructions" 
                                className="min-h-[80px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="border rounded-md p-4 bg-muted/20">
                      <h3 className="font-medium mb-2">Price Calculation</h3>
                      <div className="mb-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleCalculatePrice}
                          disabled={isCalculatingPrice}
                          className="w-full"
                        >
                          {isCalculatingPrice && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Calculate Shipping Price
                        </Button>
                      </div>
                      
                      {calculatedPrice && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Base Price:</span>
                            <span>Rp {calculatedPrice.basePrice.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Weight Charge:</span>
                            <span>Rp {calculatedPrice.weightCharge.toLocaleString('id-ID')}</span>
                          </div>
                          {calculatedPrice.insuranceCharge > 0 && (
                            <div className="flex justify-between">
                              <span>Insurance:</span>
                              <span>Rp {calculatedPrice.insuranceCharge.toLocaleString('id-ID')}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Tax:</span>
                            <span>Rp {calculatedPrice.tax.toLocaleString('id-ID')}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold">
                            <span>Total Price:</span>
                            <span>Rp {calculatedPrice.total.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab('recipient')}>
                    Back
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? 'Update Shipment' : 'Create Shipment'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default ShipmentForm;
