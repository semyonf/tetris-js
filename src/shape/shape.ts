import Brick from '../brick';
import ParkMiller from 'park-miller';
import { boardCols } from '../constants';

export class ShapeFactory {
  constructor(private prng: ParkMiller) {}

  createShape() {
    const color = this.prng.integerInRange(0, shapeColors.length - 1);
    const type = this.prng.integerInRange(0, shapeTypes.length - 1);
    const rotations = this.prng.integerInRange(0, shapeOrientations.length - 1);

    return new Shape(boardCols / 2, color, type, rotations);
  }
}

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

  get radialSymmetry() {
    return shapeTypes[this.type].radiallySymmetrical;
  }

  constructor(
    private startX: number,
    private color: number,
    private type: number,
    // 1 rotation = 90 degrees
    private rotations: number,
    bricks?: Brick[],
  ) {
    if (bricks) {
      this.bricks = bricks;
    } else {
      for (let i = 0; i < 4; ++i) {
        this.bricks.push(
          new Brick(boardCols / 2, 1, shapeColors[this.color].rgb),
        );
      }

      this.applyOrientation();
    }
  }

  public collidesWithSomething(
    frozenBricks: Brick[],
    cols: number,
    rows: number,
  ): boolean {
    return this.bricks.some((ownBrick) => {
      if (ownBrick.collidesWith(frozenBricks)) {
        return true;
      }

      return ownBrick.collidesWithBoundaries(cols, rows);
    });
  }

  rotate() {
    this.rotations++;
    this.applyOrientation();
  }

  public applyOrientation() {
    const type = shapeTypes[this.type].matrix;
    const orientation = shapeOrientations[this.rotations % 4].matrix;
    const orientedShape = this.getOrientedShape(type, orientation);
    const [centerBrick] = this.bricks;

    for (let i = 0; i < 3; ++i) {
      this.bricks[i + 1].x = centerBrick.x + orientedShape[i][0];
      this.bricks[i + 1].y = centerBrick.y + orientedShape[i][1];
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

  public copy() {
    return new Shape(
      this.startX,
      this.color,
      this.type,
      this.rotations,
      this.bricks.map((brick) => brick.copy()),
    );
  }
}
