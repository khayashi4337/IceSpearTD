// skillSets/ss01.js
import { SkillSet } from '../../skillSet.js';
import { BasicSkill, TypeASkill, TypeBSkill, TopSkill } from '../../skill-classes.js';

const SS_01 = new SkillSet(
    'SS_01',
    '基本氷結術',
    '氷の基本的な操作と攻撃を学ぶ',
    '#A0E6FF',
    [
        new BasicSkill(
            'SK_BASIC_001',
            '氷の矢強化',
            '氷のタワーの攻撃力を上昇させる',
            'skill/skillSets/ss01/ice_arrow.png',
            'skill/skillSets/ss01/ice_arrow_thumb.png',
            (towers, level) => {
                towers.forEach(tower => {
                    if (tower.type === 'ice') {
                        tower.damage *= (1 + 0.1 * level);
                    }
                });
            },
            () => true,
            5
        ),
        new TypeASkill(
            'SK_TYPEA_001',
            '貫通氷槍',
            '敵を貫通する氷の槍',
            'skill/skillSets/ss01/ice_spear.png',
            'skill/skillSets/ss01/ice_spear_thumb.png',
            (towers, level) => {
                towers.forEach(tower => {
                    if (tower.type === 'ice') {
                        tower.penetration = level;
                    }
                });
            },
            (playerLevel) => playerLevel >= 3,
            3
        ),
        new TypeBSkill(
            'SK_TYPEB_001',
            '氷の結晶化',
            '敵を徐々に結晶化する',
            'skill/skillSets/ss01/ice_crystal.png',
            'skill/skillSets/ss01/ice_crystal_thumb.png',
            (towers, level) => {
                towers.forEach(tower => {
                    if (tower.type === 'ice') {
                        tower.crystalizationChance = 0.1 * level;
                    }
                });
            },
            (playerLevel) => playerLevel >= 3,
            3
        ),
        new TopSkill(
            'SK_TOP_001',
            '絶対零度',
            '極低温の攻撃で敵を瞬間凍結',
            'skill/skillSets/ss01/absolute_zero.png',
            'skill/skillSets/ss01/absolute_zero_thumb.png',
            (towers, level) => {
                towers.forEach(tower => {
                    if (tower.type === 'ice') {
                        tower.freezeChance = 0.05 * level;
                    }
                });
            },
            (playerLevel) => playerLevel >= 5,
            5
        )
    ]
);

export default SS_01;