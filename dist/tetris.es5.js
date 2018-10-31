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

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tetris = function () {
  'use strict';

  function SeededRandom(seed) {
    this._seed = seed % 2147483647;

    this.nextInt = function () {
      return this._seed = this._seed * 16807 % 2147483647;
    };

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

  function Brick() {
    if (arguments.length === 1 && arguments[0] instanceof Brick) {
      this._copyingConstructor.apply(this, arguments);
    } else {
      this._defaultConstructor.apply(this, arguments);
    }
  }

  Brick.prototype._defaultConstructor = function (x, y, rgb, size) {
    this.x = x;
    this.y = y;
    this.rgb = rgb;
    this.size = size;
  };

  Brick.prototype._copyingConstructor = function (sourceBrick) {
    this.x = sourceBrick.x;
    this.y = sourceBrick.y;
    this.rgb = sourceBrick.rgb;
    this.size = sourceBrick.size;
  };

  Brick.prototype.draw = function (context) {
    context.fillStyle = this.rgb;
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.lineTo(this.x + this.size - 1, this.y);
    context.lineTo(this.x, this.y + this.size - 1);
    context.closePath();
    context.fill();

    context.fillStyle = modifyRgb(this.rgb, 0.9);
    context.beginPath();
    context.moveTo(this.x + this.size - 1, this.y);
    context.lineTo(this.x, this.y + this.size - 1);
    context.lineTo(this.x, this.y + this.size - 1);
    context.lineTo(this.x + this.size - 1, this.y + this.size - 1);
    context.closePath();
    context.fill();
  };

  function modifyRgb(color, factor) {
    var regexp = /rgb\((\d+) ?, ?(\d+) ?, ?(\d+)\)/g;
    var matches = regexp.exec(color);

    var colors = [matches[1], matches[2], matches[3]];

    colors.forEach(function (color, index, colors) {
      colors[index] = Math.floor(color * factor);
    });

    return 'rgb(' + colors[0] + ',' + colors[1] + ',' + colors[2] + ')';
  }

  Shape.prototype._copyingConstructor = function (sourceShape) {
    this.color = sourceShape.color;
    this.type = sourceShape.type;
    this.orientaion = sourceShape.orientaion;

    for (var i = 0; i < 4; ++i) {
      this.bricks.push(new Brick(sourceShape.bricks[i]));
    }
  };

  Shape.prototype._defaultConstructor = function (boardWidth, brickSize, random) {
    this.startX = boardWidth / 2;
    this.startY = brickSize;
    this.color = random.nextInRange(Shape.prototype.parameters.colors.length);
    this.type = random.nextInRange(Shape.prototype.parameters.types.length);
    this.orientaion = random.nextInRange(Shape.prototype.parameters.orientations.length);

    for (var i = 0; i < 4; ++i) {
      this.bricks.push(new Brick(this.startX, this.startY, Shape.prototype.parameters.colors[this.color].rgb, brickSize));
    }

    this.applyOrientation();
  };

  function Shape() {
    this.bricks = [];
    this.isFrozen = false;

    if (arguments.length === 1 && arguments[0] instanceof Shape) {
      this._copyingConstructor.apply(this, arguments);
    } else {
      this._defaultConstructor.apply(this, arguments);
    }
  }

  Shape.prototype.draw = function (context) {
    this.bricks.forEach(function (brick) {
      return brick.draw(context);
    });
  };

  Shape.prototype.applyOrientation = function () {
    var type = Shape.prototype.parameters.types[this.type].matrix,
        orientation = Shape.prototype.parameters.orientations[this.orientaion].matrix;

    var oriented = [];

    for (var i = 0; i < 3; ++i) {
      oriented[i] = [];
      for (var j = 0; j < 2; ++j) {
        oriented[i][j] = 0;
        for (var k = 0; k < 2; ++k) {
          oriented[i][j] += type[i][k] * orientation[k][j];
        }
      }
    }

    var center = this.bricks[0];

    for (var _i = 0; _i < 3; ++_i) {
      this.bricks[_i + 1].x = center.x + oriented[_i][0] * brickSize;
      this.bricks[_i + 1].y = center.y + oriented[_i][1] * brickSize;
    }

    return this;
  };

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
    var _this = this;

    this.width = boardWidth;
    this.height = boardHeight;
    this.game = game;

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
      _this.staticBricks.forEach(function (staticBrick) {
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
      return _this.staticBricks.some(function (brick) {
        return brick.y < brickSize * 2;
      });
    };

    this.checkFilledRegions = function () {
      var rows = [],
          bricks = void 0,
          bricksChecked = 0;

      var _loop = function _loop(i) {
        bricks = _this.staticBricks.filter(function (brick) {
          return brick.y === i;
        });

        rows.push({
          bricks: bricks,
          isFull: bricks.length === boardWidth / brickSize
        });

        bricksChecked += bricks.length;
      };

      for (var i = boardHeight - brickSize; bricksChecked !== _this.staticBricks.length; i -= brickSize) {
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
            brick.y += rowsCleared * brickSize;
          });
        }

        newBricks = newBricks.concat(rows[i].bricks);
      }

      _this.staticBricks = newBricks;
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

            _this.staticBricks.forEach(function (staticBrick) {
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

      _this.activeShape.bricks.forEach(function (brick) {
        ['bottom', 'left', 'right'].forEach(function (side) {
          if (checkAgainst('board', side)(brick) || checkAgainst('static', side)(brick)) {
            collisions[side] = true;
          }
        });
      });

      callback(collisions);
    };
  }

  var RotateCommand = function () {
    function RotateCommand() {
      _classCallCheck(this, RotateCommand);
    }

    _createClass(RotateCommand, [{
      key: 'execute',
      value: function execute(board) {

        var temp = new Shape(board.activeShape);

        if (Shape.prototype.parameters.types[temp.type].name !== 'O') {
          temp.orientaion = temp.orientaion === 3 ? 0 : ++temp.orientaion;
          temp.applyOrientation();

          for (var i = 0; i < 4; ++i) {
            for (var j = 0; j < board.staticBricks.length; ++j) {
              if (temp.bricks[i].x === board.staticBricks[j].x && temp.bricks[i].y === board.staticBricks[j].y) {
                return;
              }
            }

            if (temp.bricks[i].x >= board.width || temp.bricks[i].x <= 0 || temp.bricks[i].y >= board.height) {
              return;
            }
          }
        }

        board.activeShape = temp;
      }
    }]);

    return RotateCommand;
  }();

  var MoveLeftCommand = function () {
    function MoveLeftCommand() {
      _classCallCheck(this, MoveLeftCommand);
    }

    _createClass(MoveLeftCommand, [{
      key: 'execute',
      value: function execute(board) {
        var _this2 = this;


        board.checkCollisions(function (collisions) {
          if (!collisions.left) {
            for (var i = 0; i < 4; ++i) {
              _this2.bricks[i].x -= brickSize;
            }
          }
        });
      }
    }]);

    return MoveLeftCommand;
  }();

  var MoveRightCommand = function () {
    function MoveRightCommand() {
      _classCallCheck(this, MoveRightCommand);
    }

    _createClass(MoveRightCommand, [{
      key: 'execute',
      value: function execute(board) {
        var _this3 = this;


        board.checkCollisions(function (collisions) {
          if (!collisions.right) {
            for (var i = 0; i < 4; ++i) {
              _this3.bricks[i].x += brickSize;
            }
          }
        });
      }
    }]);

    return MoveRightCommand;
  }();

  var DropCommand = function () {
    function DropCommand() {
      _classCallCheck(this, DropCommand);
    }

    _createClass(DropCommand, [{
      key: 'execute',
      value: function execute(board) {
        board.game.turboMode = true;
      }
    }]);

    return DropCommand;
  }();

  function Controls(leftKey, rightKey, rotateKey, dropKey) {
    var _ref;

    return _ref = {}, _defineProperty(_ref, leftKey, new MoveLeftCommand()), _defineProperty(_ref, rightKey, new MoveRightCommand()), _defineProperty(_ref, rotateKey, new RotateCommand()), _defineProperty(_ref, dropKey, new DropCommand()), _ref;
  }

  function Joystick(keyMap) {
    var keyStates = Object.seal(Object.assign({
      Escape: false,
      Enter: false,
      anyKey: false
    }, keyMap));

    Object.keys(keyStates).forEach(function (keyState) {
      return keyStates[keyState] = false;
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

    return {
      tape: tape,
      lastFrame: lastFrame,
      start: start,
      stop: stop,
      play: play
    };
  }

  var FallCommand = function () {
    function FallCommand() {
      _classCallCheck(this, FallCommand);
    }

    _createClass(FallCommand, [{
      key: 'execute',
      value: function execute(board) {

        this.bricks.forEach(function (brick) {
          brick.y += brickSize;
        });
      }
    }]);

    return FallCommand;
  }();

  function Game(config) {
    var _this4 = this;

    var context = config.context;

    var keyMaps = [new Controls('ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'), new Controls('KeyA', 'KeyD', 'KeyW', 'KeyS'), 
    new Controls('KeyH', 'KeyL', 'KeyK', 'KeyJ') 
    ];
    var keyMap = Object.assign.apply(Object, keyMaps);


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

    var readCommand = function readCommand() {
      var nextKey = joystick.keyQueue.shift();
      var command = joystick.keyMap[nextKey];

      if (command) {
        command.execute.call(board.activeShape, board);
      }
    };

    this.proceed = function () {
      ++frameCount;
      board.drawBackground(context);

      if (_this4.onProceed !== undefined) {
        _this4.onProceed();
      }

      readCommand();

      board.checkCollisions(function (collisions) {
        board.activeShape.isFrozen = collisions.bottom;
      });

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
          new FallCommand().execute.call(board.activeShape, board);
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
