import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';

test('renders the home page with key sections', async () => {
  render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );

  // Check for the main heading
  const heading = await screen.findByRole('heading', { name: /Ship to the Caribbean & Central America/i });
  expect(heading).toBeInTheDocument();

  // Check for the "Why Choose Us?" section
  const whyChooseUs = await screen.findByRole('heading', { name: /Why Choose Chrisdan Enterprises\?/i });
  expect(whyChooseUs).toBeInTheDocument();

  // Check for the "Our Services" section
  const ourServices = await screen.findByRole('heading', { name: /Our Services/i });
  expect(ourServices).toBeInTheDocument();
});
