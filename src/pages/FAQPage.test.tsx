import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import FAQPage from './FAQPage';

test('renders the FAQ page with key sections', async () => {
  render(
    <BrowserRouter>
      <FAQPage />
    </BrowserRouter>
  );

  // Check for the main heading
  const heading = await screen.findByRole('heading', { name: /Frequently Asked Questions/i });
  expect(heading).toBeInTheDocument();

  // Check for at least one question
  const question = await screen.findByText(/What countries do you ship to\?/i);
  expect(question).toBeInTheDocument();
});
