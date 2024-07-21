// skillSetManager.js

import { SkillSet } from './skillSet.js';
import { Skill } from './skill-classes.js';
import { SkillList } from './skillList.js';

export class SkillSetManager {
    constructor() {
        this.skillSets = new Map();
        this.skillData = new Map();
    }

    /**
     * スキルセットを追加する
     * @param {SkillSet} skillSet - 追加するスキルセット
     */
    addSkillSet(skillSet) {
        if (!(skillSet instanceof SkillSet)) {
            throw new Error('Invalid SkillSet object');
        }
        this.skillSets.set(skillSet.id, skillSet);
        skillSet.getAllSkills().forEach(skill => this.addSkill(skill));
        console.log(`SkillSet added: ${skillSet.id}`);
    }

    addSkill(skill) {
        if (!(skill instanceof Skill)) {
            throw new Error('Invalid Skill object');
        }
        this.skillData.set(skill.id, skill);
        console.log(`Skill added: ${skill.id}`);
    }    

    /**
     * スキルセットを取得する
     * @param {string} id - スキルセットのID
     * @returns {SkillSet|undefined} - 指定されたIDのスキルセット、存在しない場合はundefined
     */
    getSkillSet(id) {
        return this.skillSets.get(id);
    }

    /**
     * 全てのスキルセットを取得する
     * @returns {SkillSet[]} - 全てのスキルセットの配列
     */
    getAllSkillSets() {
        return Array.from(this.skillSets.values());
    }

    addSkill(skill) {
        if (!(skill instanceof Skill)) {
            throw new Error('Invalid Skill object');
        }
        this.skillData.set(skill.id, skill);
        console.log(`Skill added: ${skill.id}`);
    }

    getSkill(id) {
        return this.skillData.get(id);
    }

    getAllSkills() {
        return Array.from(this.skillData.values());
    }

    /**
     * スキルセットを初期化する
     * この関数は、全てのスキルセットファイルをインポートし、スキルセットを追加します
     */
    async initializeSkillSets() {
        try {
            const ss01 = await import('./skillSets/ss01.js');
            const ss02 = await import('./skillSets/ss02.js');
            const ss03 = await import('./skillSets/ss03.js');
            
            this.addSkillSet(ss01.default);
            this.addSkillSet(ss02.default);
            this.addSkillSet(ss03.default);

            // 他のスキルセットも同様にインポートし追加する
            console.log('All SkillSets initialized');
        } catch (error) {
            console.error('Error initializing SkillSets:', error);
        }
    }

    /**
     * プレイヤーの現在のスキルに基づいて、利用可能なスキルのリストを取得します
     * @param {SkillList} playerSkills - プレイヤーが現在所持しているスキルのリスト
     * @returns {SkillList} 利用可能なスキルのリスト
     */
    getAvailableSkills(playerSkills) {
        const availableSkills = new SkillList();
        this.skillSets.forEach(skillSet => {
            const availableSkillsFromSet = skillSet.getAvailableSkillList(playerSkills);
            availableSkillsFromSet.toArray().forEach(skill => availableSkills.add(skill));
        });
        return availableSkills;
    }
    
}