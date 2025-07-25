import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import StaffLoginPage from './StaffLoginPage';

test('renders the staff login page with key elements', async () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <StaffLoginPage />
      </AuthProvider>
    </BrowserRouter>
  );

  // Check for the main heading
  const heading = await screen.findByRole('heading', { name: /Staff Login/i });
  expect(heading).toBeInTheDocument();

  // Check for the email input
  const emailInput = await screen.findByLabelText(/Email Address/i);
  expect(emailInput).toBeInTheDocument();

  // Check for the password input
  const passwordInput = await screen.findByLabelText(/Password/i);
  expect(passwordInput).toBeInTheDocument();

  // Check for the login button
  const loginButton = await screen.findByRole('button', { name: /Sign In/i });
  expect(loginButton).toBeInTheDocument();
});
