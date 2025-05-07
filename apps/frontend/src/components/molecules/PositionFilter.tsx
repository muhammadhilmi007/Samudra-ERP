'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
import { PositionListParams } from '../../services/positionService';
import FormField from '../atoms/FormField';
import Button from '../atoms/Button';
import {Select} from '../atoms/Select';


// Define filter schema
const filterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).default('all'),
  branch: z.string().optional(),
  division: z.string().optional(),
  level: z.enum(['all', '0', '1', '2', '3', '4', '5']).default('all'),
  parentPosition: z.string().optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

interface PositionFilterProps {
  onFilterChange: (filters: PositionListParams) => void;
  branchOptions: Array<{ value: string; label: string }>;
  divisionOptions: Array<{ value: string; label: string }>;
  parentPositionOptions: Array<{ value: string; label: string }>;
}

/**
 * PositionFilter - Component for filtering position list
 * Handles search and filtering functionality
 */
const PositionFilter: React.FC<PositionFilterProps> = ({
  onFilterChange,
  branchOptions,
  divisionOptions,
  parentPositionOptions,
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
      division: '',
      level: 'all',
      parentPosition: '',
    },
  });

  // Watch for changes to apply filters automatically
  const watchedValues = watch();

  useEffect(() => {
    if (isDirty) {
      const filters: PositionListParams = {};

      if (watchedValues.search) {
        filters.search = watchedValues.search;
      }

      if (watchedValues.status && watchedValues.status !== 'all') {
        filters.status = watchedValues.status as 'active' | 'inactive';
      }

      if (watchedValues.branch) {
        filters.branch = watchedValues.branch;
      }

      if (watchedValues.division) {
        filters.division = watchedValues.division;
      }

      if (watchedValues.level && watchedValues.level !== 'all') {
        filters.level = parseInt(watchedValues.level, 10);
      }

      if (watchedValues.parentPosition) {
        filters.parentPosition = watchedValues.parentPosition;
      }

      onFilterChange(filters);
    }
  }, [watchedValues, isDirty, onFilterChange]);

  const handleReset = () => {
    reset({
      search: '',
      status: 'all',
      branch: '',
      division: '',
      level: 'all',
      parentPosition: '',
    });
    onFilterChange({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Filter Jabatan</h3>
        <Button type="button" variant="text" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
        </Button>
      </div>

      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Cari berdasarkan kode atau nama jabatan..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          {...register('search')}
        />
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Cabang</label>
            <Select
              {...register('branch')}
              options={[{ value: '', label: 'Semua Cabang' }, ...branchOptions]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Divisi</label>
            <Select
              {...register('division')}
              options={[{ value: '', label: 'Semua Divisi' }, ...divisionOptions]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <Select
              {...register('level')}
              options={[
                { value: 'all', label: 'Semua Level' },
                { value: '0', label: 'Direktur (0)' },
                { value: '1', label: 'Manajer (1)' },
                { value: '2', label: 'Supervisor (2)' },
                { value: '3', label: 'Staff Senior (3)' },
                { value: '4', label: 'Staff (4)' },
                { value: '5', label: 'Staff Junior (5)' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan Atasan</label>
            <Select
              {...register('parentPosition')}
              options={[{ value: '', label: 'Semua Jabatan' }, ...parentPositionOptions]}
            />
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="flex justify-end mt-4">
          <Button type="button" variant="outline" onClick={handleReset} className="mr-2">
            Reset
          </Button>
        </div>
      )}
    </div>
  );
};

export default PositionFilter;
