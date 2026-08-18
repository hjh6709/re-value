import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('identifies RE:VALUE as an evidence-based resource decision service', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'RE:VALUE' })).toBeInTheDocument();
    expect(screen.getByText(/근거 기반 자원 의사결정/)).toBeInTheDocument();
  });
});
