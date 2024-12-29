import { Health } from '../ui/Health.js';
import { Damage } from '../Damage.js';

export class Core {
    constructor(coreElement, coreContainer, healthDisplay) {
        this.core = coreElement;
        this.coreContainer = coreContainer;
        this.healthDisplay = healthDisplay;
        this.isDestroyed = false;

        // Healthクラスのインスタンスを作成
        this.health = new Health(100);
        // Damageクラスのインスタンスを作成
        this.damage = new Damage(coreContainer);

        // ヘルスバー表示
        this.coreContainer.appendChild(this.health.element);
    }

    updateHealthDisplay() {
        this.healthDisplay.textContent = `HP: ${this.health.getHealth()}/${this.health.getMaxHealth()}`;
    }

    takeDamage(amount) {
        if (this.isDestroyed) return; // 破壊状態ではダメージを受けない
        
        this.health.takeDamage(amount);
        this.updateHealthDisplay();

        // ダメージテキスト表示
        this.damage.showFloatingText(this.core.offsetLeft, this.core.offsetTop, amount, 'damage');

        // ダメージエフェクト
        this.core.classList.add('core-damage');
        setTimeout(() => {
            this.core.classList.remove('core-damage');
        }, 400);

        // クリティカル状態チェック
        if (this.health.isCritical()) {
            this.core.classList.add('core-health-critical');
        }

        // 破壊状態チェック
        if (this.health.isDead()) {
            this.setDestroyed(true);
        }
    }

    heal(amount) {
        if (this.isDestroyed) return; // 破壊状態では回復不可
        
        const actualHeal = this.health.heal(amount);
        
        if (actualHeal > 0) {
            this.damage.showFloatingText(this.core.offsetLeft, this.core.offsetTop, actualHeal, 'heal');
        }
        
        this.updateHealthDisplay();

        // クリティカル状態解除チェック
        if (!this.health.isCritical()) {
            this.core.classList.remove('core-health-critical');
        }
    }

    toggleCritical() {
        if (this.isDestroyed) return; // 破壊状態では切り替え不可
        
        if (this.core.classList.contains('core-health-critical')) {
            this.core.classList.remove('core-health-critical');
        } else {
            this.core.classList.add('core-health-critical');
        }
    }

    toggleDestroyed() {
        this.setDestroyed(!this.isDestroyed);
    }

    setDestroyed(destroyed) {
        this.isDestroyed = destroyed;
        if (destroyed) {
            this.health.takeDamage(this.health.getHealth());  // 現在のHPを全て失う
            this.core.classList.add('destroyed');
            this.core.classList.remove('core-health-critical', 'core-damage');
        } else {
            this.health.heal(1);  // 1だけ回復
            this.core.classList.remove('destroyed');
        }
        this.updateHealthDisplay();
    }

    resetHealth() {
        this.health.heal(this.health.getMaxHealth());  // 最大値まで回復
        this.updateHealthDisplay();
        this.core.classList.remove('core-health-critical', 'destroyed');
        this.isDestroyed = false;
    }
}
