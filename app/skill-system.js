import { Skill, BasicSkill, TopSkill, TypeASkill, TypeBSkill } from './skill-classes.js';
import { PlayerSkill } from './player-skill-class.js';
import { WaveClearSkillBox } from './wave-clear-skill-box-class.js';

/**
 * スキルデータを格納するオブジェクト
 * @type {Object.<string, Skill>}
 */
let skillData = {};

/**
 * プレイヤーのスキルを管理するオブジェクト
 * @type {PlayerSkill}
 */
let playerSkill;

/**
 * Wave終了時のスキル選択を管理するオブジェクト
 * @type {WaveClearSkillBox}
 */
let waveClearSkillBox;


// プレイヤーの各スキルのレベルを記録するオブジェクト
let skillLevels = {};

/**
 * スキルシステムを初期化する関数
 */
export function initializeSkillSystem() {
    console.log("スキルシステムを初期化しています...");
    playerSkill = new PlayerSkill();
    waveClearSkillBox = new WaveClearSkillBox();
    initializeSkillData();
}

/**
 * スキルデータを初期化する関数
 */
function initializeSkillData() {
    console.log("スキルデータを初期化しています...");
    addSkillData(new BasicSkill(
        "SK_BASIC_001",
        "氷の矢強化",
        "氷のタワーの攻撃力を上昇させる",
        "img/skills/ice_arrow.png",
        "img/skills/ice_arrow_thumb.png",
        (towers, level) => {
            towers.forEach(tower => {
                if (tower.type === 'ice') {
                    tower.damage *= (1 + 0.1 * level);
                }
            });
        },
        () => true,
        5
    ));

    addSkillData(new TypeASkill(
        "SK_TYPEA_001",
        "貫通氷槍",
        "氷のタワーの攻撃が敵を貫通する",
        "img/skills/ice_spear.png",
        "img/skills/ice_spear_thumb.png",
        (towers, level) => {
            towers.forEach(tower => {
                if (tower.type === 'ice') {
                    tower.penetration = level;
                }
            });
        },
        (playerLevel) => playerLevel >= 5,
        3
    ));

    // 他のスキルも同様に追加...
    console.log("スキルデータの初期化が完了しました");
}

/**
 * 新しいスキルデータを追加する関数
 * @param {Skill} skill - スキルオブジェクト
 */
export function addSkillData(skill) {
    if (!(skill instanceof Skill)) {
        console.error(`Error: Invalid skill object provided for ${skill}`);
        return;
    }

    if (!skill.unlockCondition) {
        console.warn(`Warning: Skill ${skill.id} does not have an unlockCondition. Setting default.`);
        skill.unlockCondition = () => true;
    }

    skillData[skill.id] = skill;
    console.log(`新しいスキルが追加されました: ${skill.id}`);
    console.log('スキル詳細:', JSON.stringify(skill, (key, value) => 
        key === 'effect' || key === 'unlockCondition' ? value.toString() : value, 2)
    );
}

/**
 * スキル選択モーダルを表示する関数
 */
export function showSkillSelection() {
    console.log("スキル選択モーダルを表示します");
    document.getElementById('skill-selection-modal').style.display = 'block';
    
    waveClearSkillBox.generateSkillOptions(playerSkill);
    const selectedSkills = waveClearSkillBox.selectRandomSkills(3);
    
    const skillOptions = document.getElementById('skill-selection-options');
    skillOptions.innerHTML = ''; // 既存のオプションをクリア
    
    selectedSkills.forEach(skill => {
        const skillOption = document.createElement('div');
        skillOption.className = 'skill-option';
        skillOption.innerHTML = `
            <img src="${skill.imgPath}" alt="${skill.name}">
            <p>${skill.name}</p>
            <p>${skill.description}</p>
        `;
        skillOption.onclick = () => selectSkill(skill);
        skillOptions.appendChild(skillOption);
    });
    
    console.log("表示されたスキル:", selectedSkills.map(s => s.id));
}

/**
 * スキル選択モーダルを閉じる関数
 */
export function closeSkillSelection() {
    console.log("スキル選択モーダルを閉じます");
    document.getElementById('skill-selection-modal').style.display = 'none';
}

/**
 * スキルを選択する関数
 * @param {Skill} skill - 選択されたスキル
 */
function selectSkill(skill) {
    console.log(`スキルが選択されました: ${skill.id}`);
    
    if (playerSkill.acquiredSkills.length < 5 && skill.unlockCondition()) {
        playerSkill.addSkill(skill);
        playerSkill.setActiveSkill(skill);
        updateSkillDisplay();
        closeSkillSelection();
        console.log("プレイヤーの現在のスキル:", playerSkill.getActiveSkills().map(s => s.id));
    } else {
        console.log("スキルの選択に失敗しました");
        if (playerSkill.acquiredSkills.length >= 5) {
            console.log("理由: スキルの最大数に達しています");
        }
        if (!skill.unlockCondition()) {
            console.log("理由: このスキルはまだアンロックされていません");
        }
        alert('スキルを選択できません。');
    }
}



/**
 * スキル効果を適用する関数
 * @param {Array} towers - タワーの配列
 */
export function applySkillEffects(towers) {
    console.log("スキル効果を適用します");
    playerSkill.getActiveSkills().forEach(skill => {
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
    
    playerSkill.getActiveSkills().forEach(skill => {
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
    const activeSkills = playerSkill.getActiveSkills();
    console.log("プレイヤーのスキルを取得します:", activeSkills.map(s => s.id));
    return activeSkills;
}


// スキルデータをエクスポート
export { skillData };

export { 
    Skill, 
    BasicSkill, 
    TopSkill, 
    TypeASkill, 
    TypeBSkill
};