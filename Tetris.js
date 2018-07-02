import Joystick from './Joystick';
import Shape from './Shape';
import SeededRandom from './SeededRandom';
import KeyMap from './KeyMap';
import Recorder from "./Recorder";

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

    keyMaps = [
      new KeyMap('ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'),
      new KeyMap('KeyA', 'KeyD', 'KeyW', 'KeyS'), // W-A-S-D
      new KeyMap('KeyH', 'KeyL', 'KeyK', 'KeyJ')  // VIM
    ],
    keyMap = Object.assign(...keyMaps),
    domElement = document.querySelector('canvas#board'),
    context = domElement.getContext("2d");

  domElement.width = boardWidth * window.devicePixelRatio;
  domElement.height = boardHeight * window.devicePixelRatio;
  domElement.style.width = `${boardWidth}px`;
  domElement.style.height = `${boardHeight}px`;
  context.scale(window.devicePixelRatio, window.devicePixelRatio);

  let
    randomSeed = +(new Date()),
    random,
    frameCount = 0;

  const joystick = new Joystick(keyMap);

  const game = (() => {
    function spawnShape() {
      return new Shape(boardWidth, brickSize, random);
    }

    function drawReplay() {
      context.fillStyle = 'white';
      context.font = '12px Courier';
      context.fillText('REPLAY...', 0, 20);
    }

    let activeShape, difficulty = 1, staticBricks, turboMode = false;

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
      random = new SeededRandom(randomSeed);
      playerScore.set(0);
      staticBricks = [];
      activeShape = spawnShape();
      frameCount = 0;
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

    restart();

    /**
     * Public interface
     * @type {{onProceed: [function], proceed: void, restart: void}}
     */
    return {
      onProceed, proceed, restart, drawReplay,
      getFrameCount: () => frameCount,
      setRandomSeed: (newRandomSeed) => {
        randomSeed = newRandomSeed
      }
    };
  })();

  const recorder = new Recorder(joystick, game);

  joystick.start();
  recorder.start();

  // /**
  //  * Random mode, just for fun! :D
  //  */
  // joystick.setCallback('Enter', () => {
  //   recorder.stop();
  //   joystick.stop();
  //   const keys = Object.keys(keyMap);
  //   game.onProceed = function () {
  //     if (frameCount % 5 === 0) {
  //       joystick.keyQueue.push(keys[random.nextInRange(keys.length)]);
  //     }
  //   };
  // });

  function mainLoop() {
    game.proceed();
    ++frameCount;
    requestAnimationFrame(mainLoop);
  }

  requestAnimationFrame(mainLoop);
})();
