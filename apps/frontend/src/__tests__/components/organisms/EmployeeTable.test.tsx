import { render, screen, fireEvent } from '@testing-library/react';
import EmployeeTable from '../../../components/organisms/EmployeeTable';

const employees = [
  {
    id: '1',
    employeeId: 'EMP01',
    firstName: 'Budi',
    lastName: 'Santoso',
    gender: 'male' as const,
    birthDate: new Date('1990-01-01'),
    contact: { phone: '08123456789', email: 'budi@samudra.com' },
    address: { street: 'Jl. Test', city: 'Jakarta', province: 'DKI', postalCode: '12345', country: 'Indonesia' },
    metadata: { joinDate: new Date('2023-01-01'), employmentType: 'fullTime' as const, employmentStatus: 'active' as const },
  },
];

const meta = { total: 1, page: 1, limit: 10, totalPages: 1 };

describe('EmployeeTable', () => {
  it('renders employee data', () => {
    render(
      <EmployeeTable employees={employees} meta={meta} onPageChange={() => {}} onDelete={() => {}} />
    );
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.getByText('EMP01')).toBeInTheDocument();
  });

  it('calls router.push when detail or edit button is clicked', () => {
    const push = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push });
    render(
      <EmployeeTable employees={employees} meta={meta} onPageChange={() => {}} onDelete={() => {}} />
    );
    fireEvent.click(screen.getByLabelText(/Lihat Detail/i));
    expect(push).toHaveBeenCalledWith('/employees/1');
    fireEvent.click(screen.getByLabelText(/Edit/i));
    expect(push).toHaveBeenCalledWith('/employees/edit/1');
  });
}); 