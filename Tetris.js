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

  const board = document.querySelector('canvas#board'),
    boardWidth = 200,
    boardHeight = 440;

  board.width = boardWidth;
  board.height = boardHeight;

  const context = board.getContext('2d'),
    brickSize = 20,
    normalBoardColor = 'rgb(69,90,100)',
    turboBoardColor = 'rgba(69,90,100,0.12)';

  let frameCount = 0,
    game = new Game();

  function mainLoop() {
    game.continue();
    ++frameCount;
    requestAnimationFrame(mainLoop);
  }

  requestAnimationFrame(mainLoop);

  /**
   * An enum-like object to identify possible actions
   */
  const shapeActions = Object.freeze({
    ROTATE: 'rotate',
    MOVE_LEFT: 'moveLeft',
    MOVE_RIGHT: 'moveRight',
    FALL: 'moveDown',
    DROP: 'drop'
  });

  /**
   * Main game logic
   * @returns {Game}
   * @constructor
   */
  function Game() {
    const self = this;

    this.staticBricks = [];
    this.activeShape = new Shape();
    this.difficulty = 1;
    this.turboMode = false;
    this.inputDisabled = false;
    this._playerScore = 0;

    Object.defineProperty(this, 'playerScore', {
      get: function () {
        return self._playerScore;
      },

      set: function (newScore) {
        self._playerScore = newScore;

        [149, 49, 39, 9, 0].some(function (threshold, index) {
          if (newScore >= threshold) {
            self.difficulty = 5 - index;

            return true;
          }
        });
      }
    });

    this.checkFilledRegions = function () {
      let rows = [],
        bricks,
        bricksChecked = 0;

      for (
        let i = boardHeight - brickSize;
        bricksChecked !== this.staticBricks.length;
        i -= brickSize
      ) {
        bricks = this.staticBricks.filter(function (brick) {
          return brick.y === i;
        });

        rows.push({
          bricks: bricks,
          isFull: bricks.length === boardWidth / brickSize
        });

        bricksChecked += bricks.length;
      }

      let newBricks = [],
        rowsSkipped = 0;

      for (let i = 0; i < rows.length; ++i) {
        if (rows[i].isFull) {
          rows[i].bricks = [];
          ++rowsSkipped;
          this.playerScore += rowsSkipped;
        } else {
          rows[i].bricks.forEach(function (brick) {
            brick.y += rowsSkipped * brickSize;
          });
        }

        newBricks = newBricks.concat(rows[i].bricks);
      }

      this.staticBricks = newBricks;
    };

    this.drawScore = function () {
      context.fillStyle = 'white';
      context.font = '12px Courier';
      context.fillText('Score: ' + this.playerScore, 0, 10);
    };

    this.boardIsFull = function () {
      return this.staticBricks.some(function (brick) {
        return brick.y < brickSize * 2;
      });
    };

    this.gravityIsActive = function () {
      let gameSpeeds = [null, 30, 24, 20, 16, 10];

      return self.turboMode || frameCount % gameSpeeds[this.difficulty] === 0;
    };

    this.drawBackground = function () {
      context.fillStyle = self.turboMode ? turboBoardColor : normalBoardColor;
      context.fillRect(0, 0, boardWidth, boardHeight);
    };

    this.continue = function () {
      this.drawBackground();

      if (this.activeShape.isFrozen) {
        for (let i = 0; i < 4; ++i) {
          this.staticBricks.push(this.activeShape.bricks.pop());
        }

        this.checkFilledRegions();
        self.turboMode = false;
        this.activeShape = new Shape();

        if (this.boardIsFull()) {
          this.staticBricks = [];
          this.playerScore = 0;
        }
      } else {
        if (this.gravityIsActive()) {
          this.processAction(shapeActions.FALL);
        }

        this.activeShape.draw();
      }

      this.drawStaticBricks();
      this.drawScore();
    };

    this.checkCollisions = function (callback) {
      const self = this,
        collisions = Object.seal({
          left: false,
          right: false,
          bottom: false
        });

      function checkAgainst(obstacle, direction) {
        return function (brick) {
          if (obstacle === 'board') {
            switch (direction) {
              case 'bottom':
                return brick.y === boardHeight - brickSize;
              case 'left':
                return brick.x === 0;
              case 'right':
                return brick.x === boardWidth - brickSize;
            }
          } else {
            let collision = false;

            let callback = function (staticBrick) {
              switch (direction) {
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

            self.staticBricks.forEach(callback);

            return collision;
          }
        };
      }

      this.activeShape.bricks.forEach(function (brick) {
        ['bottom', 'left', 'right'].forEach(function (side) {
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

    this.drawStaticBricks = function () {
      this.staticBricks.forEach(function (staticBrick) {
        staticBrick.draw();
      });
    };

    this.processAction = function (action) {
      self.checkCollisions(function (collisions) {
        self.activeShape.isFrozen = collisions.bottom;

        switch (true) {
          case action === shapeActions.ROTATE && cantBeRotated():
          case action === shapeActions.MOVE_RIGHT && collisions.right:
          case action === shapeActions.MOVE_LEFT && collisions.left:
          case action === shapeActions.FALL && collisions.bottom:
          case action === shapeActions.DROP && collisions.bottom:
            break;

          default:
            if (action === shapeActions.DROP) {
              self.turboMode = true;
            }

            self.activeShape.performAction(action);
            break;
        }

        function cantBeRotated() {
          const temp = new Shape();

          temp.orientaion = self.activeShape.orientaion;
          temp.type = self.activeShape.type;

          for (let i = 0; i < 4; ++i) {
            Object.assign(
              temp.bricks[i],
              self.activeShape.bricks[i]
            );
          }

          temp.performAction(shapeActions.ROTATE);

          for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < self.staticBricks.length; ++j) {
              if (
                temp.bricks[i].x === self.staticBricks[j].x &&
                temp.bricks[i].y === self.staticBricks[j].y
              ) {
                return true;
              } else if (
                temp.bricks[i].x >= boardWidth ||
                temp.bricks[i].x <= 0 ||
                temp.bricks[i].y >= boardHeight
              ) {
                return true;
              }
            }
          }

          return false;
        }
      });
    };

    this.enableInput = function () {
      self.inputDisabled = false;
    };

    this.readAction = function (event) {
      const actions = Object.freeze({
        'ArrowLeft': shapeActions.MOVE_LEFT,
        'ArrowRight': shapeActions.MOVE_RIGHT,
        'ArrowUp': shapeActions.ROTATE,
        'ArrowDown': shapeActions.DROP,
      });

      if (!self.inputDisabled) {
        self.inputDisabled = true;
        self.processAction(actions[event.key]);
        self.checkCollisions(function (collisions) {
          self.activeShape.isFrozen = collisions.bottom;
        });
      }
    };

    window.addEventListener('keydown', this.readAction);
    window.addEventListener('keyup', this.enableInput);

    return this;
  }

  /**
   * Tetramino data
   * @returns {Shape}
   * @constructor
   */
  function Shape() {
    this.data = {
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
    };

    this.startX = boardWidth / 2;
    this.startY = brickSize;
    this.isFrozen = false;
    this.color = randInt(this.data.colors.length);
    this.type = randInt(this.data.types.length);
    this.orientaion = randInt(this.data.orientations.length);
    this.bricks = [];

    this.draw = function () {
      for (let i = 0; i < 4; ++i) {
        this.bricks[i].draw();
      }
    };

    this.performAction = function (movement) {
      switch (movement) {
        case shapeActions.ROTATE:
          if (this.data.types[this.type].name !== 'O') {
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

    this.applyOrientation = function () {
      const
        type = this.data.types[this.type].matrix,
        orientation = this.data.orientations[this.orientaion].matrix;

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
        this.data.colors[this.color].rgb
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
    this.draw = function () {
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
