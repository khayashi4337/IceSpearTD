// services/SkillService.js

import { PlayerSkill } from '../skill/player-skill-class.js';
import { WaveClearSkillBox } from '../skill/wave-clear-skill-box-class.js';
import { SkillSetManager } from '../skill/skillSetManager.js';
import { 
    Skill,
    BasicSkill,
    TopSkill,
    TypeASkill,
    TypeBSkill
} from '../skill/skill-classes.js';

/**
 * スキル関連の機能を管理するサービスクラス
 */
export class SkillService {
    /**
     * SkillServiceのコンストラクタ
     */
    constructor() {
        this.playerSkills = null;
        this.waveClearSkillBox = null;
        this.skillSetManager = null;
        this.isSkillSelectionEnabled = false;
    }

    /**
     * スキルシステムを初期化する
     * @returns {Promise<void>}
     */
    async initialize() {
        console.log("スキルシステムを初期化しています...");

        this.skillSetManager = new SkillSetManager();
        await this.skillSetManager.initializeSkillSets();

        if (!this.skillSetManager) {
            throw new Error('skillSetManager is not initialized');
        }
        console.log("skillSetManager:", this.skillSetManager);

        this.playerSkills = new PlayerSkill();
        this.waveClearSkillBox = new WaveClearSkillBox(this.skillSetManager);

        console.log("スキルシステムの初期化が完了しました");
    }

    /**
     * スキル選択モーダルを表示する
     * @param {Event} [event] - イベントオブジェクト
     */
    showSkillSelection(event) {
        console.log("showSkillSelection called with:", event);

        if (event && event.preventDefault) {
            event.preventDefault();
        }

        if (!this.isSkillSelectionEnabled) {
            console.log("スキル選択は現在無効です");
            return;
        }

        console.log("スキル選択モーダルを表示します");
        document.getElementById('skill-selection-modal').style.display = 'block';

        console.log("playerSkills:", this.playerSkills);
        console.log("skillSetManager:", this.skillSetManager);
        
        this.waveClearSkillBox.generateSkillOptions(this.playerSkills, this.skillSetManager);
        const selectedSkills = this.waveClearSkillBox.selectRandomSkills(3);
        
        const skillOptions = document.getElementById('skill-selection-options');
        skillOptions.innerHTML = '';
        
        selectedSkills.toArray().forEach(skill => {
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
            skillOption.onclick = () => this.selectSkill(skill);
            skillOptions.appendChild(skillOption);
        });
        
        console.log("表示されたスキル:", selectedSkills.toArray().map(s => s.id));
    }

    /**
     * スキル選択モーダルを閉じる
     */
    closeSkillSelection() {
        console.log("スキル選択モーダルを閉じます");
        document.getElementById('skill-selection-modal').style.display = 'none';
    }

    /**
     * スキルを選択する
     * @param {Skill} skill - 選択されたスキル
     */
    selectSkill(skill) {
        console.log(`スキルが選択されました: ${skill.id}`);
        
        if (this.playerSkills.acquiredSkills.length < 5) {
            this.playerSkills.addSkill(skill);
            this.playerSkills.setActiveSkill(skill);
            this.updateSkillDisplay();
            this.closeSkillSelection();
            console.log("プレイヤーの現在のスキル:", this.playerSkills.getActiveSkills().map(s => s.id));
        } else {
            console.log("スキルの選択に失敗しました");
            console.log("理由: スキルの最大数に達しています");
            alert('スキルを選択できません。最大数に達しています。');
        }
    }

    /**
     * スキルデータを追加する
     * @param {Skill} skill - 追加するスキル
     */
    addSkillData(skill) {
        this.skillSetManager.addSkill(skill);
    }

    /**
     * スキルデータを取得する
     * @param {string} skillId - スキルID
     * @returns {Skill} スキルオブジェクト
     */
    getSkillData(skillId) {
        return this.skillSetManager.getSkill(skillId);
    }

    /**
     * スキル効果を適用する
     * @param {Array} towers - タワーの配列
     */
    applySkillEffects(towers) {
        console.log("スキル効果を適用します");
        this.playerSkills.getActiveSkills().forEach(skill => {
            console.log(`スキル ${skill.id} の効果を適用します`);
            skill.execute(towers);
        });
    }

    /**
     * プレイヤーのスキル表示を更新する
     */
    updateSkillDisplay() {
        console.log("スキル表示を更新します");
        const skillOptions = document.getElementById('skill-options');
        skillOptions.innerHTML = '';
        
        this.playerSkills.getActiveSkills().forEach(skill => {
            const skillIcon = document.createElement('div');
            skillIcon.className = 'skill-icon';
            
            const img = document.createElement('img');
            img.src = skill.thumbImgPath;
            img.alt = skill.name;
            
            skillIcon.appendChild(img);
            skillIcon.title = `${skill.name}`;
            skillOptions.appendChild(skillIcon);
        });
    }

    /**
     * プレイヤーのスキルを取得する
     * @returns {Array<Skill>} プレイヤーの現在のスキル配列
     */
    getPlayerSkills() {
        const activeSkills = this.playerSkills.getActiveSkills();
        console.log("プレイヤーのスキルを取得します:", activeSkills.map(s => s.id));
        return activeSkills;
    }

    /**
     * スキル選択を無効にする
     */
    disableSkillSelection() {
        this.isSkillSelectionEnabled = false;
        console.log("スキル選択が無効になりました");
    }

    /**
     * スキル選択を有効にする
     */
    enableSkillSelection() {
        this.isSkillSelectionEnabled = true;
        console.log("スキル選択が有効になりました");
    }
}