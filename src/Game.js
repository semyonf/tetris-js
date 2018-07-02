import SeededRandom from "./SeededRandom";
import Shape from "./Shape";
import Board from "./Board";

export default function Game(joystick, boardConfig, context) {
  this.randomSeed = +(new Date());
  this.random = new SeededRandom(this.randomSeed);

  this.playerScore = (() => {
    let _playerScore = 0;
    const scoreThresholds = [149, 49, 39, 9, 0];

    return {
      get() {
        return _playerScore;
      },
      set(newScore) {
        _playerScore = newScore;

        scoreThresholds.some((threshold, index) => {
          if (newScore >= threshold) {
            difficulty = 5 - index;

            return true;
          }
        });
      },
      add(extraScore) {
        this.set(_playerScore + extraScore);
      }
    };
  })();

  let board = new Board(this, boardConfig.width, boardConfig.height, boardConfig.brickSize, this.random);
  let frameCount = 0;
  // noinspection JSUnusedLocalSymbols
  this.onProceed = undefined;
  let difficulty = 1, turboMode = false;

  const gravityIsActive = () => {
    const gameSpeeds = [null, 27, 24, 16, 12, 8];

    return turboMode || frameCount % gameSpeeds[difficulty] === 0;
  };

  this.drawReplay = () => {
    board.drawReplay(context);
  };

  this.getFrameCount = () => frameCount;

  this.restart = () => {
    this.random = new SeededRandom(this.randomSeed);
    this.playerScore.set(0);
    frameCount = 0;
    difficulty = 1;
    turboMode = false;
    board = new Board(this, boardConfig.width, boardConfig.height, boardConfig.brickSize, this.random);
  };

  this.setRandomSeed = (newSeed) => {
    this.randomSeed = newSeed;
  };

  const processAction = (action) => {
    board.checkCollisions((collisions) => {
      board.activeShape.isFrozen = collisions.bottom;

      switch (true) {
        case action === Shape.prototype.actions.ROTATE && cantBeRotated():
        case action === Shape.prototype.actions.MOVE_RIGHT && collisions.right:
        case action === Shape.prototype.actions.MOVE_LEFT && collisions.left:
        case action === Shape.prototype.actions.FALL && collisions.bottom:
        case action === Shape.prototype.actions.DROP && collisions.bottom:
          break;

        default:
          if (action === Shape.prototype.actions.DROP) {
            turboMode = true;
          }

          board.activeShape.performAction(action);
          break;
      }

      function cantBeRotated() {
        const temp = board.spawnShape();

        temp.orientaion = board.activeShape.orientaion;
        temp.type = board.activeShape.type;

        for (let i = 0; i < 4; ++i) {
          Object.assign(
            temp.bricks[i],
            board.activeShape.bricks[i]
          );
        }

        temp.performAction(Shape.prototype.actions.ROTATE);

        for (let i = 0; i < 4; ++i) {
          for (let j = 0; j < board.staticBricks.length; ++j) {
            if (
              temp.bricks[i].x === board.staticBricks[j].x &&
              temp.bricks[i].y === board.staticBricks[j].y
            ) {
              return true;
            }
          }

          if (
            temp.bricks[i].x >= boardConfig.width ||
            temp.bricks[i].x <= 0 ||
            temp.bricks[i].y >= boardConfig.height
          ) {
            return true;
          }
        }

        return false;
      }
    });
  };

  const readAction = () => {
    const nextKey = joystick.keyQueue.shift();
    processAction(joystick.keyMap[nextKey]);

    board.checkCollisions((collisions) => {
      board.activeShape.isFrozen = collisions.bottom;
    });
  };

  this.proceed = () => {
    ++frameCount;
    board.drawBackground(context);

    if (this.onProceed !== undefined) {
      this.onProceed();
    }

    readAction();

    if (board.activeShape.isFrozen) {
      for (let i = 0; i < 4; ++i) {
        board.staticBricks.push(board.activeShape.bricks.pop());
      }

      board.checkFilledRegions();
      turboMode = false;
      board.activeShape = board.spawnShape();

      if (board.isFull()) {
        this.restart();
      }
    } else {
      if (gravityIsActive()) {
        processAction(Shape.prototype.actions.FALL);
      }

      board.activeShape.draw(context);
    }

    board.drawStaticBricks(context);
    board.drawScore(context);
  };
}