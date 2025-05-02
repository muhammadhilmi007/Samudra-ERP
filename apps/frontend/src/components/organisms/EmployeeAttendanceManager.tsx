'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Calendar, Clock, MapPin } from 'lucide-react';
import { EmployeeAttendance } from '../../services/employeeService';
import FormField from '../molecules/FormField';
import Button from '../atoms/Button';
import Select from '../atoms/Select';

// Define form schema
const attendanceSchema = z.object({
  date: z.string().min(1, 'Tanggal harus diisi'),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  status: z.enum(['present', 'absent', 'late', 'halfDay', 'leave']),
  notes: z.string().optional(),
  location: z.object({
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    address: z.string().optional(),
  }).optional(),
});

type AttendanceFormValues = z.infer<typeof attendanceSchema>;

interface EmployeeAttendanceManagerProps {
  employeeId: string;
  attendanceRecords: EmployeeAttendance[];
  onRecordAttendance: (attendance: EmployeeAttendance) => Promise<void>;
}

/**
 * EmployeeAttendanceManager - Component for managing employee attendance
 */
const EmployeeAttendanceManager: React.FC<EmployeeAttendanceManagerProps> = ({
  employeeId,
  attendanceRecords,
  onRecordAttendance,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7) // Current month in YYYY-MM format
  );

  // Format date to locale string
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format time to locale string
  const formatTime = (date: Date | string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge class based on attendance status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-amber-100 text-amber-800';
      case 'halfDay':
        return 'bg-blue-100 text-blue-800';
      case 'leave':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present':
        return 'Hadir';
      case 'absent':
        return 'Tidak Hadir';
      case 'late':
        return 'Terlambat';
      case 'halfDay':
        return 'Setengah Hari';
      case 'leave':
        return 'Cuti';
      default:
        return status;
    }
  };

  // Filter attendance records by selected month
  const filteredAttendance = React.useMemo(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) return [];

    const [year, month] = selectedMonth.split('-').map(Number);
    
    return attendanceRecords.filter((record) => {
      const recordDate = new Date(record.date);
      return (
        recordDate.getFullYear() === year && 
        recordDate.getMonth() === month - 1
      );
    }).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [attendanceRecords, selectedMonth]);

  // Calculate attendance summary for the selected month
  const attendanceSummary = React.useMemo(() => {
    const summary = {
      total: filteredAttendance.length,
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      leave: 0,
    };

    filteredAttendance.forEach((record) => {
      switch (record.status) {
        case 'present':
          summary.present++;
          break;
        case 'absent':
          summary.absent++;
          break;
        case 'late':
          summary.late++;
          break;
        case 'halfDay':
          summary.halfDay++;
          break;
        case 'leave':
          summary.leave++;
          break;
      }
    });

    return summary;
  }, [filteredAttendance]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      checkIn: '',
      checkOut: '',
      status: 'present',
      notes: '',
      location: {
        latitude: null,
        longitude: null,
        address: '',
      },
    },
  });

  // Handle form submission
  const onSubmit = async (data: AttendanceFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Format data for API
      const attendanceData: EmployeeAttendance = {
        date: new Date(data.date),
        checkIn: data.checkIn ? new Date(`${data.date}T${data.checkIn}:00`) : undefined,
        checkOut: data.checkOut ? new Date(`${data.date}T${data.checkOut}:00`) : undefined,
        status: data.status,
        notes: data.notes,
        location: data.location,
      };

      // Call parent handler to record attendance
      await onRecordAttendance(attendanceData);

      // Reset form and hide it
      reset();
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate month options for the last 12 months
  const monthOptions = React.useMemo(() => {
    const options = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = date.toISOString().substring(0, 7); // YYYY-MM format
      const label = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      
      options.push({ value, label });
    }
    
    return options;
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Absensi Karyawan</h2>
        <Button
          variant="primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Batal' : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Catat Absensi
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Catat Absensi Baru</h3>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormField
                  label="Tanggal"
                  name="date"
                  type="date"
                  error={errors.date?.message}
                  register={register}
                  required
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Jam Masuk"
                    name="checkIn"
                    type="time"
                    error={errors.checkIn?.message}
                    register={register}
                  />
                  
                  <FormField
                    label="Jam Keluar"
                    name="checkOut"
                    type="time"
                    error={errors.checkOut?.message}
                    register={register}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('status')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="present">Hadir</option>
                    <option value="absent">Tidak Hadir</option>
                    <option value="late">Terlambat</option>
                    <option value="halfDay">Setengah Hari</option>
                    <option value="leave">Cuti</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <FormField
                  label="Catatan"
                  name="notes"
                  type="textarea"
                  placeholder="Masukkan catatan tambahan"
                  error={errors.notes?.message}
                  register={register}
                />
                
                <div className="mt-4">
                  <h3 className="text-md font-medium mb-3">Lokasi (Opsional)</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Latitude"
                      name="location.latitude"
                      type="number"
                      step="0.000001"
                      placeholder="Masukkan latitude"
                      error={errors.location?.latitude?.message}
                      register={register}
                    />
                    
                    <FormField
                      label="Longitude"
                      name="location.longitude"
                      type="number"
                      step="0.000001"
                      placeholder="Masukkan longitude"
                      error={errors.location?.longitude?.message}
                      register={register}
                    />
                  </div>
                  
                  <FormField
                    label="Alamat"
                    name="location.address"
                    type="text"
                    placeholder="Masukkan alamat lokasi"
                    error={errors.location?.address?.message}
                    register={register}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Absensi'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div className="mb-4 md:mb-0">
            <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Bulan
            </label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="bg-white p-2 rounded-md border border-gray-200 text-center">
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-lg font-semibold">{attendanceSummary.total}</div>
            </div>
            <div className="bg-green-50 p-2 rounded-md border border-green-200 text-center">
              <div className="text-sm text-green-600">Hadir</div>
              <div className="text-lg font-semibold text-green-700">{attendanceSummary.present}</div>
            </div>
            <div className="bg-amber-50 p-2 rounded-md border border-amber-200 text-center">
              <div className="text-sm text-amber-600">Terlambat</div>
              <div className="text-lg font-semibold text-amber-700">{attendanceSummary.late}</div>
            </div>
            <div className="bg-red-50 p-2 rounded-md border border-red-200 text-center">
              <div className="text-sm text-red-600">Tidak Hadir</div>
              <div className="text-lg font-semibold text-red-700">{attendanceSummary.absent}</div>
            </div>
            <div className="bg-purple-50 p-2 rounded-md border border-purple-200 text-center">
              <div className="text-sm text-purple-600">Cuti</div>
              <div className="text-lg font-semibold text-purple-700">{attendanceSummary.leave}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tanggal
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
                Jam Masuk
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Jam Keluar
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Lokasi
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Catatan
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAttendance.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  Tidak ada data absensi untuk bulan ini
                </td>
              </tr>
            ) : (
              filteredAttendance.map((record, index) => (
                <tr key={record.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDate(record.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                        record.status
                      )}`}
                    >
                      {getStatusLabel(record.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.checkIn && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {formatTime(record.checkIn)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.checkOut && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {formatTime(record.checkOut)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.location?.address ? (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate max-w-xs" title={record.location.address}>
                          {record.location.address}
                        </span>
                      </div>
                    ) : record.location?.latitude && record.location?.longitude ? (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>
                          {record.location.latitude.toFixed(6)}, {record.location.longitude.toFixed(6)}
                        </span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="truncate max-w-xs block" title={record.notes || ''}>
                      {record.notes || '-'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeAttendanceManager;
