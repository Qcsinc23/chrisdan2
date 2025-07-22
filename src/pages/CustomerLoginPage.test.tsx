import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import CustomerLoginPage from './CustomerLoginPage';

test('renders the customer login page with key elements', async () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <CustomerLoginPage />
      </AuthProvider>
    </BrowserRouter>
  );

  // Check for the main heading
  const heading = await screen.findByRole('heading', { name: /Customer Portal/i });
  expect(heading).toBeInTheDocument();

  // Check for the email input
  const emailInput = await screen.findByLabelText(/Email address/i);
  expect(emailInput).toBeInTheDocument();

  // Check for the password input
  const passwordInput = await screen.findByLabelText(/Password/i);
  expect(passwordInput).toBeInTheDocument();

  // Check for the login button
  const loginButton = await screen.findByRole('button', { name: /Sign in/i });
  expect(loginButton).toBeInTheDocument();
});
