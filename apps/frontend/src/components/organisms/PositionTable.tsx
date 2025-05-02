'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Eye, Trash2, Briefcase, Building, Users } from 'lucide-react';
import { Position } from '../../services/positionService';
import Button from '../atoms/Button';

interface PositionTableProps {
  positions: Position[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  divisionNames: Record<string, string>;
}

/**
 * PositionTable - Component for displaying position data in a table
 */
const PositionTable: React.FC<PositionTableProps> = ({ 
  positions, 
  isLoading, 
  onDelete,
  divisionNames
}) => {
  const router = useRouter();
  
  const handleView = (id: string) => {
    router.push(`/positions/${id}`);
  };
  
  const handleEdit = (id: string) => {
    router.push(`/positions/edit/${id}`);
  };
  
  const getPositionLevelLabel = (level: number) => {
    switch (level) {
      case 0:
        return 'Direktur';
      case 1:
        return 'Manajer';
      case 2:
        return 'Supervisor';
      case 3:
        return 'Staff Senior';
      case 4:
        return 'Staff';
      case 5:
        return 'Staff Junior';
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
  
  if (positions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500">Tidak ada data jabatan yang ditemukan.</p>
        <Button
          type="button"
          variant="primary"
          className="mt-4"
          onClick={() => router.push('/positions/create')}
        >
          Tambah Jabatan Baru
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
                Jabatan
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Divisi
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
            {positions.map((position) => (
              <tr key={position.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {position.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{position.title}</span>
                  </div>
                  {position.description && (
                    <p className="text-xs text-gray-400 mt-1">{position.description}</p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-gray-400 mr-2" />
                    {divisionNames[position.division] || position.division}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {getPositionLevelLabel(position.level || 0)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    position.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {position.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => handleView(position.id as string)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Lihat Detail"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(position.id as string)}
                      className="text-amber-600 hover:text-amber-900"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(position.id as string)}
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

export default PositionTable;
