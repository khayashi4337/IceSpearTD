// skillSet.js

export class SkillSet {
    constructor(id, name, description, themeColor, skills) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.themeColor = themeColor;
        this.skills = skills;
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
}