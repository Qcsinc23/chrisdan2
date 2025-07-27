import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AboutPage from './AboutPage';

test('renders the about page with key sections', async () => {
  render(
    <BrowserRouter>
      <AboutPage />
    </BrowserRouter>
  );

  // Check for the main heading
  const heading = await screen.findByRole('heading', { name: /About Chrisdan Enterprises/i });
  expect(heading).toBeInTheDocument();

  // Check for the "Our Story" section
  const ourStory = await screen.findByRole('heading', { name: /Our Story/i });
  expect(ourStory).toBeInTheDocument();

  // Check for the "Our Impact" section
  const ourImpact = await screen.findByRole('heading', { name: /Our Impact/i });
  expect(ourImpact).toBeInTheDocument();
});
