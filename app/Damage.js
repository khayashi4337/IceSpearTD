// Damage.js

/**
 * ダメージ表示を管理するクラス
 */
export class Damage {
    /**
     * @param {HTMLElement} gameBoard - ゲームボード要素
     */
    constructor(gameBoard) {
        this.gameBoard = gameBoard;
    }

    /**
     * ダメージを視覚的に表示する
     * @param {number} x - ダメージ表示のX座標
     * @param {number} y - ダメージ表示のY座標
     * @param {number} amount - ダメージ量
     */
    showDamage(x, y, amount) {
        const damageElement = document.createElement('div');
        damageElement.className = 'damage-text';
        damageElement.textContent = Math.round(amount);
        damageElement.style.left = `${x}px`;
        damageElement.style.top = `${y}px`;
        this.gameBoard.appendChild(damageElement);

        // アニメーション効果
        setTimeout(() => {
            damageElement.style.transform = 'translateY(-20px)';
            damageElement.style.opacity = '0';
        }, 50);

        // 要素を削除
        setTimeout(() => {
            this.gameBoard.removeChild(damageElement);
        }, 1000);
    }
}