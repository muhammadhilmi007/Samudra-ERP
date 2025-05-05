/**
 * Unit tests for ItemStatusBadge component
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import ItemStatusBadge from '../components/ItemStatusBadge';
import { VERIFICATION_STATUS } from '../services/itemVerificationService';

describe('ItemStatusBadge', () => {
  it('renders pending status correctly', () => {
    const { getByText } = render(
      <ItemStatusBadge status={VERIFICATION_STATUS.PENDING} />
    );
    
    const statusText = getByText('Pending');
    expect(statusText).toBeTruthy();
  });
  
  it('renders verified status correctly', () => {
    const { getByText } = render(
      <ItemStatusBadge status={VERIFICATION_STATUS.VERIFIED} />
    );
    
    const statusText = getByText('Verified');
    expect(statusText).toBeTruthy();
  });
  
  it('renders rejected status correctly', () => {
    const { getByText } = render(
      <ItemStatusBadge status={VERIFICATION_STATUS.REJECTED} />
    );
    
    const statusText = getByText('Rejected');
    expect(statusText).toBeTruthy();
  });
  
  it('defaults to pending status when no status is provided', () => {
    const { getByText } = render(
      <ItemStatusBadge />
    );
    
    const statusText = getByText('Pending');
    expect(statusText).toBeTruthy();
  });
  
  it('defaults to pending status when an invalid status is provided', () => {
    const { getByText } = render(
      <ItemStatusBadge status="invalid_status" />
    );
    
    const statusText = getByText('Pending');
    expect(statusText).toBeTruthy();
  });
});
