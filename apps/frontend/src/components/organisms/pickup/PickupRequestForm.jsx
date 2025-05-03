import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, Clock, MapPin, User, Package, AlertCircle } from 'lucide-react';

import pickupService from '@/services/pickupService';

import { Button } from '../../../components/atoms/Button';
import { Input } from '../../../components/atoms/Input';
import { Textarea } from '../../../components/atoms/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/atoms/Select';
import { Calendar } from '../../../components/atoms/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/atoms/Popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/atoms/Card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/atoms/Form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/atoms/Tabs';
import { Alert, AlertDescription, AlertTitle } from '../../../components/atoms/Alert';

// Form validation schema
const pickupRequestSchema = z.object({
  customer: z.string().min(1, { message: 'Customer is required' }),
  branch: z.string().min(1, { message: 'Branch is required' }),
  pickupAddress: z.object({
    street: z.string().min(1, { message: 'Street address is required' }),
    city: z.string().min(1, { message: 'City is required' }),
    province: z.string().min(1, { message: 'Province is required' }),
    postalCode: z.string().optional(),
    country: z.string().default('Indonesia'),
    notes: z.string().optional(),
  }),
  contactPerson: z.object({
    name: z.string().min(1, { message: 'Contact name is required' }),
    phone: z.string().min(1, { message: 'Contact phone is required' }),
    email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  }),
  scheduledDate: z.date({ required_error: 'Scheduled date is required' }),
  scheduledTimeWindow: z.object({
    start: z.string().min(1, { message: 'Start time is required' }),
    end: z.string().min(1, { message: 'End time is required' }),
  }),
  items: z
    .array(
      z.object({
        description: z.string().min(1, { message: 'Item description is required' }),
        quantity: z.number().min(1, { message: 'Quantity must be at least 1' }),
        weight: z
          .object({
            value: z.number().min(0, { message: 'Weight must be a positive number' }).optional(),
            unit: z.enum(['kg', 'g']).default('kg'),
          })
          .optional(),
        dimensions: z
          .object({
            length: z.number().min(0, { message: 'Length must be a positive number' }).optional(),
            width: z.number().min(0, { message: 'Width must be a positive number' }).optional(),
            height: z.number().min(0, { message: 'Height must be a positive number' }).optional(),
            unit: z.enum(['cm', 'inch']).default('cm'),
          })
          .optional(),
      })
    )
    .min(1, { message: 'At least one item is required' }),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  specialInstructions: z.string().optional(),
});

/**
 * PickupRequestForm Component
 * Form for creating and editing pickup requests
 */
const PickupRequestForm = ({ initialData = null }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Initialize form with default values or existing data
  const form = useForm({
    resolver: zodResolver(pickupRequestSchema),
    defaultValues: initialData || {
      customer: '',
      branch: '',
      pickupAddress: {
        street: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'Indonesia',
        notes: '',
      },
      contactPerson: {
        name: '',
        phone: '',
        email: '',
      },
      scheduledDate: new Date(),
      scheduledTimeWindow: {
        start: '09:00',
        end: '17:00',
      },
      items: [
        {
          description: '',
          quantity: 1,
          weight: {
            value: 0,
            unit: 'kg',
          },
          dimensions: {
            length: 0,
            width: 0,
            height: 0,
            unit: 'cm',
          },
        },
      ],
      priority: 'medium',
      specialInstructions: '',
    },
  });

  // Fetch customers for dropdown
  const {
    data: customers,
    isLoading: isLoadingCustomers,
    error: customersError,
  } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await pickupService.getCustomers();
      return response.data;
    },
  });

  // Fetch branches for dropdown
  const {
    data: branches,
    isLoading: isLoadingBranches,
    error: branchesError,
  } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await pickupService.getBranches();
      return response.data;
    },
  });

  // Create pickup request mutation
  const createPickupMutation = useMutation(
    async data => {
      const response = await pickupService.createPickupRequest(data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pickup-requests');
      },
    }
  );

  // Update pickup request mutation
  const updatePickupMutation = useMutation(
    async ({ id, data }) => {
      const response = await pickupService.updatePickupRequest(id, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pickup-requests');
      },
    }
  );

  // Add a new item to the items array
  const addItem = () => {
    const currentItems = form.getValues('items') || [];
    form.setValue('items', [
      ...currentItems,
      {
        description: '',
        quantity: 1,
        weight: {
          value: 0,
          unit: 'kg',
        },
        dimensions: {
          length: 0,
          width: 0,
          height: 0,
          unit: 'cm',
        },
      },
    ]);
  };

  // Remove an item from the items array
  const removeItem = index => {
    const currentItems = form.getValues('items');
    if (currentItems.length > 1) {
      form.setValue(
        'items',
        currentItems.filter((_, i) => i !== index)
      );
    }
  };

  // Handle form submission
  const onSubmit = async data => {
    try {
      setSubmitError(null);

      // Format the data for API submission
      const formattedData = {
        ...data,
        scheduledDate: format(data.scheduledDate, 'yyyy-MM-dd'),
      };

      if (initialData) {
        // Update existing pickup request
        updatePickupMutation.mutate({ id: initialData.id, data: formattedData });
      } else {
        // Create new pickup request
        createPickupMutation.mutate(formattedData);
      }
    } catch (error) {
      console.error('Error submitting pickup request:', error);
      setSubmitError('Failed to submit pickup request. Please try again.');
    }
  };

  return (
    <div>
      {submitError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {(customersError || branchesError) && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>
            {customersError && <p>Failed to load customers: {customersError.message}</p>}
            {branchesError && <p>Failed to load branches: {branchesError.message}</p>}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-6">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Pickup request created successfully! Redirecting...</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General Information</TabsTrigger>
              <TabsTrigger value="address">Pickup Address</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
            </TabsList>

            {/* General Information Tab */}
            <TabsContent value="general" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingCustomers ? (
                            <SelectItem value="" disabled>
                              Loading...
                            </SelectItem>
                          ) : (
                            customers?.map(customer => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingBranches ? (
                            <SelectItem value="" disabled>
                              Loading...
                            </SelectItem>
                          ) : (
                            branches?.map(branch => (
                              <SelectItem key={branch.id} value={branch.id}>
                                {branch.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Instructions (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any special instructions or notes for this pickup"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab('address')}>
                  Next: Pickup Address
                </Button>
              </div>
            </TabsContent>

            {/* Pickup Address Tab */}
            <TabsContent value="address" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="pickupAddress.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <div className="flex items-center">
                        <FormControl>
                          <Input placeholder="Street address" {...field} />
                        </FormControl>
                        <MapPin className="ml-2 h-4 w-4 text-gray-400" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="pickupAddress.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pickupAddress.province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <FormControl>
                        <Input placeholder="Province" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pickupAddress.postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Postal code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="pickupAddress.notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any additional details about the pickup location"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between space-x-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab('general')}>
                  Previous: General Information
                </Button>
                <Button type="button" variant="outline" onClick={() => setActiveTab('items')}>
                  Next: Items
                </Button>
              </div>
            </TabsContent>

            {/* Items Tab */}
            <TabsContent value="items" className="space-y-6 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Pickup Items</h3>
                <Button type="button" variant="outline" onClick={addItem}>
                  Add Item
                </Button>
              </div>

              {form.watch('items')?.map((_, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-md">Item {index + 1}</CardTitle>
                      {form.watch('items').length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <div className="flex items-center">
                            <FormControl>
                              <Input placeholder="Item description" {...field} />
                            </FormControl>
                            <Package className="ml-2 h-4 w-4 text-gray-400" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="Quantity"
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-end space-x-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.weight.value`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Weight (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="Weight"
                                  {...field}
                                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.weight.unit`}
                          render={({ field }) => (
                            <FormItem className="w-20">
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="kg">kg</SelectItem>
                                    <SelectItem value="g">g</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.dimensions.length`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Length</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.1"
                                placeholder="Length"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.dimensions.width`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Width</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.1"
                                placeholder="Width"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.dimensions.height`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.1"
                                placeholder="Height"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.dimensions.unit`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cm">cm</SelectItem>
                                  <SelectItem value="inch">inch</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-between space-x-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab('address')}>
                  Previous: Pickup Address
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Create Pickup Request'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
};

export default PickupRequestForm;
