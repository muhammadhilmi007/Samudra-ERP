'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
import { DivisionListParams } from '../../services/divisionService';
import FormField from '../atoms/FormField';
import Button from '../atoms/Button';
import Select from '../atoms/Select';

// Define filter schema
const filterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).default('all'),
  branch: z.string().optional(),
  level: z.enum(['all', '0', '1', '2', '3']).default('all'),
  parentDivision: z.string().optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

interface DivisionFilterProps {
  onFilterChange: (filters: DivisionListParams) => void;
  branchOptions: Array<{ value: string; label: string }>;
  parentDivisionOptions: Array<{ value: string; label: string }>;
}

/**
 * DivisionFilter - Component for filtering division list
 * Handles search and filtering functionality
 */
const DivisionFilter: React.FC<DivisionFilterProps> = ({ 
  onFilterChange, 
  branchOptions, 
  parentDivisionOptions 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty },
  } = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: '',
      status: 'all',
      branch: '',
      level: 'all',
      parentDivision: '',
    },
  });
  
  // Watch for changes to apply filters automatically
  const watchedValues = watch();
  
  useEffect(() => {
    if (isDirty) {
      const filters: DivisionListParams = {};
      
      if (watchedValues.search) {
        filters.search = watchedValues.search;
      }
      
      if (watchedValues.status && watchedValues.status !== 'all') {
        filters.status = watchedValues.status as 'active' | 'inactive';
      }
      
      if (watchedValues.branch) {
        filters.branch = watchedValues.branch;
      }
      
      if (watchedValues.level && watchedValues.level !== 'all') {
        filters.level = parseInt(watchedValues.level, 10);
      }
      
      if (watchedValues.parentDivision) {
        filters.parentDivision = watchedValues.parentDivision;
      }
      
      onFilterChange(filters);
    }
  }, [watchedValues, isDirty, onFilterChange]);
  
  const handleReset = () => {
    reset({
      search: '',
      status: 'all',
      branch: '',
      level: 'all',
      parentDivision: '',
    });
    onFilterChange({});
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Filter Divisi</h3>
        <Button
          type="button"
          variant="text"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
        </Button>
      </div>
      
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Cari berdasarkan kode atau nama divisi..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          {...register('search')}
        />
      </div>
      
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select
              {...register('status')}
              options={[
                { value: 'all', label: 'Semua Status' },
                { value: 'active', label: 'Aktif' },
                { value: 'inactive', label: 'Tidak Aktif' },
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cabang
            </label>
            <Select
              {...register('branch')}
              options={[
                { value: '', label: 'Semua Cabang' },
                ...branchOptions,
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level
            </label>
            <Select
              {...register('level')}
              options={[
                { value: 'all', label: 'Semua Level' },
                { value: '0', label: 'Divisi Utama (0)' },
                { value: '1', label: 'Sub Divisi (1)' },
                { value: '2', label: 'Departemen (2)' },
                { value: '3', label: 'Unit (3)' },
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Divisi Induk
            </label>
            <Select
              {...register('parentDivision')}
              options={[
                { value: '', label: 'Semua Divisi' },
                ...parentDivisionOptions,
              ]}
            />
          </div>
        </div>
      )}
      
      {isExpanded && (
        <div className="flex justify-end mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="mr-2"
          >
            Reset
          </Button>
        </div>
      )}
    </div>
  );
};

export default DivisionFilter;
