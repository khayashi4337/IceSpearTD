// skillSetInitialization.js

import { SkillSet } from './skillSet.js';
import { BasicSkill, TypeASkill, TypeBSkill, TopSkill } from './skill-classes.js';
import { SkillSetManager } from './skillSetManager.js';

// SkillSetManagerのインスタンス化
const skillSetManager = new SkillSetManager();

// SS_01: 基本氷結術
const ss01BasicSkill = new BasicSkill(
    'SK_BASIC_001',
    '氷の矢強化',
    '基本攻撃の威力を上げる',
    'img/skills/ice_arrow.png',
    'img/skills/ice_arrow_thumb.png',
    (towers, level) => {
        towers.forEach(tower => {
            if (tower.type === 'ice') {
                tower.damage *= (1 + 0.1 * level);
            }
        });
    },
    () => true,
    5
);

const ss01TypeASkill = new TypeASkill(
    'SK_TYPEA_001',
    '貫通氷槍',
    '敵を貫通する氷の槍',
    'img/skills/ice_spear.png',
    'img/skills/ice_spear_thumb.png',
    (towers, level) => {
        towers.forEach(tower => {
            if (tower.type === 'ice') {
                tower.penetration = level;
            }
        });
    },
    (playerLevel) => playerLevel >= 3,
    3
);

const ss01TypeBSkill = new TypeBSkill(
    'SK_TYPEB_001',
    '氷の結晶化',
    '敵を徐々に結晶化する',
    'img/skills/ice_crystal.png',
    'img/skills/ice_crystal_thumb.png',
    (towers, level) => {
        towers.forEach(tower => {
            if (tower.type === 'ice') {
                tower.crystalizationChance = 0.1 * level;
            }
        });
    },
    (playerLevel) => playerLevel >= 3,
    3
);

const ss01TopSkill = new TopSkill(
    'SK_TOP_001',
    '絶対零度',
    '極低温の攻撃で敵を瞬間凍結',
    'img/skills/absolute_zero.png',
    'img/skills/absolute_zero_thumb.png',
    (towers, level) => {
        towers.forEach(tower => {
            if (tower.type === 'ice') {
                tower.freezeChance = 0.05 * level;
            }
        });
    },
    (playerLevel) => playerLevel >= 5,
    5
);

const skillSetSS01 = new SkillSet(
    'SS_01',
    '基本氷結術',
    '氷の基本的な操作と攻撃を学ぶ',
    '#A0E6FF',
    [ss01BasicSkill, ss01TypeASkill, ss01TypeBSkill, ss01TopSkill]
);

// SS_02: 持続の霜
const ss02BasicSkill = new BasicSkill(
    'SK_BASIC_002',
    '凍結持続',
    '凍結効果の持続時間を延長',
    'img/skills/frost_duration.png',
    'img/skills/frost_duration_thumb.png',
    (towers, level) => {
        towers.forEach(tower => {
            if (tower.type === 'ice') {
                tower.freezeDuration *= (1 + 0.2 * level);
            }
        });
    },
    () => true,
    5
);

const ss02TypeASkill = new TypeASkill(
    'SK_TYPEA_002',
    '氷の分身',
    '氷の分身を作り出す',
    'img/skills/ice_clone.png',
    'img/skills/ice_clone_thumb.png',
    (towers, level) => {
        // 氷の分身の実装（例: 30秒間、分身が敵を攻撃）
    },
    (playerLevel) => playerLevel >= 3,
    3
);

const ss02TypeBSkill = new TypeBSkill(
    'SK_TYPEB_002',
    '凍てつく霧',
    '周囲に冷気の霧を発生',
    'img/skills/freezing_mist.png',
    'img/skills/freezing_mist_thumb.png',
    (towers, level) => {
        // 凍てつく霧の実装（例: 範囲内の敵の攻撃速度を低下）
    },
    (playerLevel) => playerLevel >= 3,
    3
);

const ss02TopSkill = new TopSkill(
    'SK_TOP_002',
    '氷河生成',
    'フィールドに氷河を生成',
    'img/skills/glacier_creation.png',
    'img/skills/glacier_creation_thumb.png',
    (towers, level) => {
        // 氷河生成の実装（例: 30秒間、敵の移動速度を50%低下）
    },
    (playerLevel) => playerLevel >= 5,
    5
);

const skillSetSS02 = new SkillSet(
    'SS_02',
    '持続の霜',
    '効果の持続性を高める氷魔法',
    '#E0FFFF',
    [ss02BasicSkill, ss02TypeASkill, ss02TypeBSkill, ss02TopSkill]
);

// SS_03: 氷の防壁
const ss03BasicSkill = new BasicSkill(
    'SK_BASIC_003',
    '氷の鎧',
    '防御力を上げる',
    'img/skills/ice_armor.png',
    'img/skills/ice_armor_thumb.png',
    (towers, level) => {
        towers.forEach(tower => {
            if (tower.type === 'ice') {
                tower.defense *= (1 + 0.1 * level);
            }
        });
    },
    () => true,
    5
);

const ss03TypeASkill = new TypeASkill(
    'SK_TYPEA_003',
    '氷結の連鎖',
    '凍結効果が連鎖する',
    'img/skills/frost_chain.png',
    'img/skills/frost_chain_thumb.png',
    (towers, level) => {
        // 氷結の連鎖の実装（例: 凍結した敵の周囲の敵も凍結）
    },
    (playerLevel) => playerLevel >= 3,
    3
);

const ss03TypeBSkill = new TypeBSkill(
    'SK_TYPEB_003',
    '氷の反射',
    '氷の鏡で攻撃を反射',
    'img/skills/ice_reflection.png',
    'img/skills/ice_reflection_thumb.png',
    (towers, level) => {
        // 氷の反射の実装（例: 20%の確率で敵の攻撃を反射）
    },
    (playerLevel) => playerLevel >= 3,
    3
);

const ss03TopSkill = new TopSkill(
    'SK_TOP_003',
    '雪嵐召喚',
    '広範囲に雪嵐を発生させる',
    'img/skills/blizzard_summon.png',
    'img/skills/blizzard_summon_thumb.png',
    (towers, level) => {
        // 雪嵐召喚の実装（例: 60秒間、範囲内の敵に持続ダメージ）
    },
    (playerLevel) => playerLevel >= 5,
    5
);

const skillSetSS03 = new SkillSet(
    'SS_03',
    '氷の防壁',
    '防御と反撃に特化した氷の技',
    '#87CEFA',
    [ss03BasicSkill, ss03TypeASkill, ss03TypeBSkill, ss03TopSkill]
);

// SkillSetManagerにスキルセットを追加
skillSetManager.addSkillSet(skillSetSS01);
skillSetManager.addSkillSet(skillSetSS02);
skillSetManager.addSkillSet(skillSetSS03);

export { skillSetManager };