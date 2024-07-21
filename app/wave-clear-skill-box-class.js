import { Skill } from './skill-classes.js';
import { PlayerSkill } from './player-skill-class.js';

/**
 * Wave終了時のスキル選択を管理するクラス
 */
export class WaveClearSkillBox {
    constructor() {
        this.availableSkills = [];
        this.userSelectSkill = null;
        console.log('WaveClearSkillBox instance created');
    }

    /**
     * プレイヤーのスキルに基づいてスキルオプションを生成
     * @param {PlayerSkill} playerSkill - プレイヤーのスキル情報
     */
    generateSkillOptions(playerSkill) {
        this.availableSkills = playerSkill.acquiredSkills.filter(skill => !playerSkill.activeSkills.includes(skill));
        console.log('Generated skill options:', this.availableSkills.map(s => s.id));
    }

    /**
     * ランダムにスキルを選択
     * @param {number} count - 選択するスキルの数
     * @returns {Skill[]} 選択されたスキルのリスト
     */
    selectRandomSkills(count) {
        const selectedSkills = [];
        const availableSkillsCopy = [...this.availableSkills];

        for (let i = 0; i < count && availableSkillsCopy.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableSkillsCopy.length);
            const selectedSkill = availableSkillsCopy.splice(randomIndex, 1)[0];
            selectedSkills.push(selectedSkill);
        }

        console.log('Randomly selected skills:', selectedSkills.map(s => s.id));
        return selectedSkills;
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