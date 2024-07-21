import { PlayerSkill } from './player-skill-class.js';
import { WaveClearSkillBox } from './wave-clear-skill-box-class.js';
import { SkillSetManager } from './skillSetManager.js';
import { 
    Skill,
    BasicSkill,
    TopSkill,
    TypeASkill,
    TypeBSkill
} from './skill-classes.js';

let playerSkills;
let waveClearSkillBox;
let skillSetManager;
let isSkillSelectionEnabled = false;

/**
 * スキルシステムを初期化する関数
 */
async function initializeSkillSystem() {
    console.log("スキルシステムを初期化しています...");

    skillSetManager = new SkillSetManager();
    await skillSetManager.initializeSkillSets();

    // skillSetManager が正しく初期化されていることを確認
    if (!skillSetManager) {
        throw new Error('skillSetManager is not initialized');
    }
    console.log("skillSetManager:", skillSetManager);

    playerSkills = new PlayerSkill();

    // WaveClearSkillBox のインスタンス化時に skillSetManager を渡す
    waveClearSkillBox = new WaveClearSkillBox(skillSetManager);

    console.log("スキルシステムの初期化が完了しました");
}

/**
 * スキル選択モーダルを表示する関数
 */
function showSkillSelection(event) {
    console.log("showSkillSelection called with:", event);  // 追加

    // イベントオブジェクトが渡された場合は、デフォルトの動作を防止
    if (event && event.preventDefault) {
        event.preventDefault();
    }

    // すぐスキル選択のデバッグするためコメントアウト
    // if (!isSkillSelectionEnabled) {
    //     console.log("スキル選択は現在無効です");
    //     return;
    // }

    console.log("スキル選択モーダルを表示します");
    document.getElementById('skill-selection-modal').style.display = 'block';

    console.log("playerSkills:", playerSkills);
    console.log("skillSetManager:", skillSetManager);
    
    waveClearSkillBox.generateSkillOptions(playerSkills, skillSetManager);
    const selectedSkills = waveClearSkillBox.selectRandomSkills(3); // 3つのスキルを選択
    
    const skillOptions = document.getElementById('skill-selection-options');
    skillOptions.innerHTML = '';
    
    selectedSkills.toArray().forEach(skill => {  // ここを変更
        const skillOption = document.createElement('div');
        skillOption.className = 'skill-option';
        skillOption.innerHTML = `
            <div class="skill-image-container">
                <img src="${skill.imgPath}" alt="${skill.name}">
            </div>
            <div class="skill-info">
                <h3>${skill.name}</h3>
                <p>${skill.description}</p>
                <p class="skill-type">タイプ: ${skill.type}</p>
            </div>
        `;
        skillOption.onclick = () => selectSkill(skill);
        skillOptions.appendChild(skillOption);
    });
    
    console.log("表示されたスキル:", selectedSkills.map(s => s.id));
}


/**
 * スキル選択モーダルを閉じる関数
 */
function closeSkillSelection() {
    console.log("スキル選択モーダルを閉じます");
    document.getElementById('skill-selection-modal').style.display = 'none';
}

/**
 * スキルを選択する関数
 * @param {Skill} skill - 選択されたスキル
 */
function selectSkill(skill) {
    console.log(`スキルが選択されました: ${skill.id}`);
    
    if (playerSkills.acquiredSkills.length < 5 && skill.unlockCondition()) {
        playerSkills.addSkill(skill);
        playerSkills.setActiveSkill(skill);
        updateSkillDisplay();
        closeSkillSelection();
        console.log("プレイヤーの現在のスキル:", playerSkills.getActiveSkills().map(s => s.id));
    } else {
        console.log("スキルの選択に失敗しました");
        if (playerSkills.acquiredSkills.length >= 5) {
            console.log("理由: スキルの最大数に達しています");
        }
        if (!skill.unlockCondition()) {
            console.log("理由: このスキルはまだアンロックされていません");
        }
        alert('スキルを選択できません。');
    }
}

export function addSkillData(skill) {
    skillSetManager.addSkill(skill);
}

export function getSkillData(skillId) {
    return skillSetManager.getSkill(skillId);
}

/**
 * スキル効果を適用する関数
 * @param {Array} towers - タワーの配列
 */
export function applySkillEffects(towers) {
    console.log("スキル効果を適用します");
    playerSkills.getActiveSkills().forEach(skill => {
        console.log(`スキル ${skill.id} の効果を適用します`);
        skill.execute(towers);
    });
}
/**
 * プレイヤーのスキル表示を更新する関数
 */
function updateSkillDisplay() {
    console.log("スキル表示を更新します");
    const skillOptions = document.getElementById('skill-options');
    skillOptions.innerHTML = ''; // 既存の表示をクリア
    
    playerSkills.getActiveSkills().forEach(skill => {
        const skillIcon = document.createElement('div');
        skillIcon.className = 'skill-icon';
        skillIcon.style.backgroundImage = `url(${skill.thumbImgPath})`;
        skillIcon.title = `${skill.name}`;
        skillOptions.appendChild(skillIcon);
    });
}

/**
 * プレイヤーのスキルを取得する関数
 * @returns {Array<Skill>} プレイヤーの現在のスキル配列
 */
export function getPlayerSkills() {
    const activeSkills = playerSkills.getActiveSkills();
    console.log("プレイヤーのスキルを取得します:", activeSkills.map(s => s.id));
    return activeSkills;
}

/**
 * スキル選択を無効にする関数
 * この関数は、スキル選択を無効にする必要がある時（例：ゲーム開始時）に呼び出される
 */
function disableSkillSelection() {
    isSkillSelectionEnabled = false;
    console.log("スキル選択が無効になりました");
}

/**
 * スキル選択を有効にする関数
 * この関数は、スキル選択が可能になるタイミング（例：ウェーブクリア時）で呼び出される
 */
function enableSkillSelection() {
    isSkillSelectionEnabled = true;
    console.log("スキル選択が有効になりました");
}

export {
    playerSkills,
    waveClearSkillBox,
    skillSetManager,
    initializeSkillSystem,
    showSkillSelection,
    closeSkillSelection,
    enableSkillSelection,
    disableSkillSelection
};

