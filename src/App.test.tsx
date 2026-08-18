import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('identifies RE:VALUE as an evidence-based resource decision service', () => {
    render(<App />);

    expect(screen.getByText('RE:VALUE', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText(/근거 기반 자원 의사결정/)).toBeInTheDocument();
  });

  it('starts at the first of five evidence review steps', () => {
    render(<App />);

    expect(screen.getByText('1 / 5 · 사례 선택')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '실제 공개사례로 시작하기' })).toBeInTheDocument();
  });
});
