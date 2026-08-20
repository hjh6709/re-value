import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const assetUrls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
const misplacedAssets = assetUrls.filter(
  (url) => url.startsWith('/assets/') || url === '/vite.svg',
);

if (misplacedAssets.length > 0) {
  throw new Error(
    `GitHub Pages 하위 경로를 벗어난 자산이 있습니다: ${misplacedAssets.join(', ')}`,
  );
}

if (!assetUrls.some((url) => url.startsWith('/re-value/'))) {
  throw new Error('GitHub Pages용 /re-value/ 자산 경로를 찾지 못했습니다.');
}

console.log('GitHub Pages 자산 경로 확인 완료: /re-value/');
