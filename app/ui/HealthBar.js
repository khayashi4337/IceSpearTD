// HealthBar.js
export class HealthBar {
    constructor(parent, maxHealth) {
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        
        // 体力バーのコンテナ
        this.container = document.createElement('div');
        this.container.className = 'health-bar';
        this.container.innerHTML = `
            <div class="health-bar-green" style="width: 100%"></div>
            <div class="health-bar-red" style="width: 0%"></div>
        `;
        
        parent.appendChild(this.container);
    }

    update(health) {
        this.currentHealth = Math.max(0, Math.min(health, this.maxHealth));
        const greenWidth = (100 * (this.currentHealth / this.maxHealth));
        const redWidth = 100 - greenWidth;
        
        this.container.querySelector('.health-bar-green').style.width = `${greenWidth}%`;
        this.container.querySelector('.health-bar-red').style.width = `${redWidth}%`;
    }

    remove() {
        if (this.container.parentElement) {
            this.container.remove();
        }
    }
}
