import { render, screen } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import PrivateRoute from './PrivateRoute';

vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: null,
      loading: false,
      isStaff: false,
      isCustomer: false,
      staffLoading: false,
      customerLoading: false,
    }),
  };
});

test('redirects to customer login when not authenticated', async () => {
  render(
    <MemoryRouter initialEntries={['/customer/dashboard']}>
      <AuthProvider>
        <Routes>
          <Route
            path="/customer/dashboard"
            element={
              <PrivateRoute requireCustomer>
                <div>Customer Dashboard</div>
              </PrivateRoute>
            }
          />
          <Route path="/customer/login" element={<div>Customer Login</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

  expect(screen.getByText('Customer Login')).toBeInTheDocument();
});
