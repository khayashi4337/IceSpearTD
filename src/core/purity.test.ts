import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * core 層の純粋性を強制するテスト（GDD §11.2）。
 * - Phaser / DOM / ブラウザ API を参照しない
 * - Math.random を使わない（シード付き Rng を使う）
 * - game/ 層を import しない
 */
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.ts') && !p.endsWith('.test.ts') ? [p] : [];
  });
}

const FORBIDDEN: Array<[RegExp, string]> = [
  [/from\s+['"]phaser['"]/, 'phaser の import'],
  [/\bwindow\./, 'window'],
  [/\bdocument\./, 'document'],
  [/\blocalStorage\b/, 'localStorage'],
  [/Math\.random\s*\(/, 'Math.random（Rng を使う）'],
  [/from\s+['"](\.\.\/)+game\//, 'game 層の import'],
  [/from\s+['"]@game\//, 'game 層の import'],
  [/\bperformance\.now\s*\(/, 'performance.now（core は固定ステップ）'],
  [/\bDate\.now\s*\(/, 'Date.now（core は固定ステップ）'],
];

describe('core は純粋', () => {
  const files = [...walk(join(__dirname)), ...walk(join(__dirname, '..', 'data'))];
  it('対象ファイルがある', () => expect(files.length).toBeGreaterThan(0));
  for (const f of files) {
    it(f.replace(/.*src[\\/]/, 'src/'), () => {
      const src = readFileSync(f, 'utf8');
      for (const [re, label] of FORBIDDEN) expect(re.test(src), `${label} を使っている`).toBe(false);
    });
  }
});
