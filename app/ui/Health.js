// Health.js
export class Health {
    constructor(maxHealth) {
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        
        // 体力バーのコンテナ
        this.element = document.createElement('div');
        this.element.className = 'health-bar';
        this.element.innerHTML = `
            <div class="health-bar-green" style="width: 100%"></div>
            <div class="health-bar-red" style="width: 0%"></div>
        `;
    }

    /**
     * 現在の体力を取得
     * @returns {number} 現在の体力
     */
    getHealth() {
        return this.currentHealth;
    }

    /**
     * 最大体力を取得
     * @returns {number} 最大体力
     */
    getMaxHealth() {
        return this.maxHealth;
    }

    /**
     * 体力の割合を取得（パーセント）
     * @returns {number} 体力の割合（0-100）
     */
    getHealthPercent() {
        return (this.currentHealth / this.maxHealth) * 100;
    }

    /**
     * 死亡判定
     * @returns {boolean} 体力が0以下ならtrue
     */
    isDead() {
        return this.currentHealth <= 0;
    }

    /**
     * ダメージを受ける
     * @param {number} damage - ダメージ量
     * @returns {number} 実際に受けたダメージ量
     */
    takeDamage(damage) {
        const oldHealth = this.currentHealth;
        this.currentHealth = Math.max(0, this.currentHealth - damage);
        this.updateHealthBar();
        return oldHealth - this.currentHealth;
    }

    /**
     * 体力を回復する
     * @param {number} amount - 回復量
     */
    heal(amount) {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        this.updateHealthBar();
    }

    /**
     * 体力バーを更新
     */
    updateHealthBar() {
        const healthPercent = this.getHealthPercent();
        const greenBar = this.element.querySelector('.health-bar-green');
        const redBar = this.element.querySelector('.health-bar-red');
        
        if (greenBar && redBar) {
            greenBar.style.width = `${healthPercent}%`;
            redBar.style.width = `${100 - healthPercent}%`;
        }
    }

    /**
     * 体力バーを削除
     */
    remove() {
        if (this.element.parentElement) {
            this.element.remove();
        }
    }
}
