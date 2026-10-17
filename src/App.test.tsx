import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('renders initial loading state and resolves smoothly', async () => {
  render(<App />);
  expect(screen.getByText(/Cargando aplicación\.\.\./i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.queryByText(/Cargando aplicación\.\.\./i)).not.toBeInTheDocument();
  }, { timeout: 4000 });
});
