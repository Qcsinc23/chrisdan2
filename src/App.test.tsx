import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from '@/contexts/AuthContext';

test('renders the main application component', async () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
  const linkElements = await screen.findAllByText(/Chrisdan Enterprises/i);
  expect(linkElements.length).toBeGreaterThan(0);
});
