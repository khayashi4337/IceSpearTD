// EnemyState.js
export class EnemyState {
    constructor(duration, tickInterval = 1000) {
        this.duration = duration;
        this.remainingTime = duration;
        this.tickInterval = tickInterval;
        this.lastTickTime = Date.now();
    }

    /**
     * 状態を適用する
     * @param {Enemy} enemy - 対象の敵
     */
    apply(enemy) {
        // 継承先で実装
    }

    /**
     * 状態を更新する
     * @param {Enemy} enemy - 対象の敵
     * @param {number} deltaTime - 経過時間（ミリ秒）
     * @returns {boolean} 状態が終了したかどうか
     */
    update(enemy, deltaTime) {
        this.remainingTime -= deltaTime;

        // 一定間隔でティック効果を適用
        const currentTime = Date.now();
        if (currentTime - this.lastTickTime >= this.tickInterval) {
            this.onTick(enemy);
            this.lastTickTime = currentTime;
        }

        if (this.remainingTime <= 0) {
            this.remove(enemy);
            return true;
        }
        return false;
    }

    /**
     * 定期的に発生する効果
     * @param {Enemy} enemy - 対象の敵
     */
    onTick(enemy) {
        // 継承先で実装
    }

    /**
     * 状態を解除する
     * @param {Enemy} enemy - 対象の敵
     */
    remove(enemy) {
        // 継承先で実装
    }
}
