import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DivisionForm from '../../../components/organisms/DivisionForm';

describe('DivisionForm', () => {
  it('renders form fields', () => {
    render(<DivisionForm />);
    expect(screen.getByLabelText(/Nama Divisi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kode Divisi/i)).toBeInTheDocument();
  });

  it('shows validation error when required fields are empty', async () => {
    render(<DivisionForm />);
    fireEvent.submit(screen.getByRole('form'));
    await waitFor(() => {
      expect(screen.getByText(/Kode divisi minimal/i)).toBeInTheDocument();
      expect(screen.getByText(/Nama divisi minimal/i)).toBeInTheDocument();
    });
  });

  it('can submit form with minimal valid data', async () => {
    const push = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push });
    render(<DivisionForm />);
    fireEvent.change(screen.getByLabelText(/Kode Divisi/i), { target: { value: 'DV01' } });
    fireEvent.change(screen.getByLabelText(/Nama Divisi/i), { target: { value: 'Divisi Test' } });
    fireEvent.submit(screen.getByRole('form'));
    await waitFor(() => {
      expect(push).toHaveBeenCalled();
    });
  });
}); 