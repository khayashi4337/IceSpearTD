// skillSet.js
import { Skill, BasicSkill, TypeASkill, TypeBSkill, TopSkill } from './skill-classes.js';
import { SkillList } from './skillList.js';


export class SkillSet {
    /**
     * @param {string} id - スキルセットのID
     * @param {string} name - スキルセットの名前
     * @param {string} description - スキルセットの説明
     * @param {string} themeColor - スキルセットのテーマカラー
     * @param {Skill[]} skills - スキルの配列
     */
    constructor(id, name, description, themeColor, skills) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.themeColor = themeColor;
        this.skills = skills;

        // 各スキルタイプをメンバ変数として設定
        this.basicSkill = skills.find(skill => skill instanceof BasicSkill);
        this.typeASkill = skills.find(skill => skill instanceof TypeASkill);
        this.typeBSkill = skills.find(skill => skill instanceof TypeBSkill);
        this.topSkill = skills.find(skill => skill instanceof TopSkill);

        if (!this.basicSkill) {
            console.warn(`SkillSet ${this.id} does not have a BasicSkill`);
        }
    }

    /**
     * スキルセット内の特定のスキルを取得する
     * @param {string} skillId - スキルのID
     * @returns {Skill|undefined} - 指定されたIDのスキル、存在しない場合はundefined
     */
    getSkill(skillId) {
        return this.skills.find(skill => skill.id === skillId);
    }

    /**
     * スキルセット内の全てのスキルを取得する
     * @returns {Skill[]} - スキルの配列
     */
    getAllSkills() {
        return this.skills;
    }

    /**
     * プレイヤーの現在のスキルに基づいて、このスキルセットから取得可能なスキルのリストを返します
     * @param {SkillList} playerSkills - プレイヤーが現在所持しているスキルのリスト
     * @returns {SkillList} プレイヤーが取得可能なスキルのリスト
     */
    getAvailableSkillList(playerSkills) {
        const availableSkills = new SkillList();
        
        // 基本スキルがまだ獲得されていない場合、それを選択可能にする
        if (this.basicSkill && !playerSkills.includes(this.basicSkill)) {
            availableSkills.add(this.basicSkill);
        }

        const hasBasic = this.basicSkill && playerSkills.includes(this.basicSkill);
        const hasTypeA = this.typeASkill && playerSkills.includes(this.typeASkill);
        const hasTypeB = this.typeBSkill && playerSkills.includes(this.typeBSkill);
        
        // 基本スキルを持っている場合、TypeAとTypeBのスキルを選択可能にする
        // ただし、TypeAとTypeBは互いに排他的
        if (hasBasic) {
            if (!hasTypeA && !hasTypeB) {
                if (this.typeASkill) availableSkills.add(this.typeASkill);
                if (this.typeBSkill) availableSkills.add(this.typeBSkill);
            } else if (!hasTypeA && this.typeASkill) {
                availableSkills.add(this.typeASkill);
            } else if (!hasTypeB && this.typeBSkill) {
                availableSkills.add(this.typeBSkill);
            }
        }

        // TypeAまたはTypeBのスキルを持っている場合、Topスキルを選択可能にする
        if (this.topSkill && (hasTypeA || hasTypeB) && !playerSkills.includes(this.topSkill)) {
            availableSkills.add(this.topSkill);
        }

        return availableSkills;
    }
}