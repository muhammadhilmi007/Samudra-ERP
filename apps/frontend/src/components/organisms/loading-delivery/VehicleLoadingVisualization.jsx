/**
 * Samudra Paket ERP - Vehicle Loading Visualization Component
 * Provides an interactive visualization of vehicle loading state
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Package, CheckCircle, Truck, ArrowRight } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const VehicleLoadingVisualization = ({ 
  vehicleData, 
  loadingItems = [], 
  onItemLoad = () => {},
  onComplete = () => {}
}) => {
  const [selectedSection, setSelectedSection] = useState(null);
  
  // Calculate loading progress percentage
  const loadedItems = loadingItems.filter(item => item.loaded).length;
  const totalItems = loadingItems.length;
  const progressPercentage = totalItems > 0 ? Math.round((loadedItems / totalItems) * 100) : 0;
  
  // Group items by section
  const itemsBySection = loadingItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {});
  
  // Vehicle sections based on the vehicle type
  const vehicleSections = [
    { id: 'front', label: 'Depan', x: 10, y: 10, width: 80, height: 80 },
    { id: 'middle', label: 'Tengah', x: 10, y: 100, width: 80, height: 80 },
    { id: 'rear', label: 'Belakang', x: 10, y: 190, width: 80, height: 80 }
  ];
  
  // Handle clicking on a vehicle section
  const handleSectionClick = (sectionId) => {
    setSelectedSection(sectionId === selectedSection ? null : sectionId);
  };
  
  // Handle loading an item into the vehicle
  const handleLoadItem = (itemId) => {
    onItemLoad(itemId);
  };
  
  // Check if loading is complete
  const isLoadingComplete = loadedItems === totalItems && totalItems > 0;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Visualisasi Pemuatan Kendaraan
            {vehicleData && (
              <Badge variant="outline" className="ml-2">
                {vehicleData.id}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Vehicle loading diagram */}
            <div className="flex-1 border rounded-lg p-4 bg-muted/20">
              <h3 className="text-sm font-medium mb-2">Peta Pemuatan</h3>
              
              <div className="relative h-[280px] border-2 border-dashed rounded-md border-gray-300 bg-white">
                <div className="absolute top-2 right-2 text-xs text-muted-foreground">
                  Kapasitas Total: {vehicleData?.capacity || 'N/A'} kg
                </div>
                
                {/* Vehicle outline */}
                <div className="absolute inset-4 border-2 rounded-md border-gray-400">
                  {/* Vehicle cab */}
                  <div className="absolute left-0 top-0 w-[20%] h-full bg-gray-200 border-r-2 border-gray-400 flex items-center justify-center">
                    <Truck className="h-8 w-8 text-gray-500" />
                  </div>
                  
                  {/* Loading sections */}
                  <div className="absolute left-[20%] top-0 w-[80%] h-full flex">
                    <div 
                      className={`flex-1 border-r border-gray-400 flex items-center justify-center cursor-pointer ${selectedSection === 'front' ? 'bg-blue-100' : ''}`}
                      onClick={() => handleSectionClick('front')}
                    >
                      <div className="text-sm font-medium">Depan</div>
                      {itemsBySection['front'] && (
                        <Badge className="absolute top-2 right-2">
                          {itemsBySection['front'].filter(i => i.loaded).length}/{itemsBySection['front'].length}
                        </Badge>
                      )}
                    </div>
                    <div 
                      className={`flex-1 border-r border-gray-400 flex items-center justify-center cursor-pointer ${selectedSection === 'middle' ? 'bg-blue-100' : ''}`}
                      onClick={() => handleSectionClick('middle')}
                    >
                      <div className="text-sm font-medium">Tengah</div>
                      {itemsBySection['middle'] && (
                        <Badge className="absolute top-2 right-2">
                          {itemsBySection['middle'].filter(i => i.loaded).length}/{itemsBySection['middle'].length}
                        </Badge>
                      )}
                    </div>
                    <div 
                      className={`flex-1 flex items-center justify-center cursor-pointer ${selectedSection === 'rear' ? 'bg-blue-100' : ''}`}
                      onClick={() => handleSectionClick('rear')}
                    >
                      <div className="text-sm font-medium">Belakang</div>
                      {itemsBySection['rear'] && (
                        <Badge className="absolute top-2 right-2">
                          {itemsBySection['rear'].filter(i => i.loaded).length}/{itemsBySection['rear'].length}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm">
                  Progress: <span className="font-medium">{progressPercentage}%</span>
                </div>
                <div className="w-64 h-2 bg-gray-200 rounded-full">
                  <div 
                    className={`h-2 rounded-full ${progressPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="sm" 
                        disabled={!isLoadingComplete}
                        onClick={onComplete}
                        className={isLoadingComplete ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        {isLoadingComplete ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Selesai
                          </>
                        ) : (
                          <>
                            <Package className="h-4 w-4 mr-2" />
                            Muat Barang
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    {!isLoadingComplete && (
                      <TooltipContent>
                        Selesaikan pemuatan semua barang terlebih dahulu
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            {/* Items list for selected section */}
            <div className="flex-1 border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">
                {selectedSection 
                  ? `Barang di Bagian ${selectedSection === 'front' ? 'Depan' : selectedSection === 'middle' ? 'Tengah' : 'Belakang'}`
                  : 'Pilih Bagian Untuk Melihat Detail Barang'
                }
              </h3>
              
              {selectedSection ? (
                itemsBySection[selectedSection] && itemsBySection[selectedSection].length > 0 ? (
                  <div className="space-y-2 max-h-[230px] overflow-y-auto pr-2">
                    {itemsBySection[selectedSection].map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-3 rounded-md border ${item.loaded ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-sm">{item.id} - {item.description}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {item.weight} kg • {item.dimensions}
                            </div>
                          </div>
                          <Button 
                            variant={item.loaded ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleLoadItem(item.id)}
                            disabled={item.loaded}
                          >
                            {item.loaded ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <ArrowRight className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[230px] border border-dashed rounded-md">
                    <div className="text-center text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2" />
                      <p>Tidak ada barang di bagian ini</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-[230px] border border-dashed rounded-md">
                  <div className="text-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>Pilih bagian kendaraan pada visualisasi</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleLoadingVisualization;
