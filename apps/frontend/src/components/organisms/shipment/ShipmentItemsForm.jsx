/**
 * Samudra Paket ERP - Shipment Items Form Component
 * Manages shipment items within the shipment form
 */

import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

const ShipmentItemsForm = ({ form, name }) => {
  const { fields, append, remove } = useFieldArray({
    name,
    control: form.control,
  });

  const handleAddItem = () => {
    append({
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
    });
  };

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <Card key={field.id} className="relative">
          <CardContent className="pt-6">
            <div className="absolute top-3 right-3">
              {fields.length > 1 && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => remove(index)}
                  className="h-7 w-7 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField
                control={form.control}
                name={`${name}.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Item description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name={`${name}.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
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
                  name={`${name}.${index}.weight`}
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
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Dimensions</h4>
              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name={`${name}.${index}.dimensions.length`}
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
                  name={`${name}.${index}.dimensions.width`}
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
                  name={`${name}.${index}.dimensions.height`}
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`${name}.${index}.category`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="parcel">Parcel</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="fragile">Fragile</SelectItem>
                        <SelectItem value="perishable">Perishable</SelectItem>
                        <SelectItem value="dangerous">Dangerous Goods</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name={`${name}.${index}.packaging`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Packaging</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select packaging" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="box">Box</SelectItem>
                        <SelectItem value="envelope">Envelope</SelectItem>
                        <SelectItem value="tube">Tube</SelectItem>
                        <SelectItem value="pallet">Pallet</SelectItem>
                        <SelectItem value="crate">Crate</SelectItem>
                        <SelectItem value="original">Original Packaging</SelectItem>
                        <SelectItem value="none">No Packaging</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name={`${name}.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Declared Value (IDR)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="1000" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name={`${name}.${index}.notes`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Special handling instructions"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleAddItem}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Another Item
      </Button>
    </div>
  );
};

export default ShipmentItemsForm;
