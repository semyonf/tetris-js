/**
 * MIT License
 *
 * Copyright (c) 2018 Semyon Fomin
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function (undefined) {
  'use strict';

  const
    board = document.querySelector('canvas#board'),
    context = board.getContext('2d'),
    normalBoardColor = 'rgb(69,90,100)',
    turboBoardColor = 'rgba(69,90,100,0.12)',
    brickSize = 20,
    boardRows = 22,
    boardCols = 10,
    boardWidth = brickSize * boardCols,
    boardHeight = brickSize * boardRows;

  board.width = boardWidth;
  board.height = boardHeight;

  /**
   * An enum-like object to identify possible actions
   */
  const shapeActions = Object.freeze({
    ROTATE: 'rotate',
    MOVE_LEFT: 'move-left',
    MOVE_RIGHT: 'move-right',
    FALL: 'fall',
    DROP: 'drop'
  });

  let frameCount = 0;

  const game = (() => {
    let
      activeShape = new Shape(),
      difficulty = 1,
      staticBricks = [],
      turboMode = false,
      inputDisabled = false;

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
      }
    })();

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

      let newBricks = [], rowsSkipped = 0;

      for (let i = 0; i < rows.length; ++i) {
        if (rows[i].isFull) {
          rows[i].bricks = [];
          ++rowsSkipped;
          playerScore.add(rowsSkipped);
        } else {
          rows[i].bricks.forEach((brick) => {
            brick.y += rowsSkipped * brickSize;
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
      const gameSpeeds = [null, 30, 24, 20, 16, 10];

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
      staticBricks.forEach((staticBrick) => staticBrick.draw());
    }

    function processAction(action) {
      checkCollisions((collisions) => {
        activeShape.isFrozen = collisions.bottom;

        switch (true) {
          case action === shapeActions.ROTATE && cantBeRotated():
          case action === shapeActions.MOVE_RIGHT && collisions.right:
          case action === shapeActions.MOVE_LEFT && collisions.left:
          case action === shapeActions.FALL && collisions.bottom:
          case action === shapeActions.DROP && collisions.bottom:
            break;

          default:
            if (action === shapeActions.DROP) {
              turboMode = true;
            }

            activeShape.performAction(action);
            break;
        }

        function cantBeRotated() {
          const temp = new Shape();

          temp.orientaion = activeShape.orientaion;
          temp.type = activeShape.type;

          for (let i = 0; i < 4; ++i) {
            Object.assign(
              temp.bricks[i],
              activeShape.bricks[i]
            );
          }

          temp.performAction(shapeActions.ROTATE);

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

    function enableInput() {
      inputDisabled = false;
    }

    function readAction(event) {
      const actions = Object.freeze({
        'ArrowLeft': shapeActions.MOVE_LEFT,
        'ArrowRight': shapeActions.MOVE_RIGHT,
        'ArrowUp': shapeActions.ROTATE,
        'ArrowDown': shapeActions.DROP,
      });

      if (!inputDisabled) {
        inputDisabled = true;
        processAction(actions[event.key]);
        checkCollisions(function (collisions) {
          activeShape.isFrozen = collisions.bottom;
        });
      }
    }

    function proceed() {
      drawBackground();

      if (activeShape.isFrozen) {
        for (let i = 0; i < 4; ++i) {
          staticBricks.push(activeShape.bricks.pop());
        }

        checkFilledRegions();
        turboMode = false;
        activeShape = new Shape();

        if (boardIsFull()) {
          staticBricks = [];
          playerScore.set(0);
        }
      } else {
        if (gravityIsActive()) {
          processAction(shapeActions.FALL);
        }

        activeShape.draw();
      }

      drawStaticBricks();
      drawScore();
    }

    window.addEventListener('keydown', readAction);
    window.addEventListener('keyup', enableInput);

    /**
     * Public interface
     * @type {{proceed: void}}
     */
    return {proceed};
  })();

  function mainLoop() {
    game.proceed();
    ++frameCount;
    requestAnimationFrame(mainLoop);
  }

  requestAnimationFrame(mainLoop);

  /**
   * Tetramino constructor
   * @returns {Shape}
   * @constructor
   */
  function Shape() {
    const data = Object.freeze({
      types: [
        {
          name: 'I',
          matrix: [
            [0, -1], [0, 1], [0, 2]
          ]
        },
        {
          name: 'O',
          matrix: [
            [0, 1], [1, 0], [1, 1]
          ]
        },
        {
          name: 'Z',
          matrix: [
            [0, -1], [-1, 0], [1, -1]
          ]
        },
        {
          name: 'S',
          matrix: [
            [-1, -1], [0, -1], [1, 0]
          ]
        },
        {
          name: 'T',
          matrix: [
            [1, 0], [-1, 0], [0, 1]
          ]
        },
        {
          name: 'J',
          matrix: [
            [1, 0], [-1, 0], [-1, 1]
          ]
        },
        {
          name: 'L',
          matrix: [
            [1, 0], [-1, 0], [-1, -1]
          ]
        }
      ],
      orientations: [
        {
          angle: 0,
          matrix: [[1, 0], [0, 1]]
        }, {
          angle: 90,
          matrix: [[0, -1], [1, 0]]
        }, {
          angle: 180,
          matrix: [[-1, 0], [0, -1]]
        }, {
          angle: 270,
          matrix: [[0, 1], [-1, 0]]
        }
      ],
      colors: [
        {
          name: 'orange',
          rgb: 'rgb(239,108,0)'
        }, {
          name: 'red',
          rgb: 'rgb(211,47,47)'
        }, {
          name: 'green',
          rgb: 'rgb(76,175,80)'
        }, {
          name: 'blue',
          rgb: 'rgb(33,150,243)'
        }, {
          name: 'yellow',
          rgb: 'rgb(255,235,59)'
        }, {
          name: 'cyan',
          rgb: 'rgb(0,188,212)'
        }, {
          name: 'pink',
          rgb: 'rgb(233,30,99)'
        }, {
          name: 'white',
          rgb: 'rgb(224,224,224)'
        }
      ]
    });

    this.startX = boardWidth / 2;
    this.startY = brickSize;
    this.isFrozen = false;
    this.color = randInt(data.colors.length);
    this.type = randInt(data.types.length);
    this.orientaion = randInt(data.orientations.length);
    this.bricks = [];
    this.draw = () => {
      this.bricks.forEach((brick) => brick.draw());
    };
    this.performAction = (movement) => {
      switch (movement) {
        case shapeActions.ROTATE:
          if (data.types[this.type].name !== 'O') {
            this.orientaion = (this.orientaion === 3) ? 0 : ++this.orientaion;
            this.applyOrientation();
          }
          break;

        case shapeActions.FALL:
          this.bricks.forEach(function (brick) {
            brick.y += brickSize;
          });
          break;

        case shapeActions.MOVE_RIGHT:
        case shapeActions.MOVE_LEFT:
          for (let i = 0; i < 4; ++i) {
            if (movement === shapeActions.MOVE_LEFT) {
              this.bricks[i].x -= brickSize;
            } else {
              this.bricks[i].x += brickSize;
            }
          }
          break;

        case shapeActions.DROP:
          break;
      }

      return this;
    };
    this.applyOrientation = () => {
      const
        type = data.types[this.type].matrix,
        orientation = data.orientations[this.orientaion].matrix;

      let oriented = [];

      // Dot product of the data matrix and the orientation matrix
      for (let i = 0; i < 3; ++i) {
        oriented[i] = [];
        for (let j = 0; j < 2; ++j) {
          oriented[i][j] = 0;
          for (let k = 0; k < 2; ++k) {
            oriented[i][j] += type[i][k] * orientation[k][j];
          }
        }
      }

      const center = this.bricks[0];

      for (let i = 0; i < 3; ++i) {
        this.bricks[i + 1].x = center.x + oriented[i][0] * brickSize;
        this.bricks[i + 1].y = center.y + oriented[i][1] * brickSize;
      }

      return this;
    };

    for (let i = 0; i < 4; ++i) {
      this.bricks.push(new Brick(
        this.startX,
        this.startY,
        data.colors[this.color].rgb
      ));
    }

    this.applyOrientation();

    return this;
  }

  /**
   * Tetramino building block
   * @param {Number} x coordinate
   * @param {Number} y coordinate
   * @param {String} rgb color string
   * @returns {Brick}
   * @constructor
   */
  function Brick(x, y, rgb) {
    this.x = x;
    this.y = y;
    this.rgb = rgb;
    this.draw = () => {
      context.fillStyle = this.rgb;
      context.fillRect(
        this.x,
        this.y,
        brickSize - 1,
        brickSize - 1
      );
    };

    return this;
  }

  /**
   * Random integer generator
   * @param {number} max - not included
   * @param {number} [min] - included
   * @returns {number}
   */
  function randInt(max, min) {
    min = (min === undefined) ? 0 : min;
    --max;

    return Math.floor(min + Math.random() * (max + 1 - min));
  }
})();
