'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import Select from '../atoms/Select';
import Button from '../atoms/Button';
import branchService from '../../services/branchService';
import divisionService from '../../services/divisionService';
import positionService from '../../services/positionService';

interface EmployeeFilterProps {
  onFilter: (filters: {
    search?: string;
    status?: string;
    branchId?: string;
    divisionId?: string;
    positionId?: string;
    employmentType?: string;
  }) => void;
}

/**
 * EmployeeFilter - Component for filtering employee list
 */
const EmployeeFilter: React.FC<EmployeeFilterProps> = ({ onFilter }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [branchId, setBranchId] = useState('');
  const [divisionId, setDivisionId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [employmentType, setEmploymentType] = useState('');

  // Fetch branches for filter options
  const { data: branchesData } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getBranches({ limit: 100 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch divisions for filter options
  const { data: divisionsData } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => divisionService.getDivisions({ limit: 100 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch positions for filter options
  const { data: positionsData } = useQuery({
    queryKey: ['positions'],
    queryFn: () => positionService.getPositions({ limit: 100 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Prepare branch options for dropdown
  const branchOptions = React.useMemo(() => {
    if (!branchesData?.data) return [{ value: '', label: 'Semua Cabang' }];

    return [
      { value: '', label: 'Semua Cabang' },
      ...branchesData.data.map((branch) => ({
        value: branch.id as string,
        label: `${branch.code} - ${branch.name}`,
      })),
    ];
  }, [branchesData]);

  // Prepare division options for dropdown
  const divisionOptions = React.useMemo(() => {
    if (!divisionsData?.data) return [{ value: '', label: 'Semua Divisi' }];

    return [
      { value: '', label: 'Semua Divisi' },
      ...divisionsData.data.map((division) => ({
        value: division.id as string,
        label: `${division.code} - ${division.name}`,
      })),
    ];
  }, [divisionsData]);

  // Prepare position options for dropdown
  const positionOptions = React.useMemo(() => {
    if (!positionsData?.data) return [{ value: '', label: 'Semua Jabatan' }];

    return [
      { value: '', label: 'Semua Jabatan' },
      ...positionsData.data.map((position) => ({
        value: position.id as string,
        label: position.name,
      })),
    ];
  }, [positionsData]);

  // Status options
  const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Tidak Aktif' },
    { value: 'terminated', label: 'Diberhentikan' },
    { value: 'onLeave', label: 'Cuti' },
  ];

  // Employment type options
  const employmentTypeOptions = [
    { value: '', label: 'Semua Tipe' },
    { value: 'fullTime', label: 'Full Time' },
    { value: 'partTime', label: 'Part Time' },
    { value: 'contract', label: 'Kontrak' },
    { value: 'probation', label: 'Probation' },
  ];

  // Handle filter submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({
      search,
      status,
      branchId,
      divisionId,
      positionId,
      employmentType,
    });
  };

  // Handle filter reset
  const handleReset = () => {
    setSearch('');
    setStatus('');
    setBranchId('');
    setDivisionId('');
    setPositionId('');
    setEmploymentType('');
    
    onFilter({});
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Cari nama, ID karyawan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <Select
              options={statusOptions}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Status Karyawan"
            />
          </div>

          <div>
            <Select
              options={employmentTypeOptions}
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              placeholder="Tipe Karyawan"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Select
              options={branchOptions}
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              placeholder="Cabang"
            />
          </div>

          <div>
            <Select
              options={divisionOptions}
              value={divisionId}
              onChange={(e) => setDivisionId(e.target.value)}
              placeholder="Divisi"
            />
          </div>

          <div>
            <Select
              options={positionOptions}
              value={positionId}
              onChange={(e) => setPositionId(e.target.value)}
              placeholder="Jabatan"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            Filter
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeFilter;
