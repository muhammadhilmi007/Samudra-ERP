'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
import { BranchListParams } from '@/services/branchService';
import FormField from '../atoms/FormField';
import Button from '../atoms/Button';
import Select from '../atoms/Select';

// Define filter schema
const filterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).default('all'),
  level: z.enum(['all', '0', '1', '2', '3']).default('all'),
  parentBranch: z.string().optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

interface BranchFilterProps {
  onFilterChange: (filters: BranchListParams) => void;
  parentBranchOptions: Array<{ value: string; label: string }>;
}

/**
 * BranchFilter - Component for filtering branch list
 * Handles search and filtering functionality
 */
const BranchFilter: React.FC<BranchFilterProps> = ({ onFilterChange, parentBranchOptions }) => {
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
      level: 'all',
      parentBranch: '',
    },
  });
  
  // Watch for changes to apply filters automatically
  const watchedValues = watch();
  
  useEffect(() => {
    if (isDirty) {
      const filters: BranchListParams = {};
      
      if (watchedValues.search) {
        filters.search = watchedValues.search;
      }
      
      if (watchedValues.status && watchedValues.status !== 'all') {
        filters.status = watchedValues.status as 'active' | 'inactive';
      }
      
      if (watchedValues.level && watchedValues.level !== 'all') {
        filters.level = parseInt(watchedValues.level, 10);
      }
      
      if (watchedValues.parentBranch) {
        filters.parentBranch = watchedValues.parentBranch;
      }
      
      onFilterChange(filters);
    }
  }, [watchedValues, isDirty, onFilterChange]);
  
  const handleReset = () => {
    reset({
      search: '',
      status: 'all',
      level: 'all',
      parentBranch: '',
    });
    onFilterChange({});
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Filter Cabang</h3>
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
          placeholder="Cari berdasarkan kode atau nama cabang..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          {...register('search')}
        />
      </div>
      
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
              Level
            </label>
            <Select
              {...register('level')}
              options={[
                { value: 'all', label: 'Semua Level' },
                { value: '0', label: 'Kantor Pusat (0)' },
                { value: '1', label: 'Regional (1)' },
                { value: '2', label: 'Cabang (2)' },
                { value: '3', label: 'Sub-Cabang (3)' },
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cabang Induk
            </label>
            <Select
              {...register('parentBranch')}
              options={[
                { value: '', label: 'Semua Cabang' },
                ...parentBranchOptions,
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

export default BranchFilter;
