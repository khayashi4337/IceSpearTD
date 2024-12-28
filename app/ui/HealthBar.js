// HealthBar.js
export class HealthBar {
    constructor(parent, maxHealth) {
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        
        // 体力バーのコンテナ
        this.container = document.createElement('div');
        this.container.className = 'health-bar';
        
        // 緑色の体力バー（現在の体力）
        this.greenBar = document.createElement('div');
        this.greenBar.className = 'health-bar-green';
        
        // 赤色の体力バー（失った体力）
        this.redBar = document.createElement('div');
        this.redBar.className = 'health-bar-red';
        
        // DOMの構築
        this.container.appendChild(this.greenBar);
        this.container.appendChild(this.redBar);
        parent.appendChild(this.container);
        
        this.update(maxHealth);
    }

    update(health) {
        this.currentHealth = Math.max(0, Math.min(health, this.maxHealth));
        const totalWidth = 100;
        const greenWidth = (totalWidth * (this.currentHealth / this.maxHealth));
        const redWidth = totalWidth - greenWidth;
        
        this.greenBar.style.width = `${greenWidth}%`;
        this.redBar.style.width = `${redWidth}%`;
    }

    remove() {
        if (this.container.parentElement) {
            this.container.remove();
        }
    }
}
