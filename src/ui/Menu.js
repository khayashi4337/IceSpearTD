export class Menu {
    constructor(game) {
        this.game = game;
        this.container = document.getElementById('ui-layer');
        this.setupElements();
    }

    setupElements() {
        this.menuDiv = document.createElement('div');
        this.menuDiv.className = 'ui-element menu';
        this.menuDiv.style.position = 'absolute';
        this.menuDiv.style.top = '0';
        this.menuDiv.style.left = '0';
        this.menuDiv.style.width = '100%';
        this.menuDiv.style.height = '100%';
        this.menuDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.menuDiv.style.display = 'flex';
        this.menuDiv.style.flexDirection = 'column';
        this.menuDiv.style.justifyContent = 'center';
        this.menuDiv.style.alignItems = 'center';
        this.menuDiv.style.color = 'white';
        this.menuDiv.style.zIndex = '100';

        const title = document.createElement('h1');
        title.textContent = 'Ice Spear Tower Defense';
        title.style.fontSize = '48px';
        title.style.marginBottom = '20px';
        title.style.color = '#00ffff';
        title.style.textShadow = '0 0 10px #00ffff';

        const startBtn = document.createElement('button');
        startBtn.textContent = 'Start Game';
        startBtn.style.padding = '15px 30px';
        startBtn.style.fontSize = '24px';
        startBtn.style.cursor = 'pointer';
        startBtn.style.backgroundColor = '#00aaaa';
        startBtn.style.border = 'none';
        startBtn.style.color = 'white';
        startBtn.style.borderRadius = '5px';

        startBtn.addEventListener('click', () => {
            this.hide();
            this.game.start();
        });

        this.menuDiv.appendChild(title);
        this.menuDiv.appendChild(startBtn);
        this.container.appendChild(this.menuDiv);
    }

    show() {
        this.menuDiv.style.display = 'flex';
    }

    hide() {
        this.menuDiv.style.display = 'none';
    }
}
