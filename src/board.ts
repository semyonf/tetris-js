import Brick from './brick';
import Game from './game';
import Shape from './shape/shape';
import ParkMiller from 'park-miller';

const sides = ['bottom', 'left', 'right'] as const;

export type Collisions = { [key in typeof sides[number]]: boolean };

export default class Board {
  public staticBricks: Brick[] = [];
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
    return this.staticBricks.some((brick) => brick.y < this.brickSize * 2);
  }

  public checkFilledRegions() {
    const rows = [];
    let bricks;
    let bricksChecked = 0;

    for (
      let i = this.height - this.brickSize;
      bricksChecked !== this.staticBricks.length;
      i -= this.brickSize
    ) {
      bricks = this.staticBricks.filter((brick) => brick.y === i);

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

    this.staticBricks = newBricks;
  }

  /**
   * todo: refactor
   */
  public checkCollisions(callback: (collisions: Collisions) => void) {
    const collisions: Collisions = {
      bottom: false,
      left: false,
      right: false,
    };

    const checkAgainst = (obstacle: string, side: keyof typeof collisions) => {
      return (brick: Brick) => {
        if (obstacle === 'board') {
          switch (side) {
            case 'bottom':
              return brick.y === this.height - this.brickSize;
            case 'left':
              return brick.x === 0;
            case 'right':
              return brick.x === this.width - this.brickSize;
          }
        } else {
          let collision = false;

          this.staticBricks.forEach((staticBrick) => {
            switch (side) {
              case 'bottom': {
                collision =
                  collision ||
                  (brick.y === staticBrick.y - this.brickSize &&
                    brick.x === staticBrick.x);
                break;
              }

              case 'left': {
                collision =
                  collision ||
                  (brick.y === staticBrick.y &&
                    brick.x - this.brickSize === staticBrick.x);
                break;
              }

              case 'right': {
                collision =
                  collision ||
                  (brick.y === staticBrick.y &&
                    brick.x + this.brickSize === staticBrick.x);
                break;
              }
            }
          });

          return collision;
        }
      };
    };

    this.activeShape.bricks.forEach((brick) => {
      sides.forEach((side) => {
        if (
          checkAgainst('board', side)(brick) ||
          checkAgainst('static', side)(brick)
        ) {
          collisions[side] = true;
        }
      });
    });

    callback(collisions);
  }
}
