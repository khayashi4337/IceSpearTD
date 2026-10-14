import type { WaveStats } from './state';

/** ウェーブのスコア（GDD §7.2） */
export function waveScore(s: WaveStats): number {
  return s.kills * 10 + s.reactions * 50 + s.maxChain * 200 + (s.tookDamage ? 0 : 1000) + Math.floor(s.earlySeconds) * 20;
}

export type FireworkGrade = 'senko' | 'uchiage' | 'starmine' | 'niagara' | 'shakudama';

export const FIREWORK_GRADES: ReadonlyArray<{ grade: FireworkGrade; name: string; min: number }> = [
  { grade: 'senko', name: '線香花火', min: 0 },
  { grade: 'uchiage', name: '打ち上げ', min: 1000 },
  { grade: 'starmine', name: 'スターマイン', min: 3000 },
  { grade: 'niagara', name: 'ナイアガラ', min: 6000 },
  { grade: 'shakudama', name: '尺玉', min: 9000 },
];

/** スコア → 花火の格（GDD §7.2 の5段階） */
export function fireworkGrade(score: number): { grade: FireworkGrade; name: string } {
  let g = FIREWORK_GRADES[0] as (typeof FIREWORK_GRADES)[number];
  for (const x of FIREWORK_GRADES) if (score >= x.min) g = x;
  return { grade: g.grade, name: g.name };
}
