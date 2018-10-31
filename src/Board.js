import Shape from "./shape/Shape";

Board.prototype.drawBackground = function (context) {
  context.fillStyle = this.game.turboMode ? this.colors.turbo : this.colors.normal;
  context.fillRect(0, 0, this.width, this.height);
};

Board.prototype.drawStaticBricks = function (context) {
  this.staticBricks.forEach((staticBrick) => staticBrick.draw(context));
};

Board.prototype.drawReplay = function (context) {
  context.fillStyle = 'white';
  context.font = '12px Courier';
  context.fillText('REPLAY...', 0, 20);
};

Board.prototype.drawScore = function (context) {
  context.fillStyle = 'white';
  context.font = '12px Courier';
  context.fillText('Score: ' + this.game.playerScore.get(), 0, 10);
};

Board.prototype.spawnShape = function () {
  return new Shape(this.width, this.brickSize, this.random);
}

Board.prototype.isFull = function () {
  return this.staticBricks.some((brick) => brick.y < this.brickSize * 2);
}

Board.prototype.checkFilledRegions = function () {
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

Board.prototype.checkCollisions = function (callback) {
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

export default function Board(game, boardWidth, boardHeight, brickSize, random) {
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
