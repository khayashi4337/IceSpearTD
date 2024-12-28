// WaveHandler.js

export class WaveHandler {
    constructor(gameService, skillService, gameUI) {
        this.gameService = gameService;
        this.skillService = skillService;
        this.gameUI = gameUI;
    }

    handleWaveClear() {
        this.gameService.waveManager.isWaveInProgress = false;
        this.gameService.gold += 150; // ウェーブクリアボーナス
        this.gameService.waveManager.incrementWave();
        this.gameService.updateGameState();
        
        console.log('ウェーブクリア、次のウェーブの準備中');

        this.skillService.enableSkillSelection();
        this.skillService.showSkillSelection();

        // スキル選択の処理
        this.skillService.onSkillSelected = (selectedSkill) => {
            console.log(`プレイヤーが新しいスキルを獲得しました: ${selectedSkill.name}`);
            
            // UI更新
            this.skillService.updateSkillDisplay();
            
            // スキル選択を無効化
            this.skillService.disableSkillSelection();
            
            // 次のウェーブの準備
            this.prepareNextWave();
        };
    }

    prepareNextWave() {
        console.log("次のウェーブの準備中...");
        // ここに次のウェーブの準備に必要な処理を追加
        // 例: 敵の強さを増加させる、新しい敵タイプを追加するなど
        
        // ウェーブ準備完了を通知
        if (this.onWavePrepared) {
            this.onWavePrepared();
        }
    }

    setEventHandlers({
        onWavePrepared
    }) {
        this.onWavePrepared = onWavePrepared;
    }
}
