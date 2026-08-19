interface AppHeaderProps {
  progress: string;
  canGoBack: boolean;
  onBack: () => void;
}

export function AppHeader({ progress, canGoBack, onBack }: AppHeaderProps) {
  return (
    <header className="app-header">
      <strong className="brand">RE:VALUE</strong>
      <p className="progress-label" aria-label="분석 진행 단계">{progress}</p>
      {canGoBack && (
        <button type="button" className="button-text header-back" onClick={onBack}>
          이전
        </button>
      )}
    </header>
  );
}
