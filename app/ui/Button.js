// Button.js
export class Button {
    constructor(elementId, options = {}) {
        this.element = document.getElementById(elementId);
        if (!this.element) {
            console.warn(`Button element with id '${elementId}' not found`);
            return;
        }

        this.isToggleable = options.isToggleable || false;
        this.isActive = false;
        this.onClick = options.onClick || (() => {});

        this.element.addEventListener('click', () => {
            if (this.isToggleable) {
                this.isActive = !this.isActive;
            }
            this.onClick(this.isActive);
        });
    }

    setActive(active) {
        this.isActive = active;
        // 必要に応じてボタンの見た目を更新する処理をここに追加
    }
}
