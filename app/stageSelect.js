function selectStage(stageNumber) {
    // ゲーム画面に遷移（ステージ番号をURLパラメータとして渡す）
    window.location.href = `t.html?stage=${stageNumber}`;
}

// ステージ画像が読み込めない場合のフォールバック処理
document.addEventListener('DOMContentLoaded', () => {
    const stageImages = document.querySelectorAll('.stage-image img');
    stageImages.forEach(img => {
        img.addEventListener('error', () => {
            img.style.backgroundColor = '#ccc';
        });
    });
});
