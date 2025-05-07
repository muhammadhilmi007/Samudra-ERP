import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmployeeForm from '../../../components/organisms/EmployeeForm';

describe('EmployeeForm', () => {
  it('renders form fields', () => {
    render(<EmployeeForm />);
    expect(screen.getByLabelText(/ID karyawan/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nama depan/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nama belakang/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Telepon/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });

  it('shows validation error when required fields are empty', async () => {
    render(<EmployeeForm />);
    fireEvent.submit(screen.getByRole('form'));
    await waitFor(() => {
      expect(screen.getByText(/ID karyawan minimal/i)).toBeInTheDocument();
      expect(screen.getByText(/Nama depan harus diisi/i)).toBeInTheDocument();
      expect(screen.getByText(/Nama belakang harus diisi/i)).toBeInTheDocument();
      expect(screen.getByText(/Nomor telepon harus diisi/i)).toBeInTheDocument();
      expect(screen.getByText(/Format email tidak valid/i)).toBeInTheDocument();
    });
  });

  it('can submit form with minimal valid data', async () => {
    const push = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push });
    render(<EmployeeForm />);
    fireEvent.change(screen.getByLabelText(/ID karyawan/i), { target: { value: 'EMP01' } });
    fireEvent.change(screen.getByLabelText(/Nama depan/i), { target: { value: 'Budi' } });
    fireEvent.change(screen.getByLabelText(/Nama belakang/i), { target: { value: 'Santoso' } });
    fireEvent.change(screen.getByLabelText(/Telepon/i), { target: { value: '08123456789' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'budi@samudra.com' } });
    fireEvent.change(screen.getByLabelText(/Tanggal lahir/i), { target: { value: '1990-01-01' } });
    fireEvent.change(screen.getByLabelText(/Tanggal bergabung/i), { target: { value: '2023-01-01' } });
    fireEvent.submit(screen.getByRole('form'));
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/employees');
    });
  });
}); 