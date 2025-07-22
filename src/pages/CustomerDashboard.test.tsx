import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import CustomerDashboard from './CustomerDashboard';

test('renders the customer dashboard with key elements', async () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <CustomerDashboard />
      </AuthProvider>
    </BrowserRouter>
  );

  // Check for the main heading
  const heading = await screen.findByRole('heading', { name: /Account Setup Required/i });
  expect(heading).toBeInTheDocument();
});
