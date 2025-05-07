import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BranchForm from '../../../components/organisms/BranchForm';

describe('BranchForm', () => {
  it('renders form fields', () => {
    render(<BranchForm />);
    expect(screen.getByLabelText(/Nama Cabang/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kode Cabang/i)).toBeInTheDocument();
  });

  it('shows validation error when required fields are empty', async () => {
    render(<BranchForm />);
    fireEvent.submit(screen.getByRole('form'));
    await waitFor(() => {
      expect(screen.getByText(/Kode cabang minimal 2 karakter/i)).toBeInTheDocument();
      expect(screen.getByText(/Nama cabang minimal 3 karakter/i)).toBeInTheDocument();
    });
  });

  // Test submit with minimal valid data (mocking router.push)
  it('can submit form with minimal valid data', async () => {
    const push = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push });
    render(<BranchForm />);
    fireEvent.change(screen.getByLabelText(/Kode Cabang/i), { target: { value: 'CB01' } });
    fireEvent.change(screen.getByLabelText(/Nama Cabang/i), { target: { value: 'Cabang Test' } });
    fireEvent.change(screen.getByLabelText(/Jalan/i), { target: { value: 'Jl. Test' } });
    fireEvent.change(screen.getByLabelText(/Kota/i), { target: { value: 'Jakarta' } });
    fireEvent.change(screen.getByLabelText(/Provinsi/i), { target: { value: 'DKI' } });
    fireEvent.change(screen.getByLabelText(/Kode Pos/i), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText(/Telepon/i), { target: { value: '08123456789' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@cabang.com' } });
    // Pilih status
    fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: 'active' } });
    fireEvent.submit(screen.getByRole('form'));
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/branches');
    });
  });
}); 