/**
 * スキルデータを格納するオブジェクト
 * @type {Object}
 */
const skillData = {
    // スキルデータをここに追加します
};

/**
 * プレイヤーの現在のスキルを格納する配列
 * @type {Array}
 */
let playerSkills = [];

/**
 * スキル選択モーダルを表示する関数
 * @returns {void}
 */
export function showSkillSelection() {
    // モーダルを表示するロジックをここに実装します
    document.getElementById('skill-selection-modal').style.display = 'block';
    
    // ランダムに3つのスキルを選択して表示
    const skillOptions = document.getElementById('skill-selection-options');
    skillOptions.innerHTML = ''; // 既存のオプションをクリア
    
    const availableSkills = Object.keys(skillData);
    const selectedSkills = [];
    
    for (let i = 0; i < 3; i++) {
        if (availableSkills.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableSkills.length);
            const skillId = availableSkills.splice(randomIndex, 1)[0];
            selectedSkills.push(skillId);
            
            const skillOption = document.createElement('div');
            skillOption.className = 'skill-option';
            skillOption.innerHTML = `
                <img src="${skillData[skillId].imagePath}" alt="${skillData[skillId].name}">
                <p>${skillData[skillId].name}</p>
            `;
            skillOption.onclick = () => selectSkill(skillId);
            skillOptions.appendChild(skillOption);
        }
    }
}

/**
 * スキル選択モーダルを閉じる関数
 * @returns {void}
 */
export function closeSkillSelection() {
    document.getElementById('skill-selection-modal').style.display = 'none';
}

/**
 * スキルを選択する関数
 * @param {string} skillId - 選択されたスキルのID
 * @returns {void}
 */
function selectSkill(skillId) {
    if (playerSkills.length < 5) { // 最大5つまでスキルを選択可能
        playerSkills.push(skillId);
        updateSkillDisplay();
        closeSkillSelection();
    } else {
        alert('スキルの最大数に達しました。');
    }
}

/**
 * プレイヤーのスキル表示を更新する関数
 * @returns {void}
 */
function updateSkillDisplay() {
    const skillOptions = document.getElementById('skill-options');
    skillOptions.innerHTML = ''; // 既存の表示をクリア
    
    playerSkills.forEach(skillId => {
        const skillIcon = document.createElement('div');
        skillIcon.className = 'skill-icon';
        skillIcon.style.backgroundImage = `url(${skillData[skillId].imagePath})`;
        skillIcon.title = skillData[skillId].name;
        skillOptions.appendChild(skillIcon);
    });
}

/**
 * スキルシステムを初期化する関数
 * @returns {void}
 */
export function initializeSkillSystem() {
    updateSkillDisplay();
}

/**
 * プレイヤーのスキルを取得する関数
 * @returns {Array} プレイヤーの現在のスキル配列
 */
export function getPlayerSkills() {
    return [...playerSkills];
}

/**
 * 新しいスキルをスキルデータに追加する関数
 * @param {string} skillId - スキルのID
 * @param {Object} skillInfo - スキルの情報
 * @returns {void}
 */
export function addSkillData(skillId, skillInfo) {
    skillData[skillId] = skillInfo;
}