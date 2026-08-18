import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../App';

async function reachResolutionScreen() {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: '현대모비스 진천 PBT 사례 분석' }));
  await user.click(screen.getByRole('button', { name: '자원 정보 분석' }));
}

describe('primary resource flow', () => {
  it('starts the official Hyundai PBT case from the primary action', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '현대모비스 진천 PBT 사례 분석' }));

    expect(screen.getByRole('heading', { name: '공정부산물 정보' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('PBT 외장 플라스틱')).toBeInTheDocument();
    expect(screen.getByText('한국환경공단 순환자원정보센터 공개자료 기반')).toBeInTheDocument();
  });

  it('shows provenance and validation as separate labels after resolution', async () => {
    await reachResolutionScreen();

    expect(await screen.findByRole('heading', { name: '자원 정체성 확인' })).toBeInTheDocument();
    expect(screen.getAllByText('Official Source').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Confirmed').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Unknown').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Needs Validation').length).toBeGreaterThan(0);
  });
});
