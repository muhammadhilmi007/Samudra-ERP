import { render, screen, fireEvent } from '@testing-library/react';
import EmployeeAttendanceManager from '../../../components/organisms/EmployeeAttendanceManager';

describe('EmployeeAttendanceManager', () => {
  const attendanceRecords = [
    {
      id: 'att1',
      date: new Date('2023-06-01'),
      checkIn: new Date('2023-06-01T08:00:00'),
      checkOut: new Date('2023-06-01T17:00:00'),
      status: 'present' as const,
      notes: 'Hadir',
    },
  ];

  it('renders attendance records', () => {
    render(
      <EmployeeAttendanceManager
        employeeId="1"
        attendanceRecords={attendanceRecords}
        onRecordAttendance={jest.fn()}
      />
    );
    expect(screen.getByText('Hadir')).toBeInTheDocument();
  });

  it('calls onRecordAttendance when add attendance button is clicked', () => {
    const onRecordAttendance = jest.fn();
    render(
      <EmployeeAttendanceManager
        employeeId="1"
        attendanceRecords={attendanceRecords}
        onRecordAttendance={onRecordAttendance}
      />
    );
    fireEvent.click(screen.getByLabelText(/Tambah Absensi/i));
    expect(onRecordAttendance).toHaveBeenCalled();
  });
}); 