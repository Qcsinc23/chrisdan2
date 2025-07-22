import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import CustomerRegisterPage from './CustomerRegisterPage';

test('renders the customer register page with key elements', async () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <CustomerRegisterPage />
      </AuthProvider>
    </BrowserRouter>
  );

  // Check for the main heading
  const heading = await screen.findByRole('heading', { name: /Create Customer Account/i });
  expect(heading).toBeInTheDocument();

  // Check for the email input
  const emailInput = await screen.findByLabelText(/Email address \*/i);
  expect(emailInput).toBeInTheDocument();

  // Check for the password input
  const passwordInput = await screen.findByLabelText(/^Password \*$/i);
  expect(passwordInput).toBeInTheDocument();

  // Check for the register button
  const registerButton = await screen.findByRole('button', { name: /Create Account/i });
  expect(registerButton).toBeInTheDocument();
});
