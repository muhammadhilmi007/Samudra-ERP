import { render, screen } from '@testing-library/react';
import OrganizationalChart, { OrgNode } from '../../../components/organisms/OrganizationalChart';

const mockData: OrgNode = {
  id: '1',
  name: 'CEO',
  children: [
    { id: '2', name: 'CTO', children: [{ id: '3', name: 'Dev Lead' }] },
    { id: '4', name: 'CFO' },
  ],
};

describe('OrganizationalChart', () => {
  it('renders root node and children', () => {
    render(<OrganizationalChart data={mockData} />);
    expect(screen.getByText('CEO')).toBeInTheDocument();
    expect(screen.getByText('CTO')).toBeInTheDocument();
    expect(screen.getByText('CFO')).toBeInTheDocument();
    expect(screen.getByText('Dev Lead')).toBeInTheDocument();
  });
}); 