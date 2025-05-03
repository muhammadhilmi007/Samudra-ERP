/**
 * Samudra Paket ERP - Pricing Calculator Component
 * Standalone component for calculating shipping prices
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateShippingPrice } from '@/store/slices/shipment/shipmentSlice';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

// Form schema validation
const calculatorSchema = z.object({
  origin: z.string().min(2, 'Origin city is required'),
  destination: z.string().min(2, 'Destination city is required'),
  weight: z.coerce.number().min(0.1, 'Weight must be greater than 0'),
  length: z.coerce.number().min(1, 'Length must be at least 1'),
  width: z.coerce.number().min(1, 'Width must be at least 1'),
  height: z.coerce.number().min(1, 'Height must be at least 1'),
  serviceType: z.string().min(1, 'Service type is required'),
  insurance: z.boolean().default(false),
  insuranceAmount: z.coerce.number().optional(),
});

const PricingCalculator = () => {
  const dispatch = useDispatch();
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const { priceLoading } = useSelector((state) => state.shipment);
  
  const form = useForm({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      origin: '',
      destination: '',
      weight: 1,
      length: 10,
      width: 10,
      height: 10,
      serviceType: 'regular',
      insurance: false,
      insuranceAmount: 0,
    },
  });
  
  const watchInsurance = form.watch('insurance');
  
  const onSubmit = async (data) => {
    try {
      const result = await dispatch(calculateShippingPrice({
        origin: data.origin,
        destination: data.destination,
        weight: data.weight,
        dimensions: [{
          length: data.length,
          width: data.width,
          height: data.height,
          unit: 'cm',
        }],
        serviceType: data.serviceType,
        insurance: data.insurance,
        insuranceAmount: data.insurance ? data.insuranceAmount : 0,
      })).unwrap();
      
      setCalculatedPrice(result.data);
    } catch (error) {
      console.error('Error calculating price:', error);
    }
  };
  
  const calculateVolumetricWeight = () => {
    // Volumetric weight calculation: (L x W x H in cm) / 6000 = Volumetric Weight in kg
    const { length, width, height } = form.getValues();
    return (length * width * height) / 6000;
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Shipping Price Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="origin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origin City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter origin city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter destination city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0.1" 
                            step="0.1" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0.1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Dimensions (cm)</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Length</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              step="1" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Width</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              step="1" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              step="1" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="bg-muted/30 p-3 rounded-md text-sm">
                    <div className="flex justify-between">
                      <span>Volumetric Weight:</span>
                      <span className="font-medium">{calculateVolumetricWeight().toFixed(2)} kg</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Chargeable weight will be the greater of actual weight and volumetric weight.
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="insurance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Add Insurance</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Protect your shipment against loss or damage
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {watchInsurance && (
                      <FormField
                        control={form.control}
                        name="insuranceAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Declared Value (IDR)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                step="1000" 
                                placeholder="Enter item value for insurance" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  disabled={priceLoading} 
                  className="w-full max-w-md"
                >
                  {priceLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Calculate Shipping Price
                </Button>
              </div>
            </form>
          </Form>
          
          {calculatedPrice && (
            <>
              <Separator className="my-6" />
              
              <div className="bg-muted/20 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-center mb-4">Price Breakdown</h3>
                <div className="space-y-3">
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
                  {calculatedPrice.serviceCharge > 0 && (
                    <div className="flex justify-between">
                      <span>Service Charge:</span>
                      <span>Rp {calculatedPrice.serviceCharge.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax (11%):</span>
                    <span>Rp {calculatedPrice.tax.toLocaleString('id-ID')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold pt-2 text-lg">
                    <span>Total Price:</span>
                    <span>Rp {calculatedPrice.total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingCalculator;
