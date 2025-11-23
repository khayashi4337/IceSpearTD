export class HUD {
    constructor(game) {
        this.game = game;
        this.container = document.getElementById('ui-layer');
        this.setupElements();
        this.setupListeners();
    }

    setupElements() {
        // Top HUD
        this.hudDiv = document.createElement('div');
        this.hudDiv.className = 'ui-element hud';
        this.hudDiv.style.position = 'absolute';
        this.hudDiv.style.top = '10px';
        this.hudDiv.style.left = '10px';
        this.hudDiv.style.padding = '10px';
        this.hudDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.hudDiv.style.color = 'white';
        this.hudDiv.style.fontFamily = 'monospace';
        this.hudDiv.style.fontSize = '18px';
        this.hudDiv.style.borderRadius = '5px';

        this.container.appendChild(this.hudDiv);

        // Tower Selector
        this.createTowerSelector();

        this.updateDisplay();
    }

    createTowerSelector() {
        this.selectorDiv = document.createElement('div');
        this.selectorDiv.className = 'ui-element tower-selector';

        const towers = [
            { name: 'Ice Spear', cost: 50, key: '1', iconClass: 'icon-spear' },
            { name: 'Ice Crystal', cost: 80, key: '2', iconClass: 'icon-crystal' },
            { name: 'Glacier', cost: 120, key: '3', iconClass: 'icon-glacier' }
        ];

        this.towerCards = [];

        towers.forEach((t, index) => {
            const card = document.createElement('div');
            card.className = 'tower-card';
            card.onclick = () => {
                this.game.selectedTowerType = index;
                this.updateSelection();
            };

            const key = document.createElement('div');
            key.className = 'tower-key';
            key.textContent = t.key;

            const icon = document.createElement('div');
            icon.className = `tower-icon ${t.iconClass}`;

            const name = document.createElement('div');
            name.className = 'tower-name';
            name.textContent = t.name;

            const cost = document.createElement('div');
            cost.className = 'tower-cost';
            cost.textContent = `$${t.cost}`;

            card.appendChild(key);
            card.appendChild(icon);
            card.appendChild(name);
            card.appendChild(cost);

            this.selectorDiv.appendChild(card);
            this.towerCards.push(card);
        });

        this.container.appendChild(this.selectorDiv);
    }

    setupListeners() {
        this.game.economy.on('goldChanged', () => this.updateDisplay());
        this.game.economy.on('livesChanged', () => this.updateDisplay());
    }

    updateDisplay() {
        const gold = this.game.economy.gold;
        const lives = this.game.economy.lives;
        const wave = this.game.waveManager.currentWaveIndex + 1;

        this.hudDiv.innerHTML = `
      <div>Gold: <span style="color: gold">${gold}</span></div>
      <div>Lives: <span style="color: red">${lives}</span></div>
      <div>Wave: ${wave}</div>
    `;

        this.updateSelection();
    }

    updateSelection() {
        const selected = this.game.selectedTowerType;
        this.towerCards.forEach((card, index) => {
            if (index === selected) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }

            // Optional: Dim if can't afford
            // const cost = ...
        });
    }

    update() {
        this.updateDisplay();
    }
}
