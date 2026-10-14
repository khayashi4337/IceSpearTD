import { TICKS_PER_SECOND } from '@data/balance';

/** core の固定ステップ（GDD §11.2） */
export const FIXED_DT = 1 / TICKS_PER_SECOND;
export const secondsToTicks = (s: number): number => Math.round(s * TICKS_PER_SECOND);
