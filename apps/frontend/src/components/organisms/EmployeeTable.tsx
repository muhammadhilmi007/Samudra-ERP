'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Eye, Trash2, FileText, Briefcase, Clock } from 'lucide-react';
import { Employee } from '@/services/employeeService';
import Button from '../atoms/Button';
import Pagination from '../molecules/Pagination';

interface EmployeeTableProps {
  employees: Employee[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
}

/**
 * EmployeeTable - Component for displaying employee list in a table
 */
const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  meta,
  onPageChange,
  onDelete,
}) => {
  const router = useRouter();

  // Format date to locale string
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get status badge class based on employment status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      case 'onLeave':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get employment type label
  const getEmploymentTypeLabel = (type: string) => {
    switch (type) {
      case 'fullTime':
        return 'Full Time';
      case 'partTime':
        return 'Part Time';
      case 'contract':
        return 'Kontrak';
      case 'probation':
        return 'Probation';
      default:
        return type;
    }
  };

  // Navigate to employee detail page
  const handleViewDetail = (id: string) => {
    router.push(`/employees/${id}`);
  };

  // Navigate to employee edit page
  const handleEdit = (id: string) => {
    router.push(`/employees/edit/${id}`);
  };

  // Navigate to employee documents page
  const handleViewDocuments = (id: string) => {
    router.push(`/employees/${id}/documents`);
  };

  // Navigate to employee assignments page
  const handleViewAssignments = (id: string) => {
    router.push(`/employees/${id}/assignments`);
  };

  // Navigate to employee attendance page
  const handleViewAttendance = (id: string) => {
    router.push(`/employees/${id}/attendance`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ID Karyawan
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nama
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Penempatan
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tipe
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tanggal Bergabung
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  Tidak ada data karyawan
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {employee.employeeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.fullName || `${employee.firstName} ${employee.lastName}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.currentAssignment ? (
                      <div>
                        <div>{employee.currentAssignment.branchName || '-'}</div>
                        <div className="text-xs text-gray-400">
                          {employee.currentAssignment.divisionName} / {employee.currentAssignment.positionName}
                        </div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getEmploymentTypeLabel(employee.metadata.employmentType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                        employee.metadata.employmentStatus
                      )}`}
                    >
                      {employee.metadata.employmentStatus === 'active'
                        ? 'Aktif'
                        : employee.metadata.employmentStatus === 'inactive'
                        ? 'Tidak Aktif'
                        : employee.metadata.employmentStatus === 'terminated'
                        ? 'Diberhentikan'
                        : employee.metadata.employmentStatus === 'onLeave'
                        ? 'Cuti'
                        : employee.metadata.employmentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(employee.metadata.joinDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetail(employee.id as string)}
                        title="Lihat Detail"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(employee.id as string)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDocuments(employee.id as string)}
                        title="Dokumen"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewAssignments(employee.id as string)}
                        title="Penempatan"
                      >
                        <Briefcase className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewAttendance(employee.id as string)}
                        title="Absensi"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(employee.id as string)}
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;
