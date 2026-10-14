/** タグ ID（GDD §5.1 の14種）。効果の定義はタスク07で tags.ts に置く */
export type TagId =
  | 'size'
  | 'rapid'
  | 'recharge'
  | 'drain'
  | 'blast'
  | 'burn'
  | 'poison'
  | 'freeze'
  | 'range'
  | 'multi'
  | 'shield'
  | 'shatter'
  | 'crystalize'
  | 'chain';

export const TAG_IDS: readonly TagId[] = [
  'size', 'rapid', 'recharge', 'drain', 'blast', 'burn', 'poison', 'freeze', 'range', 'multi', 'shield', 'shatter', 'crystalize', 'chain',
];
