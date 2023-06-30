import Brick from '../brick';
import ParkMiller from 'park-miller';
import { Collisions, Sides, sides } from '../board';

const shapeColors: {
  name: string;
  rgb: `rgb(${number},${number},${number})`;
}[] = [
  { name: 'orange', rgb: 'rgb(239,108,0)' },
  { name: 'red', rgb: 'rgb(211,47,47)' },
  { name: 'green', rgb: 'rgb(76,175,80)' },
  { name: 'blue', rgb: 'rgb(33,150,243)' },
  { name: 'yellow', rgb: 'rgb(255,235,59)' },
  { name: 'cyan', rgb: 'rgb(0,188,212)' },
  { name: 'pink', rgb: 'rgb(233,30,99)' },
  { name: 'white', rgb: 'rgb(224,224,224)' },
];

const shapeOrientations: Array<{ angle: number; matrix: number[][] }> = [
  {
    angle: 0,
    matrix: [
      [1, 0],
      [0, 1],
    ],
  },
  {
    angle: 90,
    matrix: [
      [0, -1],
      [1, 0],
    ],
  },
  {
    angle: 180,
    matrix: [
      [-1, 0],
      [0, -1],
    ],
  },
  {
    angle: 270,
    matrix: [
      [0, 1],
      [-1, 0],
    ],
  },
];

const shapeTypes: Array<{
  name: string;
  radiallySymmetrical: boolean;
  matrix: number[][];
}> = [
  {
    name: 'I',
    radiallySymmetrical: false,
    matrix: [
      [0, -1],
      [0, 1],
      [0, 2],
    ],
  },
  {
    name: 'O',
    radiallySymmetrical: true,
    matrix: [
      [0, 1],
      [1, 0],
      [1, 1],
    ],
  },
  {
    name: 'Z',
    radiallySymmetrical: false,
    matrix: [
      [0, -1],
      [-1, 0],
      [1, -1],
    ],
  },
  {
    name: 'S',
    radiallySymmetrical: false,
    matrix: [
      [-1, -1],
      [0, -1],
      [1, 0],
    ],
  },
  {
    name: 'T',
    radiallySymmetrical: false,
    matrix: [
      [1, 0],
      [-1, 0],
      [0, 1],
    ],
  },
  {
    name: 'J',
    radiallySymmetrical: false,
    matrix: [
      [1, 0],
      [-1, 0],
      [-1, 1],
    ],
  },
  {
    name: 'L',
    radiallySymmetrical: false,
    matrix: [
      [1, 0],
      [-1, 0],
      [-1, -1],
    ],
  },
];

export default class Shape {
  public bricks: Brick[] = [];
  public isFrozen = false;
  // 1 rotation = 90 degrees
  public rotations: number;
  public type: number;
  private startX: number;
  private startY: number;
  private color: number;

  get radialSymmetry() {
    return shapeTypes[this.type].radiallySymmetrical;
  }

  constructor(sourceShape: Shape);
  constructor(boardWidth: number, brickSize: number, random: ParkMiller);
  constructor() {
    if (arguments.length === 1) {
      this._copyingConstructor.apply(this, arguments);
    } else {
      this._defaultConstructor.apply(this, arguments);
    }
  }

  public checkCollisions(
    frozenBricks: Brick[],
    boardWidth: number,
    boardHeight: number,
  ) {
    const collisions: Collisions = {
      bottom: false,
      left: false,
      right: false,
    };

    for (const brick of this.bricks) {
      const bricksCollisions = brick.collidesWithBricks(frozenBricks);

      collisions.left ||= brick.x === 0 || bricksCollisions.left;
      collisions.right ||=
        brick.x === boardWidth - brick.sideLength || bricksCollisions.left;
      collisions.bottom ||=
        brick.y === boardHeight - brick.sideLength || bricksCollisions.bottom;
    }

    return collisions;
  }

  rotate() {
    this.rotations++;
    this.applyOrientation();
  }

  public applyOrientation() {
    const type = shapeTypes[this.type].matrix;
    const orientation = shapeOrientations[this.rotations % 4].matrix;
    const orientedShape = this.getOrientedShape(type, orientation);

    const center = this.bricks[0];

    for (let i = 0; i < 3; ++i) {
      this.bricks[i + 1].x = center.x + orientedShape[i][0] * this.startY;
      this.bricks[i + 1].y = center.y + orientedShape[i][1] * this.startY;
    }

    return this;
  }

  private getOrientedShape(
    shape: typeof shapeTypes[number]['matrix'],
    rotation: typeof shapeOrientations[number]['matrix'],
  ) {
    const orientedShape: number[][] = [];

    for (let i = 0; i < 3; ++i) {
      orientedShape[i] = [];
      for (let j = 0; j < 2; ++j) {
        orientedShape[i][j] = 0;
        for (let k = 0; k < 2; ++k) {
          orientedShape[i][j] += shape[i][k] * rotation[k][j];
        }
      }
    }

    return orientedShape;
  }

  private _defaultConstructor(
    boardWidth: number,
    brickSize: number,
    random: ParkMiller,
  ) {
    this.startX = boardWidth / 2;
    this.startY = brickSize;
    this.color = random.integerInRange(0, shapeColors.length - 1);
    this.type = random.integerInRange(0, shapeTypes.length - 1);
    this.rotations = random.integerInRange(0, shapeOrientations.length - 1);

    for (let i = 0; i < 4; ++i) {
      this.bricks.push(
        new Brick(
          this.startX,
          this.startY,
          shapeColors[this.color].rgb,
          brickSize,
        ),
      );
    }

    this.applyOrientation();
  }

  private _copyingConstructor(sourceShape: Shape) {
    this.color = sourceShape.color;
    this.type = sourceShape.type;
    this.startX = sourceShape.startX;
    this.startY = sourceShape.startY;
    this.rotations = sourceShape.rotations;

    for (let i = 0; i < 4; ++i) {
      this.bricks.push(new Brick(sourceShape.bricks[i]));
    }
  }
}
