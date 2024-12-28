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
        this.x = 0;
        this.y = 0;
    }

    /**
     * テキスト要素の位置を設定する
     * @param {HTMLElement} element - 位置を設定する要素
     * @param {boolean} [addRandomOffset=false] - ランダムなオフセットを追加するかどうか
     */
    setTextPosition(element, addRandomOffset = false) {
        let x = this.x;
        let y = this.y;
        
        if (addRandomOffset) {
            x += Math.random() * 40 - 20;
            y += Math.random() * 40 - 20;
        }
        
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
    }

    /**
     * 浮動テキストを表示する
     * @param {number} x - テキスト表示のX座標
     * @param {number} y - テキスト表示のY座標
     * @param {number} amount - 数値
     * @param {string} type - テキストタイプ ('damage' または 'heal')
     */
    showFloatingText(x, y, amount, type = 'damage') {
        this.x = x;
        this.y = y;
        const text = document.createElement('div');
        text.className = `damage-text ${type}`;
        text.textContent = type === 'damage' ? `-${Math.round(amount)}` : `+${Math.round(amount)}`;
        
        this.setTextPosition(text, true);
        this.gameBoard.appendChild(text);
        
        // アニメーション終了後に要素を削除
        setTimeout(() => {
            text.remove();
        }, 1000);
    }

    /**
     * ダメージを視覚的に表示する
     * @param {number} x - ダメージ表示のX座標
     * @param {number} y - ダメージ表示のY座標
     * @param {number} amount - ダメージ量
     */
    showDamage(x, y, amount) {
        this.showFloatingText(x, y, amount, 'damage');
    }
}