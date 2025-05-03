/**
 * Samudra Paket ERP - Shipment List Component
 * Displays shipments with search and filtering
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchShipments } from '@/store/slices/shipment/shipmentSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Loader2, Search, Filter, MoreHorizontal, FileText, Eye, Printer } from 'lucide-react';

const ShipmentList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { shipments, pagination, loading } = useSelector((state) => state.shipment);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    serviceType: '',
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Handle search input with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Fetch shipments when filters or search query changes
  useEffect(() => {
    const queryFilters = {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      ),
    };
    
    dispatch(fetchShipments({
      page: pagination.page,
      limit: pagination.limit,
      filters: queryFilters,
    }));
  }, [dispatch, pagination.page, pagination.limit, debouncedSearch, filters]);
  
  // Handle page change
  const handlePageChange = (page) => {
    dispatch(fetchShipments({
      page,
      limit: pagination.limit,
      filters: {
        ...(debouncedSearch && { search: debouncedSearch }),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      },
    }));
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
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };
  
  // Navigate to shipment details
  const viewShipmentDetails = (id) => {
    router.push(`/shipment/${id}`);
  };
  
  // Navigate to document viewer
  const viewShipmentDocument = (id) => {
    router.push(`/shipment/${id}/document`);
  };
  
  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.page;
    
    // Show first page
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
        </PaginationItem>
      );
      
      if (currentPage > 4) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    
    // Show pages around current page
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={i === currentPage}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Show last page
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      items.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Shipments</CardTitle>
        <CardDescription>
          Manage and track all shipments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by waybill no, customer name or phone..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="arrived_at_destination">Arrived</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed_delivery">Failed Delivery</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filters.paymentMethod}
              onValueChange={(value) => setFilters({ ...filters, paymentMethod: value })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Methods</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="COD">COD</SelectItem>
                <SelectItem value="CAD">CAD (Invoice)</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filters.serviceType}
              onValueChange={(value) => setFilters({ ...filters, serviceType: value })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Services</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="express">Express</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {loading ? (
          <div className="w-full flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : shipments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No shipments found. Try adjusting your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waybill No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((shipment) => (
                  <TableRow key={shipment._id}>
                    <TableCell className="font-medium">
                      {shipment.waybillNo}
                    </TableCell>
                    <TableCell>{formatDate(shipment.createdAt)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{shipment.senderName}</div>
                      <div className="text-xs text-muted-foreground">{shipment.senderCity}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{shipment.recipientName}</div>
                      <div className="text-xs text-muted-foreground">{shipment.recipientCity}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {shipment.serviceType}
                      </Badge>
                    </TableCell>
                    <TableCell>{shipment.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusBadgeColor(shipment.status)} capitalize`}>
                        {shipment.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => viewShipmentDetails(shipment._id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => viewShipmentDocument(shipment._id)}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Document
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/shipment/tracking?waybill=${shipment.waybillNo}`)}>
                            <Printer className="h-4 w-4 mr-2" />
                            Track Shipment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      {shipments.length > 0 && (
        <CardFooter>
          <Pagination className="w-full flex justify-center">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(Math.max(1, pagination.page - 1))} 
                  disabled={pagination.page === 1}
                />
              </PaginationItem>
              
              {renderPaginationItems()}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))} 
                  disabled={pagination.page === pagination.totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      )}
    </Card>
  );
};

export default ShipmentList;
