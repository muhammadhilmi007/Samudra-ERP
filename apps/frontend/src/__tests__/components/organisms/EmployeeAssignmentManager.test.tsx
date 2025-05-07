import { render, screen, fireEvent } from '@testing-library/react';
import EmployeeAssignmentManager from '../../../components/organisms/EmployeeAssignmentManager';

describe('EmployeeAssignmentManager', () => {
  const assignments = [
    {
      id: 'as1',
      branchId: 'b1',
      branchName: 'Cabang A',
      divisionId: 'd1',
      divisionName: 'Divisi A',
      positionId: 'p1',
      positionName: 'Manager',
      startDate: new Date('2023-01-01'),
      status: 'active' as const,
      notes: 'Penempatan awal',
    },
  ];

  it('renders assignment list', () => {
    render(
      <EmployeeAssignmentManager
        employeeId="1"
        assignments={assignments}
        onAddAssignment={jest.fn()}
        onUpdateAssignment={jest.fn()}
        onDeleteAssignment={jest.fn()}
      />
    );
    expect(screen.getByText('Cabang A')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  it('calls onDeleteAssignment when delete button is clicked', () => {
    const onDeleteAssignment = jest.fn();
    render(
      <EmployeeAssignmentManager
        employeeId="1"
        assignments={assignments}
        onAddAssignment={jest.fn()}
        onUpdateAssignment={jest.fn()}
        onDeleteAssignment={onDeleteAssignment}
      />
    );
    fireEvent.click(screen.getByLabelText(/Hapus Assignment/i));
    expect(onDeleteAssignment).toHaveBeenCalledWith('as1');
  });
}); 