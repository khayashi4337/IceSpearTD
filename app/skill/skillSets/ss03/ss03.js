// skillSets/ss03.js
import { SkillSet } from '../../skillSet.js';
import { BasicSkill, TypeASkill, TypeBSkill, TopSkill } from '../../skill-classes.js';

const SS_03 = new SkillSet(
    'SS_03',
    '氷の防壁',
    '防御と反撃に特化した氷の技',
    '#87CEFA',
    [
        new BasicSkill(
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
        ),
        new TypeASkill(
            'SK_TYPEA_003',
            '氷結の連鎖',
            '凍結効果が連鎖する',
            'img/skills/frost_chain.png',
            'img/skills/frost_chain_thumb.png',
            (towers, level) => {
                // 実装は省略
            },
            //(playerLevel) => playerLevel >= 3,
            () => true,
            3
        ),
        new TypeBSkill(
            'SK_TYPEB_003',
            '氷の反射',
            '氷の鏡で攻撃を反射',
            'img/skills/ice_reflection.png',
            'img/skills/ice_reflection_thumb.png',
            (towers, level) => {
                // 実装は省略
            },
            //(playerLevel) => playerLevel >= 3,
            () => true,
            3
        ),
        new TopSkill(
            'SK_TOP_003',
            '雪嵐召喚',
            '広範囲に雪嵐を発生させる',
            'img/skills/blizzard_summon.png',
            'img/skills/blizzard_summon_thumb.png',
            (towers, level) => {
                // 実装は省略
            },
            //(playerLevel) => playerLevel >= 5,
            () => true,
            5
        )
    ]
);

export default SS_03;