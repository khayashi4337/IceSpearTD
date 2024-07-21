// skillList.js

/**
 * スキルのリストを管理するクラス
 * このクラスは、スキルの追加、確認、ランダム選択などの機能を提供します
 */
export class SkillList {
    /**
     * SkillListのコンストラクタ
     * 空のスキル配列で初期化します
     */
    constructor() {
        this.skills = [];
    }

    /**
     * スキルをリストに追加します
     * @param {Skill} skill - 追加するスキルオブジェクト
     */
    add(skill) {
        this.skills.push(skill);
    }

    /**
     * 指定されたスキルがリストに含まれているかチェックします
     * @param {Skill} skill - チェックするスキルオブジェクト
     * @returns {boolean} スキルが含まれている場合はtrue、そうでない場合はfalse
     */
    includes(skill) {
        return this.skills.some(s => s.id === skill.id);
    }

    /**
     * リストからランダムに指定された数のスキルを選択します
     * @param {number} count - 選択するスキルの数
     * @returns {SkillList} 選択されたスキルを含む新しいSkillListオブジェクト
     */
    randomChoice(count) {
        const shuffled = [...this.skills].sort(() => 0.5 - Math.random());
        return new SkillList().fromArray(shuffled.slice(0, count));
    }

    /**
     * 配列からSkillListオブジェクトを生成します
     * @param {Skill[]} array - スキルオブジェクトの配列
     * @returns {SkillList} 生成されたSkillListオブジェクト
     */
    fromArray(array) {
        this.skills = array;
        return this;
    }

    /**
     * SkillListの内容を配列として返します
     * @returns {Skill[]} スキルオブジェクトの配列
     */
    toArray() {
        return [...this.skills];
    }
}
