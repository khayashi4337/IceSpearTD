// skillSets/ss02.js
import { SkillSet } from '../../skillSet.js';
import { BasicSkill, TypeASkill, TypeBSkill, TopSkill } from '../../skill-classes.js';

const SS_02 = new SkillSet(
    'SS_02',
    '持続の霜',
    '効果の持続性を高める氷魔法',
    '#E0FFFF',
    [
        new BasicSkill(
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
        ),
        new TypeASkill(
            'SK_TYPEA_002',
            '氷の分身',
            '氷の分身を作り出す',
            'img/skills/ice_clone.png',
            'img/skills/ice_clone_thumb.png',
            (towers, level) => {
                // 実装は省略
            },
            //(playerLevel) => playerLevel >= 3,
            () => true,
            3
        ),
        new TypeBSkill(
            'SK_TYPEB_002',
            '凍てつく霧',
            '周囲に冷気の霧を発生',
            'img/skills/freezing_mist.png',
            'img/skills/freezing_mist_thumb.png',
            (towers, level) => {
                // 実装は省略
            },
            //(playerLevel) => playerLevel >= 3,
            () => true,
            3
        ),
        new TopSkill(
            'SK_TOP_002',
            '氷河生成',
            'フィールドに氷河を生成',
            'img/skills/glacier_creation.png',
            'img/skills/glacier_creation_thumb.png',
            (towers, level) => {
                // 実装は省略
            },
            //(playerLevel) => playerLevel >= 5,
            () => true,
            5
        )
    ]
);

export default SS_02;