import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ContactPage from './ContactPage';

test('renders the contact page with key sections', async () => {
  render(
    <BrowserRouter>
      <ContactPage />
    </BrowserRouter>
  );

  // Check for the main heading
  const heading = await screen.findByRole('heading', { name: /Contact Us/i });
  expect(heading).toBeInTheDocument();

  // Check for the "Call Us" section
  const callUs = await screen.findByRole('heading', { name: /Call Us/i });
  expect(callUs).toBeInTheDocument();

  // Check for the "Email Us" section
  const emailUs = await screen.findByRole('heading', { name: /Email Us/i });
  expect(emailUs).toBeInTheDocument();
});
