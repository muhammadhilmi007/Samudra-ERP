/**
 * Unit tests for StatusBadge component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusBadge from '@/components/atoms/tracking/StatusBadge';

describe('StatusBadge', () => {
  it('renders correctly with basic props', () => {
    render(<StatusBadge status="in_transit" />);
    
    const badge = screen.getByText('In Transit');
    expect(badge).toBeInTheDocument();
  });
  
  it('formats status correctly by replacing underscores with spaces and capitalizing', () => {
    render(<StatusBadge status="arrived_at_destination" />);
    
    const badge = screen.getByText('Arrived At Destination');
    expect(badge).toBeInTheDocument();
  });
  
  it('renders with tooltip when withTooltip is true and description is provided', () => {
    render(
      <StatusBadge 
        status="delayed" 
        withTooltip={true} 
        description="Delayed due to weather conditions" 
      />
    );
    
    const badge = screen.getByText('Delayed');
    expect(badge).toBeInTheDocument();
    // Note: Testing tooltip visibility would require additional testing for hover interactions
  });
  
  it('does not show tooltip when withTooltip is false', () => {
    const { container } = render(
      <StatusBadge 
        status="completed" 
        withTooltip={false} 
        description="This description should not appear in a tooltip" 
      />
    );
    
    const badge = screen.getByText('Completed');
    expect(badge).toBeInTheDocument();
    // Check that we don't have a tooltip component rendered
    expect(container.querySelector('[role="tooltip"]')).not.toBeInTheDocument();
  });
  
  it('applies the correct color classes based on status', () => {
    const { container } = render(<StatusBadge status="completed" />);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-800');
  });
  
  it('uses default color for unknown status', () => {
    const { container } = render(<StatusBadge status="unknown_status" />);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-gray-100');
    expect(badge).toHaveClass('text-gray-800');
  });
});
