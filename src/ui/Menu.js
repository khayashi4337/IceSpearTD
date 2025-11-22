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

        // Stage Selection Container
        const stageContainer = document.createElement('div');
        stageContainer.style.display = 'flex';
        stageContainer.style.gap = '20px';

        // Stage 1 Button
        const stage1Btn = document.createElement('button');
        stage1Btn.textContent = 'Stage 1';
        stage1Btn.style.padding = '15px 30px';
        stage1Btn.style.fontSize = '24px';
        stage1Btn.style.cursor = 'pointer';
        stage1Btn.style.backgroundColor = '#00aaaa';
        stage1Btn.style.border = 'none';
        stage1Btn.style.color = 'white';
        stage1Btn.style.borderRadius = '5px';

        stage1Btn.addEventListener('click', () => {
            this.hide();
            this.game.start();
        });

        stageContainer.appendChild(stage1Btn);

        this.menuDiv.appendChild(title);
        this.menuDiv.appendChild(stageContainer);
        this.container.appendChild(this.menuDiv);
    }

    show() {
        this.menuDiv.style.display = 'flex';
    }

    hide() {
        this.menuDiv.style.display = 'none';
    }
}
