import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PositionForm from '../../../components/organisms/PositionForm';

describe('PositionForm', () => {
  it('renders form fields', () => {
    render(<PositionForm />);
    expect(screen.getByLabelText(/Nama Posisi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kode Posisi/i)).toBeInTheDocument();
  });

  it('shows validation error when required fields are empty', async () => {
    render(<PositionForm />);
    fireEvent.submit(screen.getByRole('form'));
    await waitFor(() => {
      expect(screen.getByText(/Kode posisi minimal/i)).toBeInTheDocument();
      expect(screen.getByText(/Nama posisi minimal/i)).toBeInTheDocument();
    });
  });

  it('can submit form with minimal valid data', async () => {
    const push = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push });
    render(<PositionForm />);
    fireEvent.change(screen.getByLabelText(/Kode Posisi/i), { target: { value: 'PS01' } });
    fireEvent.change(screen.getByLabelText(/Nama Posisi/i), { target: { value: 'Posisi Test' } });
    fireEvent.submit(screen.getByRole('form'));
    await waitFor(() => {
      expect(push).toHaveBeenCalled();
    });
  });
}); 