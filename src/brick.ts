export default class Brick {
  constructor(
    public x: number,
    public y: number,
    public readonly colorRgb: string,
  ) {}

  collidesWith(bricks: Brick[]): boolean {
    return bricks.some((brick) => brick.x === this.x && brick.y === this.y);
  }

  collidesWithBoundaries(cols: number, rows: number): boolean {
    return this.x < 0 || this.x > cols - 1 || this.y > rows - 1;
  }

  copy() {
    return new Brick(this.x, this.y, this.colorRgb);
  }
}
