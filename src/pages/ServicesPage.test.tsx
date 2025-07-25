import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ServicesPage from './ServicesPage';

test('renders the services page with key sections', async () => {
  render(
    <BrowserRouter>
      <ServicesPage />
    </BrowserRouter>
  );

  // Check for the main heading
  const heading = await screen.findByRole('heading', { name: /Our Shipping Services/i });
  expect(heading).toBeInTheDocument();

  // Check for at least one service
  const service = await screen.findByRole('heading', { name: /Barrel Shipping/i });
  expect(service).toBeInTheDocument();
});
