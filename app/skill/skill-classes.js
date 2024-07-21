/**
 * スキルの基本クラス
 */
export class Skill {
    /**
     * @param {string} id - スキルの一意識別子
     * @param {string} name - スキルの名前
     * @param {string} description - スキルの説明
     * @param {string} imgPath - スキル画像のパス
     * @param {string} thumbImgPath - スキルサムネイル画像のパス
     * @param {Function} effect - スキルの効果を実装する関数
     * @param {Function} unlockCondition - スキルのアンロック条件を判定する関数
     * @param {number} maxLevel - スキルの最大レベル
     */
    constructor(id, name, description, imgPath, thumbImgPath, effect, unlockCondition, maxLevel) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.imgPath = imgPath;
        this.thumbImgPath = thumbImgPath;
        this.effect = effect;
        this.unlockCondition = unlockCondition;
        this.maxLevel = maxLevel;

        console.log(`Skill created: ${this.id} - ${this.name}`);
    }

    /**
     * スキルを実行する
     * @param {Array} towers - 影響を受けるタワーの配列
     * @param {number} level - スキルのレベル
     */
    execute(towers, level = 1) {
        console.log(`Executing Skill: ${this.name} at level ${level}`);
        this.effect(towers, level);
    }

    /**
     * スキル情報を文字列で返す
     * @returns {string} スキル情報
     */
    toString() {
        return `Skill: ${this.id} - ${this.name}`;
    }
}

/**
 * 基本スキルクラス
 */
export class BasicSkill extends Skill {
    constructor(id, name, description, imgPath, thumbImgPath, effect, unlockCondition, maxLevel) {
        super(id, name, description, imgPath, thumbImgPath, effect, unlockCondition, maxLevel);
        this.type = 'Basic';
    }
}

/**
 * 上位スキルクラス
 */
export class TopSkill extends Skill {
    constructor(id, name, description, imgPath, thumbImgPath, effect, unlockCondition, maxLevel) {
        super(id, name, description, imgPath, thumbImgPath, effect, unlockCondition, maxLevel);
        this.type = 'Top';
    }
}

/**
 * タイプAスキルクラス
 */
export class TypeASkill extends Skill {
    constructor(id, name, description, imgPath, thumbImgPath, effect, unlockCondition, maxLevel) {
        super(id, name, description, imgPath, thumbImgPath, effect, unlockCondition, maxLevel);
        this.type = 'TypeA';
    }
}

/**
 * タイプBスキルクラス
 */
export class TypeBSkill extends Skill {
    constructor(id, name, description, imgPath, thumbImgPath, effect, unlockCondition, maxLevel) {
        super(id, name, description, imgPath, thumbImgPath, effect, unlockCondition, maxLevel);
        this.type = 'TypeB';
    }
}