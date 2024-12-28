// EnemyFactory.js
import { Goblin } from './Goblin.js';
import { Orc } from './Orc.js';
import { Skeleton } from './Skeleton.js';
import { Slime } from './Slime.js';

export class EnemyFactory {
    static enemyTypes = {
        goblin: Goblin,
        orc: Orc,
        skeleton: Skeleton,
        slime: Slime
    };

    /**
     * 敵を作成する
     * @param {string} type - 敵の種類
     * @returns {IEnemy} 作成された敵のインスタンス
     */
    static createEnemy(type) {
        const EnemyClass = this.enemyTypes[type];
        if (!EnemyClass) {
            throw new Error(`Unknown enemy type: ${type}`);
        }
        
        const enemy = new EnemyClass();
        
        // スライムの場合、分裂時のコールバックを設定
        if (type === 'slime') {
            enemy.setOnSplit(() => {
                return [
                    Slime.createSmallSlime(),
                    Slime.createSmallSlime()
                ];
            });
        }
        
        return enemy;
    }
}
