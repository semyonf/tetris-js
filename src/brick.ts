export default class Brick {
  constructor(
    public x: number,
    public y: number,
    public readonly colorRgb: string,
    public readonly sideLength: number,
  ) {}

  collidesWith(bricks: Brick[]): boolean {
    return bricks.some((brick) => brick.x === this.x && brick.y === this.y);
  }

  collidesWithBoundaries(boardWidth: number, boardHeight: number): boolean {
    return (
      this.x < 0 ||
      this.x > boardWidth - this.sideLength ||
      this.y > boardHeight - this.sideLength
    );
  }

  copy() {
    return new Brick(this.x, this.y, this.colorRgb, this.sideLength);
  }
}
