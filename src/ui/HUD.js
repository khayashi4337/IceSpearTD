export class HUD {
    constructor(game) {
        this.game = game;
        this.container = document.getElementById('ui-layer');
        this.setupElements();
        this.setupListeners();
    }

    setupElements() {
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

        this.updateDisplay();
        this.container.appendChild(this.hudDiv);
    }

    setupListeners() {
        this.game.economy.on('goldChanged', () => this.updateDisplay());
        this.game.economy.on('livesChanged', () => this.updateDisplay());
        // Poll for wave info in update loop or add event to WaveManager
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
    }

    update() {
        // Called every frame if needed, but event-based is better for static stats
        // For wave timer, we might want to update here
        this.updateDisplay();
    }
}
