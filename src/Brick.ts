export default class Brick {
  public x: number;
  public y: number;
  public rgb: string;
  public size: number;

  constructor(brick: Brick);
  constructor(x: number, y: number, rgb: string, size: number);
  constructor() {
    if (arguments.length === 1) {
      this._copyingConstructor.apply(this, arguments);
    } else {
      this._defaultConstructor.apply(this, arguments);
    }
  }

  private _defaultConstructor(x: number, y: number, rgb: string, size: number) {
    this.x = x;
    this.y = y;
    this.rgb = rgb;
    this.size = size;
  }

  private _copyingConstructor(sourceBrick: Brick) {
    this.x = sourceBrick.x;
    this.y = sourceBrick.y;
    this.rgb = sourceBrick.rgb;
    this.size = sourceBrick.size;
  }
}
