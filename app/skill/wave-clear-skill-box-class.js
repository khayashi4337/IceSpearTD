import { Skill } from './skill-classes.js';
import { SkillList } from './skillList.js';
import { PlayerSkill } from './player-skill-class.js';
import { skillSetManager } from './skillSetInitialization.js';

/**
 * Wave終了時のスキル選択を管理するクラス
 */
export class WaveClearSkillBox {
    constructor(skillSetManager) {
        console.log('WaveClearSkillBox constructor called with skillSetManager:', skillSetManager);
        if (!skillSetManager) {
            throw new Error('skillSetManager is required');
        }
        this.skillSetManager = skillSetManager;
        this.availableSkills = new SkillList();
        this.userSelectSkill = null;
    }

    /**
     * プレイヤーのスキルに基づいて、利用可能なスキルオプションを生成
     * @param {SkillList} playerSkills - プレイヤーの現在のスキル
     */
    generateSkillOptions(playerSkills) {
        console.log("generateSkillOptions called with:", playerSkills, skillSetManager);

        this.availableSkills = new SkillList();

        skillSetManager.getAllSkillSets().forEach(skillSet => {
            console.log("Processing skillSet:", skillSet);
            const availableSkillsFromSet = skillSet.getAvailableSkillList(playerSkills);
            availableSkillsFromSet.toArray().forEach(skill => this.availableSkills.add(skill));
        });

        console.log('Generated skill options:', this.availableSkills.toArray().map(s => s.id));
    }

    /**
     * ランダムにスキルを選択
     * @param {number} count - 選択するスキルの数
     * @returns {Skill[]} 選択されたスキルのリスト
     */
    selectRandomSkills(count) {
        const selectedSkills = this.availableSkills.randomChoice(count);
        console.log('Randomly selected skills:', selectedSkills.toArray().map(s => s.id));
        return selectedSkills;  // SkillList オブジェクトを返す
    }

    /**
     * ユーザーの選択を設定
     * @param {Skill} skill - 選択されたスキル
     */
    setUserSelection(skill) {
        this.userSelectSkill = skill;
        console.log(`User selected skill: ${skill.id}`);
    }

    /**
     * 選択されたスキルを適用
     * @param {PlayerSkill} playerSkill - プレイヤーのスキル情報
     */
    applySelectedSkill(playerSkill) {
        if (this.userSelectSkill) {
            playerSkill.setActiveSkill(this.userSelectSkill);
            console.log(`Applied selected skill: ${this.userSelectSkill.id}`);
            this.userSelectSkill = null; // 選択をリセット
        } else {
            console.log('No skill selected to apply');
        }
    }

    /**
     * 現在の選択状態をリセット
     */
    resetSelection() {
        this.userSelectSkill = null;
        console.log('Skill selection reset');
    }

    /**
     * 利用可能なスキルの数を取得
     * @returns {number} 利用可能なスキルの数
     */
    getAvailableSkillCount() {
        return this.availableSkills.length;
    }

    /**
     * 特定のタイプのスキルが選択可能かどうかを確認
     * @param {string} skillType - チェックするスキルタイプ
     * @returns {boolean} 選択可能な場合はtrue、そうでない場合はfalse
     */
    isSkillTypeAvailable(skillType) {
        return this.availableSkills.some(skill => skill.type === skillType);
    }
}