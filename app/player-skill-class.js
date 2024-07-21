import { Skill, TypeASkill, TypeBSkill, TopSkill } from './skill-classes.js';

/**
 * プレイヤースキルクラス
 */
export class PlayerSkill {
    constructor() {
        this.acquiredSkills = [];
        this.activeSkills = [];
        console.log('PlayerSkill instance created');
    }

    /**
     * スキルを追加
     * @param {Skill} skill - 追加するスキル
     */
    addSkill(skill) {
        if (!this.acquiredSkills.some(s => s.id === skill.id)) {
            this.acquiredSkills.push(skill);
            console.log(`Skill added: ${skill.id}`);
        } else {
            console.log(`Skill ${skill.id} already acquired`);
        }
    }

    /**
     * スキルを削除
     * @param {Skill} skill - 削除するスキル
     */
    removeSkill(skill) {
        const index = this.acquiredSkills.findIndex(s => s.id === skill.id);
        if (index !== -1) {
            this.acquiredSkills.splice(index, 1);
            this.removeActiveSkill(skill);
            console.log(`Skill removed: ${skill.id}`);
        } else {
            console.log(`Skill ${skill.id} not found in acquired skills`);
        }
    }

    /**
     * アクティブなスキルを取得
     * @returns {Skill[]} アクティブなスキルのリスト
     */
    getActiveSkills() {
        return this.activeSkills;
    }

    /**
     * スキルをアクティブにする
     * @param {Skill} skill - アクティブにするスキル
     */
    setActiveSkill(skill) {
        if (this.activeSkills.length >= 5) {
            console.log('Cannot activate more than 5 skills');
            return;
        }

        if (skill instanceof TypeASkill || skill instanceof TypeBSkill) {
            // TypeAとTypeBは排他的
            const existingTypeAOrB = this.activeSkills.find(s => s instanceof TypeASkill || s instanceof TypeBSkill);
            if (existingTypeAOrB) {
                this.removeActiveSkill(existingTypeAOrB);
            }
        }

        if (!this.activeSkills.some(s => s.id === skill.id)) {
            this.activeSkills.push(skill);
            console.log(`Skill activated: ${skill.id}`);
        } else {
            console.log(`Skill ${skill.id} is already active`);
        }
    }

    /**
     * アクティブなスキルを削除
     * @param {Skill} skill - 削除するスキル
     */
    removeActiveSkill(skill) {
        const index = this.activeSkills.findIndex(s => s.id === skill.id);
        if (index !== -1) {
            this.activeSkills.splice(index, 1);
            console.log(`Active skill removed: ${skill.id}`);
        } else {
            console.log(`Skill ${skill.id} not found in active skills`);
        }
    }

    includes(skill) {
        return this.acquiredSkills.some(s => s.id === skill.id);
    }

    // 既存のスキルを取得するメソッド
    getAcquiredSkills() {
        return this.acquiredSkills;
    }
}