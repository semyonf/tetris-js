import { Collisions, Sides, sides } from './board';

export default class Brick {
  public x: number;
  public y: number;
  public colorRgb: string;
  public sideLength: number;

  constructor(brick: Brick);
  constructor(x: number, y: number, rgb: string, size: number);
  constructor() {
    if (arguments.length === 1) {
      this._copyingConstructor.apply(this, arguments);
    } else {
      this._defaultConstructor.apply(this, arguments);
    }
  }

  collidesWithBricks(bricks: Brick[]): Collisions {
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

  private _defaultConstructor(
    xCoord: number,
    yCoord: number,
    colorRgb: string,
    sideLength: number,
  ) {
    this.x = xCoord;
    this.y = yCoord;
    this.colorRgb = colorRgb;
    this.sideLength = sideLength;
  }

  private _copyingConstructor(sourceBrick: Brick) {
    this.x = sourceBrick.x;
    this.y = sourceBrick.y;
    this.colorRgb = sourceBrick.colorRgb;
    this.sideLength = sourceBrick.sideLength;
  }
}
