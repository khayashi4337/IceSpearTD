/**
 * WaveManager クラス
 * 
 * このクラスは、ゲームの波（ウェーブ）に関連する全ての機能を管理します。
 * クラスを使用することで、関連する機能をグループ化し、コードの構造を改善します。
 * これにより、保守性が向上し、将来の機能追加や変更が容易になります。
 */
export class WaveManager {
    constructor(createEnemyFunc, showErrorFunc) {
        this.wave = 1;
        this.isWaveInProgress = false;
        this.waveEnemyCount = 0;
        this.totalEnemiesSpawned = 0;
        this.createEnemy = createEnemyFunc; 
        this.showError = showErrorFunc;
        console.log('WaveManager initialized'); // ログ追加
    }

    // ゲッターを使用して、計算されたプロパティを定義
    // これにより、プロパティにアクセスするたびに最新の値が計算されます
    get waveFactor() {
        return Math.min(this.wave, 10);
    }

    get waveEnemies() {
        return Math.min(this.wave + 1, 6);
    }

    /**
     * 新しい波を開始します。
     * この関数は波の進行状況を管理し、敵の生成を制御します。
     */
    startWave() {
        if (this.isWaveInProgress) {
            this.showError("Wave already in progress!");
            return;
        }
        this.isWaveInProgress = true;
        this.waveEnemyCount = (this.waveEnemies + 3) * (this.waveEnemies - 1);
        this.totalEnemiesSpawned = 0;

        console.log(`Starting wave ${this.wave} with ${this.waveEnemyCount} enemies`); // ログ追加

        let enemiesSpawned = 0;
        const spawnInterval = setInterval(() => {
            const types = ['goblin', 'orc', 'skeleton', 'slime'];
            const enemyType = types[Math.floor(Math.random() * types.length)];
            this.createEnemy(enemyType);
            enemiesSpawned++;
            console.log(`Spawned enemy ${enemiesSpawned}: ${enemyType}`); // ログ追加
            if (enemiesSpawned >= this.waveEnemyCount) {
                clearInterval(spawnInterval);
                console.log('All enemies for this wave have been spawned'); // ログ追加
            }
        }, (7000 + this.waveFactor * 1000) / ((this.waveEnemies + 3) * (this.waveEnemies - 1)));
    }

    /**
     * 波の数を増やします。
     * これは波がクリアされたときに呼び出されます。
     */
    incrementWave() {
        this.wave++;
        console.log(`Wave incremented to ${this.wave}`); // ログ追加
    }
}

export default WaveManager;