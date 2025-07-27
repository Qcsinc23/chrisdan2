import { render, screen } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import StaffDashboard from './StaffDashboard';
import { useAuth } from '@/contexts/AuthContext';

vi.mock('@/lib/supabase');
vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { email: 'staff@test.com' },
      isStaff: true,
      staffLoading: false,
    }),
  };
});

vi.mock('@/components/DashboardStats', () => ({
  default: () => <div>DashboardStats</div>,
}));

vi.mock('@/components/ShipmentsList', () => ({
  default: () => <div>ShipmentsList</div>,
}));

vi.mock('@/components/DeliveryManager', () => ({
  default: () => <div>DeliveryManager</div>,
}));

test('renders the staff dashboard with key elements', async () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <StaffDashboard />
      </AuthProvider>
    </BrowserRouter>
  );

  // Check for the main heading
  const heading = await screen.findByRole('heading', { name: /Staff Dashboard/i });
  expect(heading).toBeInTheDocument();
});
