'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Eye, Trash2, Building, Users } from 'lucide-react';
import { Division } from '../../services/divisionService';
import Button from '../atoms/Button';

interface DivisionTableProps {
  divisions: Division[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  branchNames: Record<string, string>;
}

/**
 * DivisionTable - Component for displaying division data in a table
 */
const DivisionTable: React.FC<DivisionTableProps> = ({ 
  divisions, 
  isLoading, 
  onDelete,
  branchNames
}) => {
  const router = useRouter();
  
  const handleView = (id: string) => {
    router.push(`/divisions/${id}`);
  };
  
  const handleEdit = (id: string) => {
    router.push(`/divisions/edit/${id}`);
  };
  
  const getDivisionLevelLabel = (level: number) => {
    switch (level) {
      case 0:
        return 'Divisi Utama';
      case 1:
        return 'Sub Divisi';
      case 2:
        return 'Departemen';
      case 3:
        return 'Unit';
      default:
        return `Level ${level}`;
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-16 bg-gray-200 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (divisions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500">Tidak ada data divisi yang ditemukan.</p>
        <Button
          type="button"
          variant="primary"
          className="mt-4"
          onClick={() => router.push('/divisions/create')}
        >
          Tambah Divisi Baru
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kode
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Divisi
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cabang
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {divisions.map((division) => (
              <tr key={division.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {division.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{division.name}</span>
                  </div>
                  {division.description && (
                    <p className="text-xs text-gray-400 mt-1">{division.description}</p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {branchNames[division.branch] || division.branch}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {getDivisionLevelLabel(division.level || 0)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    division.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {division.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => handleView(division.id as string)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Lihat Detail"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(division.id as string)}
                      className="text-amber-600 hover:text-amber-900"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(division.id as string)}
                      className="text-red-600 hover:text-red-900"
                      title="Hapus"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DivisionTable;
