// Slime.js
import { IEnemy } from './IEnemy.js';

export class Slime extends IEnemy {
    constructor() {
        super();
        this.type = 'slime';
        this.name = 'スライム';
        this.description = '分裂する粘性の敵。倒すと2体の小さいスライムに分裂する。';
        
        // 戦闘ステータス
        this.maxHealth = 120;
        this.health = this.maxHealth;
        this.baseSpeed = 0.006;
        this.speed = this.baseSpeed;
        this.defense = 4;
        this.goldReward = 15;
        this.size = 'large'; // large, small
        
        // 視覚設定
        this.sprite = {
            color: '#00FF7F',     // スプリンググリーン
            size: this.size === 'large' ? 22 : 15,
            shape: 'slime'
        };

        // エフェクト管理
        this.effects = new Set();
        this.statusIcon = null;
        this.effectTimers = new Map();

        // HTML要素の初期化
        this.initializeElement();
    }

    // HTML要素の初期化
    initializeElement() {
        // メイン要素
        this.element = document.createElement('div');
        this.element.className = 'enemy';
        
        // 本体要素
        const body = document.createElement('div');
        body.className = 'enemy-body';
        body.style.backgroundColor = this.sprite.color;
        body.style.width = this.sprite.size + 'px';
        body.style.height = this.sprite.size + 'px';
        
        this.element.appendChild(body);
    }

    // ダメージを受けた時の処理
    takeDamage(damage) {
        if (!this.isAlive) return;
        
        super.takeDamage(damage);
        this.showDamageNumber(damage);
        this.updateHealthBar();
        
        // ダメージエフェクト
        this.element.classList.add('damaged');
        setTimeout(() => {
            this.element.classList.remove('damaged');
        }, 300);

        if (this.health <= 0) {
            this.die();
        }
    }

    // 体力バーの更新
    updateHealthBar() {
        const healthPercent = (this.health / this.maxHealth) * 100;
        const greenBar = this.element.querySelector('.health-bar-green');
        const redBar = this.element.querySelector('.health-bar-red');
        
        if (greenBar && redBar) {
            greenBar.style.width = `${healthPercent}%`;
            redBar.style.width = `${100 - healthPercent}%`;
        }
    }

    // ダメージ数値の表示
    showDamageNumber(damage) {
        const damageElem = document.createElement('div');
        damageElem.className = 'damage-number';
        damageElem.textContent = damage;
        
        const rect = this.element.getBoundingClientRect();
        damageElem.style.left = rect.left + rect.width / 2 + 'px';
        damageElem.style.top = rect.top + 'px';
        
        document.body.appendChild(damageElem);
        setTimeout(() => damageElem.remove(), 1000);
    }

    // 状態異常の適用
    applyEffect(effectType, duration = 3000) {
        this.removeEffect(effectType);
        this.effects.add(effectType);
        this.element.classList.add(effectType);
        
        // エフェクトに応じたアイコンを表示
        switch(effectType) {
            case 'burned':
                this.addStatusIcon('burn', '🔥');
                // 一定間隔でダメージを与える
                const burnTimer = setInterval(() => {
                    if (this.isAlive) {
                        this.takeDamage(3);
                    }
                }, 500);
                this.effectTimers.set('burned', burnTimer);
                break;
            case 'poisoned':
                this.addStatusIcon('poison', '☠');
                const poisonTimer = setInterval(() => {
                    if (this.isAlive) {
                        this.takeDamage(2);
                    }
                }, 1000);
                this.effectTimers.set('poisoned', poisonTimer);
                break;
            case 'frozen':
                this.addStatusIcon('freeze', '❄');
                this.speed = this.baseSpeed * 0.5;
                break;
            case 'weakened':
                this.addStatusIcon('weak', '↓');
                this.defense *= 0.7;
                break;
        }

        // 一定時間後にエフェクトを解除
        setTimeout(() => {
            this.removeEffect(effectType);
        }, duration);
    }

    // 状態異常の解除
    removeEffect(effectType) {
        if (this.effects.has(effectType)) {
            this.effects.delete(effectType);
            this.element.classList.remove(effectType);
            
            // タイマーの解除
            if (this.effectTimers.has(effectType)) {
                clearInterval(this.effectTimers.get(effectType));
                this.effectTimers.delete(effectType);
            }

            // エフェクト固有の解除処理
            switch(effectType) {
                case 'frozen':
                    this.speed = this.baseSpeed;
                    break;
                case 'weakened':
                    this.defense = this.defense / 0.7;
                    break;
            }

            // 状態アイコンの更新
            this.updateStatusIcon();
        }
    }

    // 全ての状態異常を解除
    removeAllEffects() {
        for (const effect of this.effects) {
            this.removeEffect(effect);
        }
    }

    // 状態アイコンの追加
    addStatusIcon(type, symbol) {
        // 既存のアイコンを削除
        this.removeStatusIcon();
        
        const icon = document.createElement('div');
        icon.className = `status-icon ${type}`;
        icon.textContent = symbol;
        this.element.appendChild(icon);
        this.statusIcon = icon;
    }

    // 状態アイコンの削除
    removeStatusIcon() {
        if (this.statusIcon && this.statusIcon.parentElement) {
            this.statusIcon.remove();
            this.statusIcon = null;
        }
    }

    // 状態アイコンの更新（最新の状態を表示）
    updateStatusIcon() {
        if (this.effects.size === 0) {
            this.removeStatusIcon();
            return;
        }

        // 優先順位の高い状態を表示
        const effectPriority = ['burned', 'poisoned', 'frozen', 'weakened'];
        for (const effect of effectPriority) {
            if (this.effects.has(effect)) {
                switch(effect) {
                    case 'burned':
                        this.addStatusIcon('burn', '🔥');
                        break;
                    case 'poisoned':
                        this.addStatusIcon('poison', '☠');
                        break;
                    case 'frozen':
                        this.addStatusIcon('freeze', '❄');
                        break;
                    case 'weakened':
                        this.addStatusIcon('weak', '↓');
                        break;
                }
                break;
            }
        }
    }

    die() {
        if (!this.isAlive) return;
        
        // エフェクトをすべて解除
        this.removeAllEffects();
        
        // 死亡エフェクトを表示
        this.element.classList.add('dying');
        this.createSplashEffect();

        // フェードアウトとパーティクルエフェクトの完了を待つ
        setTimeout(() => {
            // 要素を非表示にする
            this.element.style.display = 'none';
            
            super.die();
            
            // 大きいスライムの場合、2体の小さいスライムに分裂
            if (this.size === 'large' && this.onSplit) {
                // 元の要素を削除してから分裂
                if (this.element.parentElement) {
                    this.element.remove();
                }
                this.onSplit();
            }
        }, 500); // パーティクルエフェクトの完了を待つため、時間を500msに延長
    }

    createSplashEffect() {
        const particleCount = 16;
        const container = this.element.parentElement;
        const slimeRect = this.element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const centerX = slimeRect.left - containerRect.left + slimeRect.width / 2;
        const centerY = slimeRect.top - containerRect.top + slimeRect.height / 2;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'splash-particle';
            particle.style.backgroundColor = this.sprite.color;
            
            // パーティクルの初期位置を設定
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;

            // パーティクルが飛び散る方向をランダムに設定
            const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.2;
            const distance = 60 + Math.random() * 40;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            
            // アニメーションを適用（少しランダム性を持たせる）
            const duration = 0.4 + Math.random() * 0.2;
            particle.style.animation = `splashParticle ${duration}s ease-out forwards`;
            
            container.appendChild(particle);
            
            // アニメーション終了後にパーティクルを削除
            setTimeout(() => {
                if (particle.parentElement) {
                    particle.remove();
                }
            }, duration * 1000);
        }
    }

    // スライムが分裂した時のコールバックを設定
    setOnSplit(callback) {
        this.onSplit = callback;
    }

    // 小さいスライムを生成するファクトリメソッド
    static createSmallSlime() {
        const slime = new Slime();
        slime.size = 'small';
        slime.maxHealth = 40;
        slime.health = slime.maxHealth;
        slime.speed = 0.008; // 小さいスライムは少し速い
        slime.goldReward = 8;
        slime.sprite.size = 15;
        return slime;
    }
}
