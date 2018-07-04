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
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var Tetris = (function () {
  'use strict';

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

      return Math.floor(min + this.nextFloat() * (max + 1 - min));
    };

    this.nextFloat = function () {
      return (this.nextInt() - 1) / 2147483646;
    };

    if (this._seed <= 0) {
      this._seed += 2147483646;
    }
  }

  function Brick(x, y, rgb, brickSize) {
    this.x = x;
    this.y = y;
    this.rgb = rgb;
    this.draw = (context) => {
      context.fillStyle = this.rgb;
      context.beginPath();
      context.moveTo(this.x, this.y);
      context.lineTo(this.x + brickSize - 1, this.y);
      context.lineTo(this.x, this.y + brickSize - 1);
      context.closePath();
      context.fill();

      context.fillStyle = modifyRgb(this.rgb, 0.9);
      context.beginPath();
      context.moveTo(this.x + brickSize - 1, this.y);
      context.lineTo(this.x, this.y + brickSize - 1);
      context.lineTo(this.x, this.y + brickSize - 1);
      context.lineTo(this.x + brickSize - 1, this.y + brickSize - 1);
      context.closePath();
      context.fill();
    };

    return this;
  }

  /**
   * A function to darken or lighten rgb color strings
   * @param {string} color
   * @param {number} factor
   * @returns {string}
   */
  function modifyRgb(color, factor) {
    const
      regexp = /rgb\((\d+),(\d+),(\d+)\)/g,
      matches = regexp.exec(color);

    let
      colors = [
        matches[1],
        matches[2],
        matches[3]
      ];

    colors.forEach(function (color, index, colors) {
      colors[index] = Math.floor(color * factor);
    });

    return `rgb(${colors[0]}, ${colors[1]}, ${colors[2]})`;
  }

  function Shape(boardWidth, brickSize, random) {
    this.startX = boardWidth / 2;
    this.startY = brickSize;
    this.isFrozen = false;
    this.color = random.nextInRange(Shape.prototype.parameters.colors.length);
    this.type = random.nextInRange(Shape.prototype.parameters.types.length);
    this.orientaion = random.nextInRange(Shape.prototype.parameters.orientations.length);
    this.bricks = [];

    this.draw = (context) => {
      this.bricks.forEach((brick) => brick.draw(context));
    };

    this.performAction = (movement) => {
      switch (movement) {
        case Shape.prototype.actions.ROTATE:
          if (Shape.prototype.parameters.types[this.type].name !== 'O') {
            this.orientaion = (this.orientaion === 3) ? 0 : ++this.orientaion;
            this.applyOrientation();
          }
          break;

        case Shape.prototype.actions.FALL:
          this.bricks.forEach(function (brick) {
            brick.y += brickSize;
          });
          break;

        case Shape.prototype.actions.MOVE_RIGHT:
        case Shape.prototype.actions.MOVE_LEFT:
          for (let i = 0; i < 4; ++i) {
            if (movement === Shape.prototype.actions.MOVE_LEFT) {
              this.bricks[i].x -= brickSize;
            } else {
              this.bricks[i].x += brickSize;
            }
          }
          break;

        case Shape.prototype.actions.DROP:
          break;
      }

      return this;
    };

    this.applyOrientation = () => {
      const
        type = Shape.prototype.parameters.types[this.type].matrix,
        orientation = Shape.prototype.parameters.orientations[this.orientaion].matrix;

      let oriented = [];

      // Dot product of a type matrix and an orientation matrix
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
        Shape.prototype.parameters.colors[this.color].rgb,
        brickSize
      ));
    }

    this.applyOrientation();

    return this;
  }

  Shape.prototype.parameters = Object.freeze({
    types: [
      { name: 'I', matrix: [[0, -1], [0, 1], [0, 2]] },
      { name: 'O', matrix: [[0, 1], [1, 0], [1, 1]] },
      { name: 'Z', matrix: [[0, -1], [-1, 0], [1, -1]] },
      { name: 'S', matrix: [[-1, -1], [0, -1], [1, 0]] },
      { name: 'T', matrix: [[1, 0], [-1, 0], [0, 1]] },
      { name: 'J', matrix: [[1, 0], [-1, 0], [-1, 1]] },
      { name: 'L', matrix: [[1, 0], [-1, 0], [-1, -1]] }
    ],
    orientations: [
      { angle: 0, matrix: [[1, 0], [0, 1]] },
      { angle: 90, matrix: [[0, -1], [1, 0]] },
      { angle: 180, matrix: [[-1, 0], [0, -1]] },
      { angle: 270, matrix: [[0, 1], [-1, 0]] }
    ],
    colors: [
      { name: 'orange', rgb: 'rgb(239,108,0)' },
      { name: 'red', rgb: 'rgb(211,47,47)' },
      { name: 'green', rgb: 'rgb(76,175,80)' },
      { name: 'blue', rgb: 'rgb(33,150,243)' },
      { name: 'yellow', rgb: 'rgb(255,235,59)' },
      { name: 'cyan', rgb: 'rgb(0,188,212)' },
      { name: 'pink', rgb: 'rgb(233,30,99)' },
      { name: 'white', rgb: 'rgb(224,224,224)' }
    ]
  });

  Shape.prototype.actions = Object.freeze({
    ROTATE: 'rotate',
    MOVE_LEFT: 'move-left',
    MOVE_RIGHT: 'move-right',
    FALL: 'fall',
    DROP: 'drop'
  });

  function Board(game, boardWidth, boardHeight, brickSize, random) {
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

  function Controls(leftKey, rightKey, rotateKey, dropKey) {
    return {
      [leftKey]: Shape.prototype.actions.MOVE_LEFT,
      [rightKey]: Shape.prototype.actions.MOVE_RIGHT,
      [rotateKey]: Shape.prototype.actions.ROTATE,
      [dropKey]: Shape.prototype.actions.DROP
    }
  }

  function Joystick(keyMap) {
    const keyStates = Object.seal(
      Object.assign({
        Escape: false,
        Enter: false,
        anyKey: false
      }, keyMap)
    );

    // todo: investigate linter warning
    Object.keys(keyStates).forEach(keyState => keyState = false);

    const callbacks = {}, keyQueue = [];

    function keyEvents(e) {
      const isDown = (e.type === 'keydown'), keyCode = e.code;
      keyStates.anyKey = isDown;

      if (isDown && callbacks.anyKey !== undefined) {
        callbacks.anyKey(keyCode);
      }

      if (keyStates[keyCode] !== undefined) {
        e.preventDefault();
        keyStates[keyCode] = isDown;

        if (isDown) {
          if (keyCode in keyMap) {
            keyQueue.push(keyCode);
          }

          if (callbacks[keyCode] !== undefined) {
            callbacks[keyCode]();
          }
        }
      }
    }

    /**
     * Public
     */
    return {
      keys: keyStates,
      keyMap,
      keyQueue,
      start() {
        addEventListener('keyup', keyEvents);
        addEventListener('keydown', keyEvents);
      },
      stop() {
        removeEventListener('keyup', keyEvents);
        removeEventListener('keydown', keyEvents);
      },
      setCallback(key, callback) {
        callbacks[key] = callback;
      }
    };
  }

  function Recorder(joystick, game) {
    const tape = [];
    let lastFrame = Infinity;

    const start = () => {
      joystick.setCallback('anyKey', (key) => {
        tape.push({ key, frame: game.getFrameCount() });
      });

      joystick.setCallback('Escape', () => {
        joystick.stop();
        lastFrame = game.getFrameCount();
        stop();
        tape.pop();
        play();
        game.restart();
        game.setRandomSeed(+(new Date()));
      });
    };

    const stop = () => {
      joystick.setCallback('anyKey', undefined);
      joystick.setCallback('Escape', undefined);
    };

    const play = () => {
      game.onProceed = () => {
        if (game.getFrameCount() !== lastFrame) {
          game.drawReplay();

          if (tape.length && game.getFrameCount() === tape[0].frame) {
            joystick.keyQueue.push(tape.shift().key);
          }
        } else {
          game.onProceed = undefined;
          joystick.start();
          start();
          game.restart();
        }
      };
    };

    /**
     * Public
     */
    return {
      tape,
      lastFrame,
      start,
      stop,
      play
    };
  }

  // noinspection JSUnusedGlobalSymbols
  function Game(config) {
    const context = config.context;

    const keyMaps = [
        new Controls('ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'),
        new Controls('KeyA', 'KeyD', 'KeyW', 'KeyS'), // W-A-S-D
        new Controls('KeyH', 'KeyL', 'KeyK', 'KeyJ')  // VIM
      ],
      keyMap = Object.assign(...keyMaps);

    // todo: custom controls would go somewhere here...

    const joystick = new Joystick(keyMap);
    const recorder = new Recorder(joystick, this);

    joystick.start();
    recorder.start();

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

    let board = new Board(this, config.board.boardWidth, config.board.boardHeight, config.board.brickSize, this.random);
    let frameCount = 0;
    // noinspection JSUnusedLocalSymbols
    this.onProceed = undefined;
    let difficulty = 1;
    this.turboMode = false;

    const gravityIsActive = () => {
      const gameSpeeds = [null, 27, 24, 16, 12, 8];

      return this.turboMode || frameCount % gameSpeeds[difficulty] === 0;
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
      this.turboMode = false;
      board = new Board(this, config.board.boardWidth, config.board.boardHeight, config.board.brickSize, this.random);
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
              this.turboMode = true;
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
              temp.bricks[i].x >= config.board.boardWidth ||
              temp.bricks[i].x <= 0 ||
              temp.bricks[i].y >= config.board.boardHeight
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
        this.turboMode = false;
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

    const mainLoop = () => {
      this.proceed();
      requestAnimationFrame(mainLoop);
    };

    requestAnimationFrame(mainLoop);
  }

  return Game;

}());
//# sourceMappingURL=tetris.js.map
