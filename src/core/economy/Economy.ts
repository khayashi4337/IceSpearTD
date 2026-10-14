import { ECONOMY, TICKS_PER_SECOND } from '@data/balance';

/** 経済の計算（GDD §3.2, §3.3）。副作用なしの関数だけ置く */

/** ウェーブ開始時の利子：所持の5%、上限30 */
export function interestOf(gold: number): number {
  return Math.min(ECONOMY.interestCap, Math.floor(Math.max(0, gold) * ECONOMY.interestRate));
}

/** 売却額：総投資の60% */
export function refundOf(invested: number): number {
  return Math.floor(invested * ECONOMY.sellRatio);
}

/** 取消の条件：設置後10秒以内、かつまだ攻撃していない */
export function undoEligible(ticksSinceBuilt: number, hasFired: boolean): boolean {
  return !hasFired && ticksSinceBuilt <= Math.round(ECONOMY.undoSeconds * TICKS_PER_SECOND);
}

/** 前倒しボーナス：準備の残り秒 × 2 */
export function earlyCallBonus(prepLeftSeconds: number): number {
  return Math.floor(Math.max(0, prepLeftSeconds) * ECONOMY.earlyCallGoldPerSecond);
}
