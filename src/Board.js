import Shape from "./Shape";

export default function Board(game, boardWidth, boardHeight, brickSize, random) {
  const colors = {
    normal: 'rgb(69,90,100)',
    turbo: 'rgba(69,90,100,0.12)'
  };

  this.spawnShape = () => new Shape(boardWidth, brickSize, random);
  this.activeShape = this.spawnShape();
  this.staticBricks = [];

  this.drawStaticBricks = (context) => {
    this.staticBricks.forEach((staticBrick) => staticBrick.draw(context));
  };

  this.drawBackground = (context) => {
    context.fillStyle = game.turboMode ? colors.turbo : colors.normal;
    context.fillRect(0, 0, boardWidth, boardHeight);
  };

  this.drawReplay = (context) => {
    context.fillStyle = 'white';
    context.font = '12px Courier';
    context.fillText('REPLAY...', 0, 20);
  };

  this.drawScore = (context) => {
    context.fillStyle = 'white';
    context.font = '12px Courier';
    context.fillText('Score: ' + game.playerScore.get(), 0, 10);
  };

  this.isFull = () => this.staticBricks.some((brick) => brick.y < brickSize * 2);

  this.checkFilledRegions = () => {
    let rows = [], bricks, bricksChecked = 0;

    for (
      let i = boardHeight - brickSize;
      bricksChecked !== this.staticBricks.length;
      i -= brickSize
    ) {
      bricks = this.staticBricks.filter((brick) => brick.y === i);

      rows.push({
        bricks: bricks,
        isFull: bricks.length === boardWidth / brickSize
      });

      bricksChecked += bricks.length;
    }

    let newBricks = [], rowsCleared = 0;

    for (let i = 0; i < rows.length; ++i) {
      if (rows[i].isFull) {
        rows[i].bricks = [];
        ++rowsCleared;
        game.playerScore.add(rowsCleared);
      } else {
        rows[i].bricks.forEach((brick) => {
          // todo: investigate brick.y
          // noinspection JSUndefinedPropertyAssignment
          brick.y += rowsCleared * brickSize;
        });
      }

      newBricks = newBricks.concat(rows[i].bricks);
    }

    this.staticBricks = newBricks;
  };

  this.checkCollisions = (callback) => {
    const collisions = Object.seal({
      left: false,
      right: false,
      bottom: false
    });

    const checkAgainst = (obstacle, side) => {
      return (brick) => {
        if (obstacle === 'board') {
          switch (side) {
            case 'bottom':
              return brick.y === boardHeight - brickSize;
            case 'left':
              return brick.x === 0;
            case 'right':
              return brick.x === boardWidth - brickSize;
          }
        } else {
          let collision = false;

          this.staticBricks.forEach((staticBrick) => {
            switch (side) {
              case 'bottom': {
                collision = collision ||
                  brick.y === staticBrick.y - brickSize &&
                  brick.x === staticBrick.x;
                break;
              }

              case 'left': {
                collision = collision ||
                  brick.y === staticBrick.y &&
                  brick.x - brickSize === staticBrick.x;
                break;
              }

              case 'right': {
                collision = collision ||
                  brick.y === staticBrick.y &&
                  brick.x + brickSize === staticBrick.x;
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
