/**
 * スキルデータを格納するオブジェクト
 * @type {Object}
 */
let skillData = {
    SK_BASIC_001: {
        name: "氷の矢強化!",
        description: "基本攻撃の威力を上げるyo",
        imagePath: "img/skills/ice_arrow.png"
    },
    SK_TYPEA_001: {
        name: "貫通氷槍",
        description: "敵を貫通する氷の槍",
        imagePath: "img/skills/ice_spear.png"
    },
    SK_TYPEB_001: {
        name: "氷の結晶化",
        description: "敵を徐々に結晶化する",
        imagePath: "img/skills/ice_crystal.png"
    }
    // 他のスキルも同様に追加
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
    console.log("スキル選択モーダルを表示します");
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
                <p>${skillData[skillId].description}</p>
            `;
            skillOption.onclick = () => selectSkill(skillId);
            skillOptions.appendChild(skillOption);
        }
    }
    
    console.log("表示されたスキル:", selectedSkills);
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
 * @param {string} skillId - 選択されたスキルのID
 */
function selectSkill(skillId) {
    console.log(`スキルが選択されました: ${skillId}`);
    if (playerSkills.length < 5) { // 最大5つまでスキルを選択可能
        playerSkills.push(skillId);
        updateSkillDisplay();
        closeSkillSelection();
        console.log("プレイヤーの現在のスキル:", playerSkills);
    } else {
        console.log("スキルの最大数に達しています");
        alert('スキルの最大数に達しました。');
    }
}

/**
 * プレイヤーのスキル表示を更新する関数
 */
function updateSkillDisplay() {
    console.log("スキル表示を更新します");
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
    console.log("スキルシステムを初期化します");
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
    console.log(`新しいスキルを追加します: ${skillId}`);
    skillData[skillId] = { ...skillData[skillId], ...skillInfo };
}

export { skillData };