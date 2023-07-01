import { Collisions } from './board';

export default class Brick {
  constructor(
    public x: number,
    public y: number,
    public readonly colorRgb: string,
    public readonly sideLength: number,
  ) {}

  collidesWith(bricks: Brick[]): Collisions {
    const collisions: Collisions = { bottom: false, left: false, right: false };

    for (const brick of bricks) {
      collisions.left ||=
        this.y === brick.y && this.x - this.sideLength === brick.x;
      collisions.right ||=
        this.y === brick.y && this.x + this.sideLength === brick.x;
      collisions.bottom ||=
        this.y === brick.y - this.sideLength && this.x === brick.x;
    }

    return collisions;
  }

  copy() {
    return new Brick(this.x, this.y, this.colorRgb, this.sideLength);
  }
}
