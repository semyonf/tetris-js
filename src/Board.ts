import Shape from "./shape/Shape";
import Brick from "./Brick";
import Game from "./Game";

export default class Board {
  public staticBricks: Array<Brick>;
  private width: number;
  private height: number;
  private brickSize: number;
  private random: any;
  activeShape: Shape;
  // @ts-ignore
  private game: Game;
  private colors: { normal: string; turbo: string };

  constructor(game, boardWidth, boardHeight, brickSize, random) {
    this.staticBricks = [];
    this.width = boardWidth
    this.height = boardHeight
    this.brickSize = brickSize
    this.random = random
    this.activeShape = this.spawnShape();
    this.game = game

    this.colors = {
      normal: 'rgb(69,90,100)',
      turbo: 'rgba(69,90,100,0.12)'
    };
  }

  public spawnShape() {
    return new Shape(this.width, this.brickSize, this.random);
  }

  public drawBackground(context) {
    context.fillStyle = this.game.turboMode ? this.colors.turbo : this.colors.normal;
    context.fillRect(0, 0, this.width, this.height);
  };

  public drawStaticBricks(context) {
    this.staticBricks.forEach((staticBrick) => staticBrick.draw(context));
  };

  public drawReplay(context) {
    context.fillStyle = 'white';
    context.font = '12px Courier';
    context.fillText('REPLAY...', 0, 20);
  };

  public drawScore(context) {
    context.fillStyle = 'white';
    context.font = '12px Courier';
    context.fillText('Score: ' + this.game.playerScore.get(), 0, 10);
  };

  public isFull() {
    return this.staticBricks.some((brick) => brick.y < this.brickSize * 2);
  }

  public checkFilledRegions() {
    let rows = [], bricks, bricksChecked = 0;

    for (
      let i = this.height - this.brickSize;
      bricksChecked !== this.staticBricks.length;
      i -= this.brickSize
    ) {
      bricks = this.staticBricks.filter((brick) => brick.y === i);

      rows.push({
        bricks: bricks,
        isFull: bricks.length === this.width / this.brickSize
      });

      bricksChecked += bricks.length;
    }

    let newBricks = [], rowsCleared = 0;

    for (let i = 0; i < rows.length; ++i) {
      if (rows[i].isFull) {
        rows[i].bricks = [];
        ++rowsCleared;
        this.game.playerScore.add(rowsCleared);
      } else {
        rows[i].bricks.forEach((brick) => {
          brick.y += rowsCleared * this.brickSize;
        });
      }

      newBricks = newBricks.concat(rows[i].bricks);
    }

    this.staticBricks = newBricks;
  };

  /**
   * todo: refactor
   * @param callback
   */
  public checkCollisions(callback) {
    const collisions = Object.seal({
      left: false,
      right: false,
      bottom: false
    });

    const checkAgainst = (obstacle, side) => {
      // @ts-ignore
      return brick => {
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
                collision = collision ||
                  brick.y === staticBrick.y - this.brickSize &&
                  brick.x === staticBrick.x;
                break;
              }

              case 'left': {
                collision = collision ||
                  brick.y === staticBrick.y &&
                  brick.x - this.brickSize === staticBrick.x;
                break;
              }

              case 'right': {
                collision = collision ||
                  brick.y === staticBrick.y &&
                  brick.x + this.brickSize === staticBrick.x;
                break;
              }
            }
          });

          return collision;
        }
      };
    };

    this.activeShape.bricks.forEach((brick) => {
      ['bottom', 'left', 'right'].forEach((side) => {
        if (
          checkAgainst('board', side)(brick) ||
          checkAgainst('static', side)(brick)
        ) {
          collisions[side] = true;
        }
      });
    });

    callback(collisions);
  };
}
