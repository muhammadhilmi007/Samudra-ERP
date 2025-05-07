import { render, screen, fireEvent } from '@testing-library/react';
import EmployeeDocumentManager from '../../../components/organisms/EmployeeDocumentManager';

describe('EmployeeDocumentManager', () => {
  const documents = [
    {
      id: 'doc1',
      type: 'ktp' as const,
      number: '1234567890',
      issuedDate: new Date('2020-01-01'),
      issuedBy: 'Dukcapil',
      status: 'active' as const,
      documentUrl: 'https://example.com/ktp.pdf',
    },
  ];

  it('renders document list', () => {
    render(
      <EmployeeDocumentManager
        employeeId="1"
        documents={documents}
        onAddDocument={jest.fn()}
        onDeleteDocument={jest.fn()}
      />
    );
    expect(screen.getByText(/ktp/i)).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
  });

  it('calls onDeleteDocument when delete button is clicked', () => {
    const onDeleteDocument = jest.fn();
    render(
      <EmployeeDocumentManager
        employeeId="1"
        documents={documents}
        onAddDocument={jest.fn()}
        onDeleteDocument={onDeleteDocument}
      />
    );
    fireEvent.click(screen.getByLabelText(/Hapus Dokumen/i));
    expect(onDeleteDocument).toHaveBeenCalledWith('doc1');
  });
}); 