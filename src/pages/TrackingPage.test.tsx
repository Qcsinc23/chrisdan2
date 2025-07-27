import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import TrackingPage from './TrackingPage';

test('renders the tracking page with key sections', async () => {
  render(
    <BrowserRouter>
      <TrackingPage />
    </BrowserRouter>
  );

  // Check for the main heading
  const heading = await screen.findByRole('heading', { name: /Track Your Package/i });
  expect(heading).toBeInTheDocument();

  // Check for the tracking input
  const trackingInput = await screen.findByPlaceholderText('Enter your tracking number (e.g., CD123456789)');
  expect(trackingInput).toBeInTheDocument();
});
