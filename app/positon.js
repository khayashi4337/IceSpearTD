/**
 * Positionクラスはゲーム内の2次元座標を表現します。
 * 敵やタワーなどのゲームエンティティの位置を追跡するために使用されます。
 */
export class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
