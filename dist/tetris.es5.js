'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

var Tetris = function () {
  'use strict';

  function SeededRandom(seed) {
    this._seed = seed % 2147483647;

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
      min = min === undefined ? 0 : min;
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
    var _this = this;

    this.x = x;
    this.y = y;
    this.rgb = rgb;
    this.draw = function (context) {
      context.fillStyle = _this.rgb;
      context.beginPath();
      context.moveTo(_this.x, _this.y);
      context.lineTo(_this.x + brickSize - 1, _this.y);
      context.lineTo(_this.x, _this.y + brickSize - 1);
      context.closePath();
      context.fill();

      context.fillStyle = modifyRgb(_this.rgb, 0.9);
      context.beginPath();
      context.moveTo(_this.x + brickSize - 1, _this.y);
      context.lineTo(_this.x, _this.y + brickSize - 1);
      context.lineTo(_this.x, _this.y + brickSize - 1);
      context.lineTo(_this.x + brickSize - 1, _this.y + brickSize - 1);
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
    var regexp = /rgb\((\d+),(\d+),(\d+)\)/g,
        matches = regexp.exec(color);

    var colors = [matches[1], matches[2], matches[3]];

    colors.forEach(function (color, index, colors) {
      colors[index] = Math.floor(color * factor);
    });

    return 'rgb(' + colors[0] + ', ' + colors[1] + ', ' + colors[2] + ')';
  }

  function Shape(boardWidth, brickSize, random) {
    var _this2 = this;

    this.startX = boardWidth / 2;
    this.startY = brickSize;
    this.isFrozen = false;
    this.color = random.nextInRange(Shape.prototype.parameters.colors.length);
    this.type = random.nextInRange(Shape.prototype.parameters.types.length);
    this.orientaion = random.nextInRange(Shape.prototype.parameters.orientations.length);
    this.bricks = [];

    this.draw = function (context) {
      _this2.bricks.forEach(function (brick) {
        return brick.draw(context);
      });
    };

    this.performAction = function (movement) {
      switch (movement) {
        case Shape.prototype.actions.ROTATE:
          if (Shape.prototype.parameters.types[_this2.type].name !== 'O') {
            _this2.orientaion = _this2.orientaion === 3 ? 0 : ++_this2.orientaion;
            _this2.applyOrientation();
          }
          break;

        case Shape.prototype.actions.FALL:
          _this2.bricks.forEach(function (brick) {
            brick.y += brickSize;
          });
          break;

        case Shape.prototype.actions.MOVE_RIGHT:
        case Shape.prototype.actions.MOVE_LEFT:
          for (var i = 0; i < 4; ++i) {
            if (movement === Shape.prototype.actions.MOVE_LEFT) {
              _this2.bricks[i].x -= brickSize;
            } else {
              _this2.bricks[i].x += brickSize;
            }
          }
          break;

        case Shape.prototype.actions.DROP:
          break;
      }

      return _this2;
    };

    this.applyOrientation = function () {
      var type = Shape.prototype.parameters.types[_this2.type].matrix,
          orientation = Shape.prototype.parameters.orientations[_this2.orientaion].matrix;

      var oriented = [];

      // Dot product of a type matrix and an orientation matrix
      for (var i = 0; i < 3; ++i) {
        oriented[i] = [];
        for (var j = 0; j < 2; ++j) {
          oriented[i][j] = 0;
          for (var k = 0; k < 2; ++k) {
            oriented[i][j] += type[i][k] * orientation[k][j];
          }
        }
      }

      var center = _this2.bricks[0];

      for (var _i = 0; _i < 3; ++_i) {
        _this2.bricks[_i + 1].x = center.x + oriented[_i][0] * brickSize;
        _this2.bricks[_i + 1].y = center.y + oriented[_i][1] * brickSize;
      }

      return _this2;
    };

    for (var i = 0; i < 4; ++i) {
      this.bricks.push(new Brick(this.startX, this.startY, Shape.prototype.parameters.colors[this.color].rgb, brickSize));
    }

    this.applyOrientation();

    return this;
  }

  Shape.prototype.parameters = Object.freeze({
    types: [{ name: 'I', matrix: [[0, -1], [0, 1], [0, 2]] }, { name: 'O', matrix: [[0, 1], [1, 0], [1, 1]] }, { name: 'Z', matrix: [[0, -1], [-1, 0], [1, -1]] }, { name: 'S', matrix: [[-1, -1], [0, -1], [1, 0]] }, { name: 'T', matrix: [[1, 0], [-1, 0], [0, 1]] }, { name: 'J', matrix: [[1, 0], [-1, 0], [-1, 1]] }, { name: 'L', matrix: [[1, 0], [-1, 0], [-1, -1]] }],
    orientations: [{ angle: 0, matrix: [[1, 0], [0, 1]] }, { angle: 90, matrix: [[0, -1], [1, 0]] }, { angle: 180, matrix: [[-1, 0], [0, -1]] }, { angle: 270, matrix: [[0, 1], [-1, 0]] }],
    colors: [{ name: 'orange', rgb: 'rgb(239,108,0)' }, { name: 'red', rgb: 'rgb(211,47,47)' }, { name: 'green', rgb: 'rgb(76,175,80)' }, { name: 'blue', rgb: 'rgb(33,150,243)' }, { name: 'yellow', rgb: 'rgb(255,235,59)' }, { name: 'cyan', rgb: 'rgb(0,188,212)' }, { name: 'pink', rgb: 'rgb(233,30,99)' }, { name: 'white', rgb: 'rgb(224,224,224)' }]
  });

  Shape.prototype.actions = Object.freeze({
    ROTATE: 'rotate',
    MOVE_LEFT: 'move-left',
    MOVE_RIGHT: 'move-right',
    FALL: 'fall',
    DROP: 'drop'
  });

  function Board(game, boardWidth, boardHeight, brickSize, random) {
    var _this3 = this;

    var colors = {
      normal: 'rgb(69,90,100)',
      turbo: 'rgba(69,90,100,0.12)'
    };

    this.spawnShape = function () {
      return new Shape(boardWidth, brickSize, random);
    };
    this.activeShape = this.spawnShape();
    this.staticBricks = [];

    this.drawStaticBricks = function (context) {
      _this3.staticBricks.forEach(function (staticBrick) {
        return staticBrick.draw(context);
      });
    };

    this.drawBackground = function (context) {
      context.fillStyle = game.turboMode ? colors.turbo : colors.normal;
      context.fillRect(0, 0, boardWidth, boardHeight);
    };

    this.drawReplay = function (context) {
      context.fillStyle = 'white';
      context.font = '12px Courier';
      context.fillText('REPLAY...', 0, 20);
    };

    this.drawScore = function (context) {
      context.fillStyle = 'white';
      context.font = '12px Courier';
      context.fillText('Score: ' + game.playerScore.get(), 0, 10);
    };

    this.isFull = function () {
      return _this3.staticBricks.some(function (brick) {
        return brick.y < brickSize * 2;
      });
    };

    this.checkFilledRegions = function () {
      var rows = [],
          bricks = void 0,
          bricksChecked = 0;

      var _loop = function _loop(i) {
        bricks = _this3.staticBricks.filter(function (brick) {
          return brick.y === i;
        });

        rows.push({
          bricks: bricks,
          isFull: bricks.length === boardWidth / brickSize
        });

        bricksChecked += bricks.length;
      };

      for (var i = boardHeight - brickSize; bricksChecked !== _this3.staticBricks.length; i -= brickSize) {
        _loop(i);
      }

      var newBricks = [],
          rowsCleared = 0;

      for (var i = 0; i < rows.length; ++i) {
        if (rows[i].isFull) {
          rows[i].bricks = [];
          ++rowsCleared;
          game.playerScore.add(rowsCleared);
        } else {
          rows[i].bricks.forEach(function (brick) {
            // todo: investigate brick.y
            // noinspection JSUndefinedPropertyAssignment
            brick.y += rowsCleared * brickSize;
          });
        }

        newBricks = newBricks.concat(rows[i].bricks);
      }

      _this3.staticBricks = newBricks;
    };

    this.checkCollisions = function (callback) {
      var collisions = Object.seal({
        left: false,
        right: false,
        bottom: false
      });

      var checkAgainst = function checkAgainst(obstacle, side) {
        return function (brick) {
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
            var collision = false;

            _this3.staticBricks.forEach(function (staticBrick) {
              switch (side) {
                case 'bottom':
                  {
                    collision = collision || brick.y === staticBrick.y - brickSize && brick.x === staticBrick.x;
                    break;
                  }

                case 'left':
                  {
                    collision = collision || brick.y === staticBrick.y && brick.x - brickSize === staticBrick.x;
                    break;
                  }

                case 'right':
                  {
                    collision = collision || brick.y === staticBrick.y && brick.x + brickSize === staticBrick.x;
                    break;
                  }
              }
            });

            return collision;
          }
        };
      };

      _this3.activeShape.bricks.forEach(function (brick) {
        ['bottom', 'left', 'right'].forEach(function (side) {
          if (checkAgainst('board', side)(brick) || checkAgainst('static', side)(brick)) {
            collisions[side] = true;
          }
        });
      });

      callback(collisions);
    };
  }

  function Controls(leftKey, rightKey, rotateKey, dropKey) {
    var _ref;

    return _ref = {}, _defineProperty(_ref, leftKey, Shape.prototype.actions.MOVE_LEFT), _defineProperty(_ref, rightKey, Shape.prototype.actions.MOVE_RIGHT), _defineProperty(_ref, rotateKey, Shape.prototype.actions.ROTATE), _defineProperty(_ref, dropKey, Shape.prototype.actions.DROP), _ref;
  }

  function Joystick(keyMap) {
    var keyStates = Object.seal(Object.assign({
      Escape: false,
      Enter: false,
      anyKey: false
    }, keyMap));

    // todo: investigate linter warning
    Object.keys(keyStates).forEach(function (keyState) {
      return keyState = false;
    });

    var callbacks = {},
        keyQueue = [];

    function keyEvents(e) {
      var isDown = e.type === 'keydown',
          keyCode = e.code;
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
      keyMap: keyMap,
      keyQueue: keyQueue,
      start: function start() {
        addEventListener('keyup', keyEvents);
        addEventListener('keydown', keyEvents);
      },
      stop: function stop() {
        removeEventListener('keyup', keyEvents);
        removeEventListener('keydown', keyEvents);
      },
      setCallback: function setCallback(key, callback) {
        callbacks[key] = callback;
      }
    };
  }

  function Recorder(joystick, game) {
    var tape = [];
    var lastFrame = Infinity;

    var start = function start() {
      joystick.setCallback('anyKey', function (key) {
        tape.push({ key: key, frame: game.getFrameCount() });
      });

      joystick.setCallback('Escape', function () {
        joystick.stop();
        lastFrame = game.getFrameCount();
        stop();
        tape.pop();
        play();
        game.restart();
        game.setRandomSeed(+new Date());
      });
    };

    var stop = function stop() {
      joystick.setCallback('anyKey', undefined);
      joystick.setCallback('Escape', undefined);
    };

    var play = function play() {
      game.onProceed = function () {
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
      tape: tape,
      lastFrame: lastFrame,
      start: start,
      stop: stop,
      play: play
    };
  }

  // noinspection JSUnusedGlobalSymbols
  function Game(config) {
    var _this4 = this;

    var context = config.context;

    var keyMaps = [new Controls('ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'), new Controls('KeyA', 'KeyD', 'KeyW', 'KeyS'), // W-A-S-D
    new Controls('KeyH', 'KeyL', 'KeyK', 'KeyJ') // VIM
    ],
        keyMap = Object.assign.apply(Object, keyMaps);

    // todo: custom controls would go somewhere here...

    var joystick = new Joystick(keyMap);
    var recorder = new Recorder(joystick, this);

    joystick.start();
    recorder.start();

    this.randomSeed = +new Date();
    this.random = new SeededRandom(this.randomSeed);

    this.playerScore = function () {
      var _playerScore = 0;
      var scoreThresholds = [149, 49, 39, 9, 0];

      return {
        get: function get() {
          return _playerScore;
        },
        set: function set(newScore) {
          _playerScore = newScore;

          scoreThresholds.some(function (threshold, index) {
            if (newScore >= threshold) {
              difficulty = 5 - index;

              return true;
            }
          });
        },
        add: function add(extraScore) {
          this.set(_playerScore + extraScore);
        }
      };
    }();

    var board = new Board(this, config.board.boardWidth, config.board.boardHeight, config.board.brickSize, this.random);
    var frameCount = 0;
    // noinspection JSUnusedLocalSymbols
    this.onProceed = undefined;
    var difficulty = 1;
    this.turboMode = false;

    var gravityIsActive = function gravityIsActive() {
      var gameSpeeds = [null, 27, 24, 16, 12, 8];

      return _this4.turboMode || frameCount % gameSpeeds[difficulty] === 0;
    };

    this.drawReplay = function () {
      board.drawReplay(context);
    };

    this.getFrameCount = function () {
      return frameCount;
    };

    this.restart = function () {
      _this4.random = new SeededRandom(_this4.randomSeed);
      _this4.playerScore.set(0);
      frameCount = 0;
      difficulty = 1;
      _this4.turboMode = false;
      board = new Board(_this4, config.board.boardWidth, config.board.boardHeight, config.board.brickSize, _this4.random);
    };

    this.setRandomSeed = function (newSeed) {
      _this4.randomSeed = newSeed;
    };

    var processAction = function processAction(action) {
      board.checkCollisions(function (collisions) {
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
              _this4.turboMode = true;
            }

            board.activeShape.performAction(action);
            break;
        }

        function cantBeRotated() {
          var temp = board.spawnShape();

          temp.orientaion = board.activeShape.orientaion;
          temp.type = board.activeShape.type;

          for (var i = 0; i < 4; ++i) {
            Object.assign(temp.bricks[i], board.activeShape.bricks[i]);
          }

          temp.performAction(Shape.prototype.actions.ROTATE);

          for (var _i2 = 0; _i2 < 4; ++_i2) {
            for (var j = 0; j < board.staticBricks.length; ++j) {
              if (temp.bricks[_i2].x === board.staticBricks[j].x && temp.bricks[_i2].y === board.staticBricks[j].y) {
                return true;
              }
            }

            if (temp.bricks[_i2].x >= config.board.boardWidth || temp.bricks[_i2].x <= 0 || temp.bricks[_i2].y >= config.board.boardHeight) {
              return true;
            }
          }

          return false;
        }
      });
    };

    var readAction = function readAction() {
      var nextKey = joystick.keyQueue.shift();
      processAction(joystick.keyMap[nextKey]);

      board.checkCollisions(function (collisions) {
        board.activeShape.isFrozen = collisions.bottom;
      });
    };

    this.proceed = function () {
      ++frameCount;
      board.drawBackground(context);

      if (_this4.onProceed !== undefined) {
        _this4.onProceed();
      }

      readAction();

      if (board.activeShape.isFrozen) {
        for (var i = 0; i < 4; ++i) {
          board.staticBricks.push(board.activeShape.bricks.pop());
        }

        board.checkFilledRegions();
        _this4.turboMode = false;
        board.activeShape = board.spawnShape();

        if (board.isFull()) {
          _this4.restart();
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

    var mainLoop = function mainLoop() {
      _this4.proceed();
      requestAnimationFrame(mainLoop);
    };

    requestAnimationFrame(mainLoop);
  }

  return Game;
}();
//# sourceMappingURL=tetris.js.map