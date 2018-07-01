import Joystick from './Joystick.js';
import Shape from './Shape.js';

(function (undefined) {
  'use strict';

  const
    brickSize = 20,
    boardRows = 22,
    boardCols = 10,
    boardWidth = brickSize * boardCols,
    boardHeight = brickSize * boardRows,
    normalBoardColor = 'rgb(69,90,100)',
    turboBoardColor = 'rgba(69,90,100,0.12)',

    keyMap = Object.freeze({
      // Arrow controls
      'ArrowLeft': Shape.prototype.actions.MOVE_LEFT,
      'ArrowRight': Shape.prototype.actions.MOVE_RIGHT,
      'ArrowUp': Shape.prototype.actions.ROTATE,
      'ArrowDown': Shape.prototype.actions.DROP,
      // WASD controls
      'KeyW': Shape.prototype.actions.ROTATE,
      'KeyA': Shape.prototype.actions.MOVE_LEFT,
      'KeyS': Shape.prototype.actions.DROP,
      'KeyD': Shape.prototype.actions.MOVE_RIGHT,
      // VIM controls
      'KeyH': Shape.prototype.actions.MOVE_LEFT,
      'KeyJ': Shape.prototype.actions.DROP,
      'KeyK': Shape.prototype.actions.ROTATE,
      'KeyL': Shape.prototype.actions.MOVE_RIGHT,
    }),
    board = document.querySelector('canvas#board'),
    context = board.getContext("2d");

  board.width = boardWidth * window.devicePixelRatio;
  board.height = boardHeight * window.devicePixelRatio;
  board.style.width = `${boardWidth}px`;
  board.style.height = `${boardHeight}px`;
  context.scale(window.devicePixelRatio, window.devicePixelRatio);

  let
    randomSeed = +(new Date()),
    random = new SeededRandom(randomSeed),
    frameCount = 0;

  const recorder = (() => {
    const tape = [];
    let lastFrame = Infinity;

    function start() {
      joystick.setCallback('anyKey', (key) => {
        recorder.tape.push({key, frame: frameCount});
        recorder.lastFrame = frameCount;
      });

      joystick.setCallback('Escape', () => {
        joystick.stop();
        recorder.stop();
        recorder.tape.pop();
        recorder.play();
        random = new SeededRandom(randomSeed);
        randomSeed = +(new Date());
        frameCount = 0;
        game.restart();
      });
    }

    function stop() {
      joystick.setCallback('anyKey', undefined);
      joystick.setCallback('Escape', undefined);
    }

    function play() {
      game.onProceed = function () {
        if (frameCount !== recorder.lastFrame) {
          context.fillStyle = 'white';
          context.font = '12px Courier';
          context.fillText('REPLAY...', 0, 20);

          if (recorder.tape.length && frameCount === recorder.tape[0].frame) {
            joystick.keyQueue.push(recorder.tape.shift().key);
          }
        } else {
          game.onProceed = undefined;
          frameCount = 0;
          random = new SeededRandom(randomSeed);
          joystick.start();
          recorder.start();
          game.restart();
        }
      };
    }

    /**
     * Public interface
     */
    return {
      tape,
      lastFrame,
      start,
      stop,
      play
    };
  })();

  const joystick = new Joystick(keyMap);

  const game = (() => {
    function spawnShape() {
      return new Shape(boardWidth, brickSize, random);
    }

    let
      activeShape = spawnShape(),
      difficulty = 1,
      staticBricks = [],
      turboMode = false;

    const playerScore = (() => {
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

    let onProceed;

    function restart() {
      playerScore.set(0);
      staticBricks = [];
      activeShape = spawnShape();
    }

    function checkFilledRegions() {
      let rows = [], bricks, bricksChecked = 0;

      for (
        let i = boardHeight - brickSize;
        bricksChecked !== staticBricks.length;
        i -= brickSize
      ) {
        bricks = staticBricks.filter((brick) => brick.y === i);

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
          playerScore.add(rowsCleared);
        } else {
          rows[i].bricks.forEach((brick) => {
            brick.y += rowsCleared * brickSize;
          });
        }

        newBricks = newBricks.concat(rows[i].bricks);
      }

      staticBricks = newBricks;
    }

    function drawScore() {
      context.fillStyle = 'white';
      context.font = '12px Courier';
      context.fillText('Score: ' + playerScore.get(), 0, 10);
    }

    function boardIsFull() {
      return staticBricks.some((brick) => brick.y < brickSize * 2);
    }

    function gravityIsActive() {
      const gameSpeeds = [null, 27, 24, 16, 12, 8];

      return turboMode || frameCount % gameSpeeds[difficulty] === 0;
    }

    function drawBackground() {
      context.fillStyle = turboMode ? turboBoardColor : normalBoardColor;
      context.fillRect(0, 0, boardWidth, boardHeight);
    }

    function checkCollisions(callback) {
      const collisions = Object.seal({
        left: false,
        right: false,
        bottom: false
      });

      activeShape.bricks.forEach((brick) => {
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

      function checkAgainst(obstacle, side) {
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

            let callback = (staticBrick) => {
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
            };

            staticBricks.forEach(callback);

            return collision;
          }
        };
      }
    }

    function drawStaticBricks() {
      staticBricks.forEach((staticBrick) => staticBrick.draw(context));
    }

    function processAction(action) {
      checkCollisions((collisions) => {
        activeShape.isFrozen = collisions.bottom;

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

            activeShape.performAction(action);
            break;
        }

        function cantBeRotated() {
          const temp = spawnShape();

          temp.orientaion = activeShape.orientaion;
          temp.type = activeShape.type;

          for (let i = 0; i < 4; ++i) {
            Object.assign(
              temp.bricks[i],
              activeShape.bricks[i]
            );
          }

          temp.performAction(Shape.prototype.actions.ROTATE);

          for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < staticBricks.length; ++j) {
              if (
                temp.bricks[i].x === staticBricks[j].x &&
                temp.bricks[i].y === staticBricks[j].y
              ) {
                return true;
              }
            }

            if (
              temp.bricks[i].x >= boardWidth ||
              temp.bricks[i].x <= 0 ||
              temp.bricks[i].y >= boardHeight
            ) {
              return true;
            }
          }

          return false;
        }
      });
    }

    function readAction() {
      const nextKey = joystick.keyQueue.shift();
      processAction(keyMap[nextKey]);

      checkCollisions((collisions) => {
        activeShape.isFrozen = collisions.bottom;
      });
    }

    function proceed() {
      drawBackground();

      if (game.onProceed !== undefined) {
        game.onProceed();
      }

      readAction();

      if (activeShape.isFrozen) {
        for (let i = 0; i < 4; ++i) {
          staticBricks.push(activeShape.bricks.pop());
        }

        checkFilledRegions();
        turboMode = false;
        activeShape = spawnShape();

        if (boardIsFull()) {
          restart();
        }
      } else {
        if (gravityIsActive()) {
          processAction(Shape.prototype.actions.FALL);
        }

        activeShape.draw(context);
      }

      drawStaticBricks();
      drawScore();
    }

    /**
     * Public interface
     * @type {{onProceed: [function], proceed: void, restart: void}}
     */
    return {onProceed, proceed, restart};
  })();

  joystick.start();
  recorder.start();

  /**
   * Random mode, just for fun! :D
   */
  joystick.setCallback('Enter', () => {
    recorder.stop();
    joystick.stop();
    const keys = Object.keys(keyMap);
    game.onProceed = function () {
      if (frameCount % 5 === 0) {
        joystick.keyQueue.push(keys[random.nextInRange(keys.length)]);
      }
    };
  });

  function mainLoop() {
    game.proceed();
    ++frameCount;
    requestAnimationFrame(mainLoop);
  }

  requestAnimationFrame(mainLoop);

  /**
   * Seeded PRNG
   * Originally found at https://gist.github.com/blixt/f17b47c62508be59987b
   * @param seed
   * @constructor
   */
  function SeededRandom(seed) {
    this._seed = (seed % 2147483647);

    this.nextInt = function () {
      return this._seed = this._seed * 16807 % 2147483647;
    };

    /**
     * Random integer generator
     * @param {number} max - not included
     * @param {number} [min] - included
     * @returns {number}
     */
    this.nextInRange = function (max, min) {
      min = (min === undefined) ? 0 : min;
      --max;

      return Math.floor(min + random.nextFloat() * (max + 1 - min));
    };

    this.nextFloat = function () {
      return (this.nextInt() - 1) / 2147483646;
    };

    if (this._seed <= 0) {
      this._seed += 2147483646;
    }
  }
})();
