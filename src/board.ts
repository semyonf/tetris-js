import Brick from './brick';
import Game from './game';
import Shape from './shape/shape';
import ParkMiller from 'park-miller';

export enum Sides {
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right',
}

export const sides = [Sides.Bottom, Sides.Left, Sides.Right] as const;

export type Collisions = { [key in typeof sides[number]]: boolean };

export default class Board {
  public frozenBricks: Brick[] = [];
  public activeShape: Shape;
  public readonly colors = {
    normal: 'rgb(69,90,100)',
    turbo: 'rgba(69,90,100,0.12)',
  };

  constructor(
    public readonly game: Game,
    public readonly width: number,
    public readonly height: number,
    public readonly brickSize: number,
    private readonly random: ParkMiller,
  ) {
    this.activeShape = this.spawnShape();
  }

  public spawnShape() {
    return new Shape(this.width, this.brickSize, this.random);
  }

  public isFull() {
    return this.frozenBricks.some((brick) => brick.y < this.brickSize * 2);
  }

  public checkFilledRegions() {
    const rows = [];
    let bricks;
    let bricksChecked = 0;

    for (
      let i = this.height - this.brickSize;
      bricksChecked !== this.frozenBricks.length;
      i -= this.brickSize
    ) {
      bricks = this.frozenBricks.filter((brick) => brick.y === i);

      rows.push({
        bricks,
        isFull: bricks.length === this.width / this.brickSize,
      });

      bricksChecked += bricks.length;
    }

    let newBricks: Brick[] = [];
    let rowsCleared = 0;

    for (const row of rows) {
      if (row.isFull) {
        row.bricks = [];
        ++rowsCleared;
        this.game.scoreManager.add(rowsCleared);
      } else {
        row.bricks.forEach((brick) => {
          brick.y += rowsCleared * this.brickSize;
        });
      }

      newBricks = newBricks.concat(row.bricks);
    }

    this.frozenBricks = newBricks;
  }
}
