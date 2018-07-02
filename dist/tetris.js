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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV0cmlzLmpzIiwic291cmNlcyI6WyIuLi9zcmMvU2VlZGVkUmFuZG9tLmpzIiwiLi4vc3JjL0JyaWNrLmpzIiwiLi4vc3JjL1NoYXBlLmpzIiwiLi4vc3JjL0JvYXJkLmpzIiwiLi4vc3JjL0tleU1hcC5qcyIsIi4uL3NyYy9Kb3lzdGljay5qcyIsIi4uL3NyYy9SZWNvcmRlci5qcyIsIi4uL3NyYy9HYW1lLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNlZWRlZFJhbmRvbShzZWVkKSB7XG4gIHRoaXMuX3NlZWQgPSAoc2VlZCAlIDIxNDc0ODM2NDcpO1xuXG4gIHRoaXMubmV4dEludCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2VlZCA9IHRoaXMuX3NlZWQgKiAxNjgwNyAlIDIxNDc0ODM2NDc7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJhbmRvbSBpbnRlZ2VyIGdlbmVyYXRvclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWF4IC0gbm90IGluY2x1ZGVkXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbbWluXSAtIGluY2x1ZGVkXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICB0aGlzLm5leHRJblJhbmdlID0gZnVuY3Rpb24gKG1heCwgbWluKSB7XG4gICAgbWluID0gKG1pbiA9PT0gdW5kZWZpbmVkKSA/IDAgOiBtaW47XG4gICAgLS1tYXg7XG5cbiAgICByZXR1cm4gTWF0aC5mbG9vcihtaW4gKyB0aGlzLm5leHRGbG9hdCgpICogKG1heCArIDEgLSBtaW4pKTtcbiAgfTtcblxuICB0aGlzLm5leHRGbG9hdCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKHRoaXMubmV4dEludCgpIC0gMSkgLyAyMTQ3NDgzNjQ2O1xuICB9O1xuXG4gIGlmICh0aGlzLl9zZWVkIDw9IDApIHtcbiAgICB0aGlzLl9zZWVkICs9IDIxNDc0ODM2NDY7XG4gIH1cbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBCcmljayh4LCB5LCByZ2IsIGJyaWNrU2l6ZSkge1xuICB0aGlzLnggPSB4O1xuICB0aGlzLnkgPSB5O1xuICB0aGlzLnJnYiA9IHJnYjtcbiAgdGhpcy5kcmF3ID0gKGNvbnRleHQpID0+IHtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMucmdiO1xuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5tb3ZlVG8odGhpcy54LCB0aGlzLnkpO1xuICAgIGNvbnRleHQubGluZVRvKHRoaXMueCArIGJyaWNrU2l6ZSAtIDEsIHRoaXMueSk7XG4gICAgY29udGV4dC5saW5lVG8odGhpcy54LCB0aGlzLnkgKyBicmlja1NpemUgLSAxKTtcbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIGNvbnRleHQuZmlsbCgpO1xuXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBtb2RpZnlSZ2IodGhpcy5yZ2IsIDAuOSk7XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0Lm1vdmVUbyh0aGlzLnggKyBicmlja1NpemUgLSAxLCB0aGlzLnkpO1xuICAgIGNvbnRleHQubGluZVRvKHRoaXMueCwgdGhpcy55ICsgYnJpY2tTaXplIC0gMSk7XG4gICAgY29udGV4dC5saW5lVG8odGhpcy54LCB0aGlzLnkgKyBicmlja1NpemUgLSAxKTtcbiAgICBjb250ZXh0LmxpbmVUbyh0aGlzLnggKyBicmlja1NpemUgLSAxLCB0aGlzLnkgKyBicmlja1NpemUgLSAxKTtcbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIGNvbnRleHQuZmlsbCgpO1xuICB9O1xuXG4gIHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIEEgZnVuY3Rpb24gdG8gZGFya2VuIG9yIGxpZ2h0ZW4gcmdiIGNvbG9yIHN0cmluZ3NcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvclxuICogQHBhcmFtIHtudW1iZXJ9IGZhY3RvclxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gbW9kaWZ5UmdiKGNvbG9yLCBmYWN0b3IpIHtcbiAgY29uc3RcbiAgICByZWdleHAgPSAvcmdiXFwoKFxcZCspLChcXGQrKSwoXFxkKylcXCkvZyxcbiAgICBtYXRjaGVzID0gcmVnZXhwLmV4ZWMoY29sb3IpO1xuXG4gIGxldFxuICAgIGNvbG9ycyA9IFtcbiAgICAgIG1hdGNoZXNbMV0sXG4gICAgICBtYXRjaGVzWzJdLFxuICAgICAgbWF0Y2hlc1szXVxuICAgIF07XG5cbiAgY29sb3JzLmZvckVhY2goZnVuY3Rpb24gKGNvbG9yLCBpbmRleCwgY29sb3JzKSB7XG4gICAgY29sb3JzW2luZGV4XSA9IE1hdGguZmxvb3IoY29sb3IgKiBmYWN0b3IpO1xuICB9KTtcblxuICByZXR1cm4gYHJnYigke2NvbG9yc1swXX0sICR7Y29sb3JzWzFdfSwgJHtjb2xvcnNbMl19KWA7XG59XG4iLCJpbXBvcnQgQnJpY2sgZnJvbSAnLi9Ccmljay5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNoYXBlKGJvYXJkV2lkdGgsIGJyaWNrU2l6ZSwgcmFuZG9tKSB7XG4gIHRoaXMuc3RhcnRYID0gYm9hcmRXaWR0aCAvIDI7XG4gIHRoaXMuc3RhcnRZID0gYnJpY2tTaXplO1xuICB0aGlzLmlzRnJvemVuID0gZmFsc2U7XG4gIHRoaXMuY29sb3IgPSByYW5kb20ubmV4dEluUmFuZ2UoU2hhcGUucHJvdG90eXBlLnBhcmFtZXRlcnMuY29sb3JzLmxlbmd0aCk7XG4gIHRoaXMudHlwZSA9IHJhbmRvbS5uZXh0SW5SYW5nZShTaGFwZS5wcm90b3R5cGUucGFyYW1ldGVycy50eXBlcy5sZW5ndGgpO1xuICB0aGlzLm9yaWVudGFpb24gPSByYW5kb20ubmV4dEluUmFuZ2UoU2hhcGUucHJvdG90eXBlLnBhcmFtZXRlcnMub3JpZW50YXRpb25zLmxlbmd0aCk7XG4gIHRoaXMuYnJpY2tzID0gW107XG5cbiAgdGhpcy5kcmF3ID0gKGNvbnRleHQpID0+IHtcbiAgICB0aGlzLmJyaWNrcy5mb3JFYWNoKChicmljaykgPT4gYnJpY2suZHJhdyhjb250ZXh0KSk7XG4gIH07XG5cbiAgdGhpcy5wZXJmb3JtQWN0aW9uID0gKG1vdmVtZW50KSA9PiB7XG4gICAgc3dpdGNoIChtb3ZlbWVudCkge1xuICAgICAgY2FzZSBTaGFwZS5wcm90b3R5cGUuYWN0aW9ucy5ST1RBVEU6XG4gICAgICAgIGlmIChTaGFwZS5wcm90b3R5cGUucGFyYW1ldGVycy50eXBlc1t0aGlzLnR5cGVdLm5hbWUgIT09ICdPJykge1xuICAgICAgICAgIHRoaXMub3JpZW50YWlvbiA9ICh0aGlzLm9yaWVudGFpb24gPT09IDMpID8gMCA6ICsrdGhpcy5vcmllbnRhaW9uO1xuICAgICAgICAgIHRoaXMuYXBwbHlPcmllbnRhdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFNoYXBlLnByb3RvdHlwZS5hY3Rpb25zLkZBTEw6XG4gICAgICAgIHRoaXMuYnJpY2tzLmZvckVhY2goZnVuY3Rpb24gKGJyaWNrKSB7XG4gICAgICAgICAgYnJpY2sueSArPSBicmlja1NpemU7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBTaGFwZS5wcm90b3R5cGUuYWN0aW9ucy5NT1ZFX1JJR0hUOlxuICAgICAgY2FzZSBTaGFwZS5wcm90b3R5cGUuYWN0aW9ucy5NT1ZFX0xFRlQ6XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgKytpKSB7XG4gICAgICAgICAgaWYgKG1vdmVtZW50ID09PSBTaGFwZS5wcm90b3R5cGUuYWN0aW9ucy5NT1ZFX0xFRlQpIHtcbiAgICAgICAgICAgIHRoaXMuYnJpY2tzW2ldLnggLT0gYnJpY2tTaXplO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmJyaWNrc1tpXS54ICs9IGJyaWNrU2l6ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgU2hhcGUucHJvdG90eXBlLmFjdGlvbnMuRFJPUDpcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdGhpcy5hcHBseU9yaWVudGF0aW9uID0gKCkgPT4ge1xuICAgIGNvbnN0XG4gICAgICB0eXBlID0gU2hhcGUucHJvdG90eXBlLnBhcmFtZXRlcnMudHlwZXNbdGhpcy50eXBlXS5tYXRyaXgsXG4gICAgICBvcmllbnRhdGlvbiA9IFNoYXBlLnByb3RvdHlwZS5wYXJhbWV0ZXJzLm9yaWVudGF0aW9uc1t0aGlzLm9yaWVudGFpb25dLm1hdHJpeDtcblxuICAgIGxldCBvcmllbnRlZCA9IFtdO1xuXG4gICAgLy8gRG90IHByb2R1Y3Qgb2YgYSB0eXBlIG1hdHJpeCBhbmQgYW4gb3JpZW50YXRpb24gbWF0cml4XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzOyArK2kpIHtcbiAgICAgIG9yaWVudGVkW2ldID0gW107XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDI7ICsraikge1xuICAgICAgICBvcmllbnRlZFtpXVtqXSA9IDA7XG4gICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgMjsgKytrKSB7XG4gICAgICAgICAgb3JpZW50ZWRbaV1bal0gKz0gdHlwZVtpXVtrXSAqIG9yaWVudGF0aW9uW2tdW2pdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgY2VudGVyID0gdGhpcy5icmlja3NbMF07XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDM7ICsraSkge1xuICAgICAgdGhpcy5icmlja3NbaSArIDFdLnggPSBjZW50ZXIueCArIG9yaWVudGVkW2ldWzBdICogYnJpY2tTaXplO1xuICAgICAgdGhpcy5icmlja3NbaSArIDFdLnkgPSBjZW50ZXIueSArIG9yaWVudGVkW2ldWzFdICogYnJpY2tTaXplO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgKytpKSB7XG4gICAgdGhpcy5icmlja3MucHVzaChuZXcgQnJpY2soXG4gICAgICB0aGlzLnN0YXJ0WCxcbiAgICAgIHRoaXMuc3RhcnRZLFxuICAgICAgU2hhcGUucHJvdG90eXBlLnBhcmFtZXRlcnMuY29sb3JzW3RoaXMuY29sb3JdLnJnYixcbiAgICAgIGJyaWNrU2l6ZVxuICAgICkpO1xuICB9XG5cbiAgdGhpcy5hcHBseU9yaWVudGF0aW9uKCk7XG5cbiAgcmV0dXJuIHRoaXM7XG59XG5cblNoYXBlLnByb3RvdHlwZS5wYXJhbWV0ZXJzID0gT2JqZWN0LmZyZWV6ZSh7XG4gIHR5cGVzOiBbXG4gICAgeyBuYW1lOiAnSScsIG1hdHJpeDogW1swLCAtMV0sIFswLCAxXSwgWzAsIDJdXSB9LFxuICAgIHsgbmFtZTogJ08nLCBtYXRyaXg6IFtbMCwgMV0sIFsxLCAwXSwgWzEsIDFdXSB9LFxuICAgIHsgbmFtZTogJ1onLCBtYXRyaXg6IFtbMCwgLTFdLCBbLTEsIDBdLCBbMSwgLTFdXSB9LFxuICAgIHsgbmFtZTogJ1MnLCBtYXRyaXg6IFtbLTEsIC0xXSwgWzAsIC0xXSwgWzEsIDBdXSB9LFxuICAgIHsgbmFtZTogJ1QnLCBtYXRyaXg6IFtbMSwgMF0sIFstMSwgMF0sIFswLCAxXV0gfSxcbiAgICB7IG5hbWU6ICdKJywgbWF0cml4OiBbWzEsIDBdLCBbLTEsIDBdLCBbLTEsIDFdXSB9LFxuICAgIHsgbmFtZTogJ0wnLCBtYXRyaXg6IFtbMSwgMF0sIFstMSwgMF0sIFstMSwgLTFdXSB9XG4gIF0sXG4gIG9yaWVudGF0aW9uczogW1xuICAgIHsgYW5nbGU6IDAsIG1hdHJpeDogW1sxLCAwXSwgWzAsIDFdXSB9LFxuICAgIHsgYW5nbGU6IDkwLCBtYXRyaXg6IFtbMCwgLTFdLCBbMSwgMF1dIH0sXG4gICAgeyBhbmdsZTogMTgwLCBtYXRyaXg6IFtbLTEsIDBdLCBbMCwgLTFdXSB9LFxuICAgIHsgYW5nbGU6IDI3MCwgbWF0cml4OiBbWzAsIDFdLCBbLTEsIDBdXSB9XG4gIF0sXG4gIGNvbG9yczogW1xuICAgIHsgbmFtZTogJ29yYW5nZScsIHJnYjogJ3JnYigyMzksMTA4LDApJyB9LFxuICAgIHsgbmFtZTogJ3JlZCcsIHJnYjogJ3JnYigyMTEsNDcsNDcpJyB9LFxuICAgIHsgbmFtZTogJ2dyZWVuJywgcmdiOiAncmdiKDc2LDE3NSw4MCknIH0sXG4gICAgeyBuYW1lOiAnYmx1ZScsIHJnYjogJ3JnYigzMywxNTAsMjQzKScgfSxcbiAgICB7IG5hbWU6ICd5ZWxsb3cnLCByZ2I6ICdyZ2IoMjU1LDIzNSw1OSknIH0sXG4gICAgeyBuYW1lOiAnY3lhbicsIHJnYjogJ3JnYigwLDE4OCwyMTIpJyB9LFxuICAgIHsgbmFtZTogJ3BpbmsnLCByZ2I6ICdyZ2IoMjMzLDMwLDk5KScgfSxcbiAgICB7IG5hbWU6ICd3aGl0ZScsIHJnYjogJ3JnYigyMjQsMjI0LDIyNCknIH1cbiAgXVxufSk7XG5cblNoYXBlLnByb3RvdHlwZS5hY3Rpb25zID0gT2JqZWN0LmZyZWV6ZSh7XG4gIFJPVEFURTogJ3JvdGF0ZScsXG4gIE1PVkVfTEVGVDogJ21vdmUtbGVmdCcsXG4gIE1PVkVfUklHSFQ6ICdtb3ZlLXJpZ2h0JyxcbiAgRkFMTDogJ2ZhbGwnLFxuICBEUk9QOiAnZHJvcCdcbn0pO1xuIiwiaW1wb3J0IFNoYXBlIGZyb20gXCIuL1NoYXBlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEJvYXJkKGdhbWUsIGJvYXJkV2lkdGgsIGJvYXJkSGVpZ2h0LCBicmlja1NpemUsIHJhbmRvbSkge1xuICBjb25zdCBjb2xvcnMgPSB7XG4gICAgbm9ybWFsOiAncmdiKDY5LDkwLDEwMCknLFxuICAgIHR1cmJvOiAncmdiYSg2OSw5MCwxMDAsMC4xMiknXG4gIH07XG5cbiAgdGhpcy5zcGF3blNoYXBlID0gKCkgPT4gbmV3IFNoYXBlKGJvYXJkV2lkdGgsIGJyaWNrU2l6ZSwgcmFuZG9tKTtcbiAgdGhpcy5hY3RpdmVTaGFwZSA9IHRoaXMuc3Bhd25TaGFwZSgpO1xuICB0aGlzLnN0YXRpY0JyaWNrcyA9IFtdO1xuXG4gIHRoaXMuZHJhd1N0YXRpY0JyaWNrcyA9IChjb250ZXh0KSA9PiB7XG4gICAgdGhpcy5zdGF0aWNCcmlja3MuZm9yRWFjaCgoc3RhdGljQnJpY2spID0+IHN0YXRpY0JyaWNrLmRyYXcoY29udGV4dCkpO1xuICB9O1xuXG4gIHRoaXMuZHJhd0JhY2tncm91bmQgPSAoY29udGV4dCkgPT4ge1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gZ2FtZS50dXJib01vZGUgPyBjb2xvcnMudHVyYm8gOiBjb2xvcnMubm9ybWFsO1xuICAgIGNvbnRleHQuZmlsbFJlY3QoMCwgMCwgYm9hcmRXaWR0aCwgYm9hcmRIZWlnaHQpO1xuICB9O1xuXG4gIHRoaXMuZHJhd1JlcGxheSA9IChjb250ZXh0KSA9PiB7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgIGNvbnRleHQuZm9udCA9ICcxMnB4IENvdXJpZXInO1xuICAgIGNvbnRleHQuZmlsbFRleHQoJ1JFUExBWS4uLicsIDAsIDIwKTtcbiAgfTtcblxuICB0aGlzLmRyYXdTY29yZSA9IChjb250ZXh0KSA9PiB7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgIGNvbnRleHQuZm9udCA9ICcxMnB4IENvdXJpZXInO1xuICAgIGNvbnRleHQuZmlsbFRleHQoJ1Njb3JlOiAnICsgZ2FtZS5wbGF5ZXJTY29yZS5nZXQoKSwgMCwgMTApO1xuICB9O1xuXG4gIHRoaXMuaXNGdWxsID0gKCkgPT4gdGhpcy5zdGF0aWNCcmlja3Muc29tZSgoYnJpY2spID0+IGJyaWNrLnkgPCBicmlja1NpemUgKiAyKTtcblxuICB0aGlzLmNoZWNrRmlsbGVkUmVnaW9ucyA9ICgpID0+IHtcbiAgICBsZXQgcm93cyA9IFtdLCBicmlja3MsIGJyaWNrc0NoZWNrZWQgPSAwO1xuXG4gICAgZm9yIChcbiAgICAgIGxldCBpID0gYm9hcmRIZWlnaHQgLSBicmlja1NpemU7XG4gICAgICBicmlja3NDaGVja2VkICE9PSB0aGlzLnN0YXRpY0JyaWNrcy5sZW5ndGg7XG4gICAgICBpIC09IGJyaWNrU2l6ZVxuICAgICkge1xuICAgICAgYnJpY2tzID0gdGhpcy5zdGF0aWNCcmlja3MuZmlsdGVyKChicmljaykgPT4gYnJpY2sueSA9PT0gaSk7XG5cbiAgICAgIHJvd3MucHVzaCh7XG4gICAgICAgIGJyaWNrczogYnJpY2tzLFxuICAgICAgICBpc0Z1bGw6IGJyaWNrcy5sZW5ndGggPT09IGJvYXJkV2lkdGggLyBicmlja1NpemVcbiAgICAgIH0pO1xuXG4gICAgICBicmlja3NDaGVja2VkICs9IGJyaWNrcy5sZW5ndGg7XG4gICAgfVxuXG4gICAgbGV0IG5ld0JyaWNrcyA9IFtdLCByb3dzQ2xlYXJlZCA9IDA7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJvd3MubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmIChyb3dzW2ldLmlzRnVsbCkge1xuICAgICAgICByb3dzW2ldLmJyaWNrcyA9IFtdO1xuICAgICAgICArK3Jvd3NDbGVhcmVkO1xuICAgICAgICBnYW1lLnBsYXllclNjb3JlLmFkZChyb3dzQ2xlYXJlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByb3dzW2ldLmJyaWNrcy5mb3JFYWNoKChicmljaykgPT4ge1xuICAgICAgICAgIC8vIHRvZG86IGludmVzdGlnYXRlIGJyaWNrLnlcbiAgICAgICAgICAvLyBub2luc3BlY3Rpb24gSlNVbmRlZmluZWRQcm9wZXJ0eUFzc2lnbm1lbnRcbiAgICAgICAgICBicmljay55ICs9IHJvd3NDbGVhcmVkICogYnJpY2tTaXplO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgbmV3QnJpY2tzID0gbmV3QnJpY2tzLmNvbmNhdChyb3dzW2ldLmJyaWNrcyk7XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0aWNCcmlja3MgPSBuZXdCcmlja3M7XG4gIH07XG5cbiAgdGhpcy5jaGVja0NvbGxpc2lvbnMgPSAoY2FsbGJhY2spID0+IHtcbiAgICBjb25zdCBjb2xsaXNpb25zID0gT2JqZWN0LnNlYWwoe1xuICAgICAgbGVmdDogZmFsc2UsXG4gICAgICByaWdodDogZmFsc2UsXG4gICAgICBib3R0b206IGZhbHNlXG4gICAgfSk7XG5cbiAgICBjb25zdCBjaGVja0FnYWluc3QgPSAob2JzdGFjbGUsIHNpZGUpID0+IHtcbiAgICAgIHJldHVybiAoYnJpY2spID0+IHtcbiAgICAgICAgaWYgKG9ic3RhY2xlID09PSAnYm9hcmQnKSB7XG4gICAgICAgICAgc3dpdGNoIChzaWRlKSB7XG4gICAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgICByZXR1cm4gYnJpY2sueSA9PT0gYm9hcmRIZWlnaHQgLSBicmlja1NpemU7XG4gICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgcmV0dXJuIGJyaWNrLnggPT09IDA7XG4gICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICAgIHJldHVybiBicmljay54ID09PSBib2FyZFdpZHRoIC0gYnJpY2tTaXplO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZXQgY29sbGlzaW9uID0gZmFsc2U7XG5cbiAgICAgICAgICB0aGlzLnN0YXRpY0JyaWNrcy5mb3JFYWNoKChzdGF0aWNCcmljaykgPT4ge1xuICAgICAgICAgICAgc3dpdGNoIChzaWRlKSB7XG4gICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6IHtcbiAgICAgICAgICAgICAgICBjb2xsaXNpb24gPSBjb2xsaXNpb24gfHxcbiAgICAgICAgICAgICAgICAgIGJyaWNrLnkgPT09IHN0YXRpY0JyaWNrLnkgLSBicmlja1NpemUgJiZcbiAgICAgICAgICAgICAgICAgIGJyaWNrLnggPT09IHN0YXRpY0JyaWNrLng7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjYXNlICdsZWZ0Jzoge1xuICAgICAgICAgICAgICAgIGNvbGxpc2lvbiA9IGNvbGxpc2lvbiB8fFxuICAgICAgICAgICAgICAgICAgYnJpY2sueSA9PT0gc3RhdGljQnJpY2sueSAmJlxuICAgICAgICAgICAgICAgICAgYnJpY2sueCAtIGJyaWNrU2l6ZSA9PT0gc3RhdGljQnJpY2sueDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0Jzoge1xuICAgICAgICAgICAgICAgIGNvbGxpc2lvbiA9IGNvbGxpc2lvbiB8fFxuICAgICAgICAgICAgICAgICAgYnJpY2sueSA9PT0gc3RhdGljQnJpY2sueSAmJlxuICAgICAgICAgICAgICAgICAgYnJpY2sueCArIGJyaWNrU2l6ZSA9PT0gc3RhdGljQnJpY2sueDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuIGNvbGxpc2lvbjtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgdGhpcy5hY3RpdmVTaGFwZS5icmlja3MuZm9yRWFjaCgoYnJpY2spID0+IHtcbiAgICAgIFsnYm90dG9tJywgJ2xlZnQnLCAncmlnaHQnXS5mb3JFYWNoKChzaWRlKSA9PiB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBjaGVja0FnYWluc3QoJ2JvYXJkJywgc2lkZSkoYnJpY2spIHx8XG4gICAgICAgICAgY2hlY2tBZ2FpbnN0KCdzdGF0aWMnLCBzaWRlKShicmljaylcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29sbGlzaW9uc1tzaWRlXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgY2FsbGJhY2soY29sbGlzaW9ucyk7XG4gIH07XG59XG4iLCJpbXBvcnQgU2hhcGUgZnJvbSBcIi4vU2hhcGVcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ29udHJvbHMobGVmdEtleSwgcmlnaHRLZXksIHJvdGF0ZUtleSwgZHJvcEtleSkge1xuICByZXR1cm4ge1xuICAgIFtsZWZ0S2V5XTogU2hhcGUucHJvdG90eXBlLmFjdGlvbnMuTU9WRV9MRUZULFxuICAgIFtyaWdodEtleV06IFNoYXBlLnByb3RvdHlwZS5hY3Rpb25zLk1PVkVfUklHSFQsXG4gICAgW3JvdGF0ZUtleV06IFNoYXBlLnByb3RvdHlwZS5hY3Rpb25zLlJPVEFURSxcbiAgICBbZHJvcEtleV06IFNoYXBlLnByb3RvdHlwZS5hY3Rpb25zLkRST1BcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gSm95c3RpY2soa2V5TWFwKSB7XG4gIGNvbnN0IGtleVN0YXRlcyA9IE9iamVjdC5zZWFsKFxuICAgIE9iamVjdC5hc3NpZ24oe1xuICAgICAgRXNjYXBlOiBmYWxzZSxcbiAgICAgIEVudGVyOiBmYWxzZSxcbiAgICAgIGFueUtleTogZmFsc2VcbiAgICB9LCBrZXlNYXApXG4gICk7XG5cbiAgLy8gdG9kbzogaW52ZXN0aWdhdGUgbGludGVyIHdhcm5pbmdcbiAgT2JqZWN0LmtleXMoa2V5U3RhdGVzKS5mb3JFYWNoKGtleVN0YXRlID0+IGtleVN0YXRlID0gZmFsc2UpO1xuXG4gIGNvbnN0IGNhbGxiYWNrcyA9IHt9LCBrZXlRdWV1ZSA9IFtdO1xuXG4gIGZ1bmN0aW9uIGtleUV2ZW50cyhlKSB7XG4gICAgY29uc3QgaXNEb3duID0gKGUudHlwZSA9PT0gJ2tleWRvd24nKSwga2V5Q29kZSA9IGUuY29kZTtcbiAgICBrZXlTdGF0ZXMuYW55S2V5ID0gaXNEb3duO1xuXG4gICAgaWYgKGlzRG93biAmJiBjYWxsYmFja3MuYW55S2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNhbGxiYWNrcy5hbnlLZXkoa2V5Q29kZSk7XG4gICAgfVxuXG4gICAgaWYgKGtleVN0YXRlc1trZXlDb2RlXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSBpc0Rvd247XG5cbiAgICAgIGlmIChpc0Rvd24pIHtcbiAgICAgICAgaWYgKGtleUNvZGUgaW4ga2V5TWFwKSB7XG4gICAgICAgICAga2V5UXVldWUucHVzaChrZXlDb2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjYWxsYmFja3Nba2V5Q29kZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNhbGxiYWNrc1trZXlDb2RlXSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFB1YmxpY1xuICAgKi9cbiAgcmV0dXJuIHtcbiAgICBrZXlzOiBrZXlTdGF0ZXMsXG4gICAga2V5TWFwLFxuICAgIGtleVF1ZXVlLFxuICAgIHN0YXJ0KCkge1xuICAgICAgYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBrZXlFdmVudHMpO1xuICAgICAgYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGtleUV2ZW50cyk7XG4gICAgfSxcbiAgICBzdG9wKCkge1xuICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBrZXlFdmVudHMpO1xuICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGtleUV2ZW50cyk7XG4gICAgfSxcbiAgICBzZXRDYWxsYmFjayhrZXksIGNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFja3Nba2V5XSA9IGNhbGxiYWNrO1xuICAgIH1cbiAgfTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFJlY29yZGVyKGpveXN0aWNrLCBnYW1lKSB7XG4gIGNvbnN0IHRhcGUgPSBbXTtcbiAgbGV0IGxhc3RGcmFtZSA9IEluZmluaXR5O1xuXG4gIGNvbnN0IHN0YXJ0ID0gKCkgPT4ge1xuICAgIGpveXN0aWNrLnNldENhbGxiYWNrKCdhbnlLZXknLCAoa2V5KSA9PiB7XG4gICAgICB0YXBlLnB1c2goeyBrZXksIGZyYW1lOiBnYW1lLmdldEZyYW1lQ291bnQoKSB9KTtcbiAgICB9KTtcblxuICAgIGpveXN0aWNrLnNldENhbGxiYWNrKCdFc2NhcGUnLCAoKSA9PiB7XG4gICAgICBqb3lzdGljay5zdG9wKCk7XG4gICAgICBsYXN0RnJhbWUgPSBnYW1lLmdldEZyYW1lQ291bnQoKTtcbiAgICAgIHN0b3AoKTtcbiAgICAgIHRhcGUucG9wKCk7XG4gICAgICBwbGF5KCk7XG4gICAgICBnYW1lLnJlc3RhcnQoKTtcbiAgICAgIGdhbWUuc2V0UmFuZG9tU2VlZCgrKG5ldyBEYXRlKCkpKTtcbiAgICB9KTtcbiAgfTtcblxuICBjb25zdCBzdG9wID0gKCkgPT4ge1xuICAgIGpveXN0aWNrLnNldENhbGxiYWNrKCdhbnlLZXknLCB1bmRlZmluZWQpO1xuICAgIGpveXN0aWNrLnNldENhbGxiYWNrKCdFc2NhcGUnLCB1bmRlZmluZWQpO1xuICB9O1xuXG4gIGNvbnN0IHBsYXkgPSAoKSA9PiB7XG4gICAgZ2FtZS5vblByb2NlZWQgPSAoKSA9PiB7XG4gICAgICBpZiAoZ2FtZS5nZXRGcmFtZUNvdW50KCkgIT09IGxhc3RGcmFtZSkge1xuICAgICAgICBnYW1lLmRyYXdSZXBsYXkoKTtcblxuICAgICAgICBpZiAodGFwZS5sZW5ndGggJiYgZ2FtZS5nZXRGcmFtZUNvdW50KCkgPT09IHRhcGVbMF0uZnJhbWUpIHtcbiAgICAgICAgICBqb3lzdGljay5rZXlRdWV1ZS5wdXNoKHRhcGUuc2hpZnQoKS5rZXkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnYW1lLm9uUHJvY2VlZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgam95c3RpY2suc3RhcnQoKTtcbiAgICAgICAgc3RhcnQoKTtcbiAgICAgICAgZ2FtZS5yZXN0YXJ0KCk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvKipcbiAgICogUHVibGljXG4gICAqL1xuICByZXR1cm4ge1xuICAgIHRhcGUsXG4gICAgbGFzdEZyYW1lLFxuICAgIHN0YXJ0LFxuICAgIHN0b3AsXG4gICAgcGxheVxuICB9O1xufVxuIiwiaW1wb3J0IFNlZWRlZFJhbmRvbSBmcm9tIFwiLi9TZWVkZWRSYW5kb21cIjtcbmltcG9ydCBTaGFwZSBmcm9tIFwiLi9TaGFwZVwiO1xuaW1wb3J0IEJvYXJkIGZyb20gXCIuL0JvYXJkXCI7XG5pbXBvcnQgS2V5TWFwIGZyb20gXCIuL0tleU1hcFwiO1xuaW1wb3J0IEpveXN0aWNrIGZyb20gXCIuL0pveXN0aWNrXCI7XG5pbXBvcnQgUmVjb3JkZXIgZnJvbSBcIi4vUmVjb3JkZXJcIjtcblxuLy8gbm9pbnNwZWN0aW9uIEpTVW51c2VkR2xvYmFsU3ltYm9sc1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gR2FtZShjb25maWcpIHtcbiAgY29uc3QgY29udGV4dCA9IGNvbmZpZy5jb250ZXh0O1xuXG4gIGNvbnN0IGtleU1hcHMgPSBbXG4gICAgICBuZXcgS2V5TWFwKCdBcnJvd0xlZnQnLCAnQXJyb3dSaWdodCcsICdBcnJvd1VwJywgJ0Fycm93RG93bicpLFxuICAgICAgbmV3IEtleU1hcCgnS2V5QScsICdLZXlEJywgJ0tleVcnLCAnS2V5UycpLCAvLyBXLUEtUy1EXG4gICAgICBuZXcgS2V5TWFwKCdLZXlIJywgJ0tleUwnLCAnS2V5SycsICdLZXlKJykgIC8vIFZJTVxuICAgIF0sXG4gICAga2V5TWFwID0gT2JqZWN0LmFzc2lnbiguLi5rZXlNYXBzKTtcblxuICAvLyB0b2RvOiBjdXN0b20gY29udHJvbHMgd291bGQgZ28gc29tZXdoZXJlIGhlcmUuLi5cblxuICBjb25zdCBqb3lzdGljayA9IG5ldyBKb3lzdGljayhrZXlNYXApO1xuICBjb25zdCByZWNvcmRlciA9IG5ldyBSZWNvcmRlcihqb3lzdGljaywgdGhpcyk7XG5cbiAgam95c3RpY2suc3RhcnQoKTtcbiAgcmVjb3JkZXIuc3RhcnQoKTtcblxuICB0aGlzLnJhbmRvbVNlZWQgPSArKG5ldyBEYXRlKCkpO1xuICB0aGlzLnJhbmRvbSA9IG5ldyBTZWVkZWRSYW5kb20odGhpcy5yYW5kb21TZWVkKTtcblxuICB0aGlzLnBsYXllclNjb3JlID0gKCgpID0+IHtcbiAgICBsZXQgX3BsYXllclNjb3JlID0gMDtcbiAgICBjb25zdCBzY29yZVRocmVzaG9sZHMgPSBbMTQ5LCA0OSwgMzksIDksIDBdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIF9wbGF5ZXJTY29yZTtcbiAgICAgIH0sXG4gICAgICBzZXQobmV3U2NvcmUpIHtcbiAgICAgICAgX3BsYXllclNjb3JlID0gbmV3U2NvcmU7XG5cbiAgICAgICAgc2NvcmVUaHJlc2hvbGRzLnNvbWUoKHRocmVzaG9sZCwgaW5kZXgpID0+IHtcbiAgICAgICAgICBpZiAobmV3U2NvcmUgPj0gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICBkaWZmaWN1bHR5ID0gNSAtIGluZGV4O1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGFkZChleHRyYVNjb3JlKSB7XG4gICAgICAgIHRoaXMuc2V0KF9wbGF5ZXJTY29yZSArIGV4dHJhU2NvcmUpO1xuICAgICAgfVxuICAgIH07XG4gIH0pKCk7XG5cbiAgbGV0IGJvYXJkID0gbmV3IEJvYXJkKHRoaXMsIGNvbmZpZy5ib2FyZC5ib2FyZFdpZHRoLCBjb25maWcuYm9hcmQuYm9hcmRIZWlnaHQsIGNvbmZpZy5ib2FyZC5icmlja1NpemUsIHRoaXMucmFuZG9tKTtcbiAgbGV0IGZyYW1lQ291bnQgPSAwO1xuICAvLyBub2luc3BlY3Rpb24gSlNVbnVzZWRMb2NhbFN5bWJvbHNcbiAgdGhpcy5vblByb2NlZWQgPSB1bmRlZmluZWQ7XG4gIGxldCBkaWZmaWN1bHR5ID0gMTtcbiAgdGhpcy50dXJib01vZGUgPSBmYWxzZTtcblxuICBjb25zdCBncmF2aXR5SXNBY3RpdmUgPSAoKSA9PiB7XG4gICAgY29uc3QgZ2FtZVNwZWVkcyA9IFtudWxsLCAyNywgMjQsIDE2LCAxMiwgOF07XG5cbiAgICByZXR1cm4gdGhpcy50dXJib01vZGUgfHwgZnJhbWVDb3VudCAlIGdhbWVTcGVlZHNbZGlmZmljdWx0eV0gPT09IDA7XG4gIH07XG5cbiAgdGhpcy5kcmF3UmVwbGF5ID0gKCkgPT4ge1xuICAgIGJvYXJkLmRyYXdSZXBsYXkoY29udGV4dCk7XG4gIH07XG5cbiAgdGhpcy5nZXRGcmFtZUNvdW50ID0gKCkgPT4gZnJhbWVDb3VudDtcblxuICB0aGlzLnJlc3RhcnQgPSAoKSA9PiB7XG4gICAgdGhpcy5yYW5kb20gPSBuZXcgU2VlZGVkUmFuZG9tKHRoaXMucmFuZG9tU2VlZCk7XG4gICAgdGhpcy5wbGF5ZXJTY29yZS5zZXQoMCk7XG4gICAgZnJhbWVDb3VudCA9IDA7XG4gICAgZGlmZmljdWx0eSA9IDE7XG4gICAgdGhpcy50dXJib01vZGUgPSBmYWxzZTtcbiAgICBib2FyZCA9IG5ldyBCb2FyZCh0aGlzLCBjb25maWcuYm9hcmQuYm9hcmRXaWR0aCwgY29uZmlnLmJvYXJkLmJvYXJkSGVpZ2h0LCBjb25maWcuYm9hcmQuYnJpY2tTaXplLCB0aGlzLnJhbmRvbSk7XG4gIH07XG5cbiAgdGhpcy5zZXRSYW5kb21TZWVkID0gKG5ld1NlZWQpID0+IHtcbiAgICB0aGlzLnJhbmRvbVNlZWQgPSBuZXdTZWVkO1xuICB9O1xuXG4gIGNvbnN0IHByb2Nlc3NBY3Rpb24gPSAoYWN0aW9uKSA9PiB7XG4gICAgYm9hcmQuY2hlY2tDb2xsaXNpb25zKChjb2xsaXNpb25zKSA9PiB7XG4gICAgICBib2FyZC5hY3RpdmVTaGFwZS5pc0Zyb3plbiA9IGNvbGxpc2lvbnMuYm90dG9tO1xuXG4gICAgICBzd2l0Y2ggKHRydWUpIHtcbiAgICAgICAgY2FzZSBhY3Rpb24gPT09IFNoYXBlLnByb3RvdHlwZS5hY3Rpb25zLlJPVEFURSAmJiBjYW50QmVSb3RhdGVkKCk6XG4gICAgICAgIGNhc2UgYWN0aW9uID09PSBTaGFwZS5wcm90b3R5cGUuYWN0aW9ucy5NT1ZFX1JJR0hUICYmIGNvbGxpc2lvbnMucmlnaHQ6XG4gICAgICAgIGNhc2UgYWN0aW9uID09PSBTaGFwZS5wcm90b3R5cGUuYWN0aW9ucy5NT1ZFX0xFRlQgJiYgY29sbGlzaW9ucy5sZWZ0OlxuICAgICAgICBjYXNlIGFjdGlvbiA9PT0gU2hhcGUucHJvdG90eXBlLmFjdGlvbnMuRkFMTCAmJiBjb2xsaXNpb25zLmJvdHRvbTpcbiAgICAgICAgY2FzZSBhY3Rpb24gPT09IFNoYXBlLnByb3RvdHlwZS5hY3Rpb25zLkRST1AgJiYgY29sbGlzaW9ucy5ib3R0b206XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAoYWN0aW9uID09PSBTaGFwZS5wcm90b3R5cGUuYWN0aW9ucy5EUk9QKSB7XG4gICAgICAgICAgICB0aGlzLnR1cmJvTW9kZSA9IHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYm9hcmQuYWN0aXZlU2hhcGUucGVyZm9ybUFjdGlvbihhY3Rpb24pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBjYW50QmVSb3RhdGVkKCkge1xuICAgICAgICBjb25zdCB0ZW1wID0gYm9hcmQuc3Bhd25TaGFwZSgpO1xuXG4gICAgICAgIHRlbXAub3JpZW50YWlvbiA9IGJvYXJkLmFjdGl2ZVNoYXBlLm9yaWVudGFpb247XG4gICAgICAgIHRlbXAudHlwZSA9IGJvYXJkLmFjdGl2ZVNoYXBlLnR5cGU7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyArK2kpIHtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAgdGVtcC5icmlja3NbaV0sXG4gICAgICAgICAgICBib2FyZC5hY3RpdmVTaGFwZS5icmlja3NbaV1cbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGVtcC5wZXJmb3JtQWN0aW9uKFNoYXBlLnByb3RvdHlwZS5hY3Rpb25zLlJPVEFURSk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyArK2kpIHtcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGJvYXJkLnN0YXRpY0JyaWNrcy5sZW5ndGg7ICsraikge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICB0ZW1wLmJyaWNrc1tpXS54ID09PSBib2FyZC5zdGF0aWNCcmlja3Nbal0ueCAmJlxuICAgICAgICAgICAgICB0ZW1wLmJyaWNrc1tpXS55ID09PSBib2FyZC5zdGF0aWNCcmlja3Nbal0ueVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIHRlbXAuYnJpY2tzW2ldLnggPj0gY29uZmlnLmJvYXJkLmJvYXJkV2lkdGggfHxcbiAgICAgICAgICAgIHRlbXAuYnJpY2tzW2ldLnggPD0gMCB8fFxuICAgICAgICAgICAgdGVtcC5icmlja3NbaV0ueSA+PSBjb25maWcuYm9hcmQuYm9hcmRIZWlnaHRcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBjb25zdCByZWFkQWN0aW9uID0gKCkgPT4ge1xuICAgIGNvbnN0IG5leHRLZXkgPSBqb3lzdGljay5rZXlRdWV1ZS5zaGlmdCgpO1xuICAgIHByb2Nlc3NBY3Rpb24oam95c3RpY2sua2V5TWFwW25leHRLZXldKTtcblxuICAgIGJvYXJkLmNoZWNrQ29sbGlzaW9ucygoY29sbGlzaW9ucykgPT4ge1xuICAgICAgYm9hcmQuYWN0aXZlU2hhcGUuaXNGcm96ZW4gPSBjb2xsaXNpb25zLmJvdHRvbTtcbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLnByb2NlZWQgPSAoKSA9PiB7XG4gICAgKytmcmFtZUNvdW50O1xuICAgIGJvYXJkLmRyYXdCYWNrZ3JvdW5kKGNvbnRleHQpO1xuXG4gICAgaWYgKHRoaXMub25Qcm9jZWVkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMub25Qcm9jZWVkKCk7XG4gICAgfVxuXG4gICAgcmVhZEFjdGlvbigpO1xuXG4gICAgaWYgKGJvYXJkLmFjdGl2ZVNoYXBlLmlzRnJvemVuKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7ICsraSkge1xuICAgICAgICBib2FyZC5zdGF0aWNCcmlja3MucHVzaChib2FyZC5hY3RpdmVTaGFwZS5icmlja3MucG9wKCkpO1xuICAgICAgfVxuXG4gICAgICBib2FyZC5jaGVja0ZpbGxlZFJlZ2lvbnMoKTtcbiAgICAgIHRoaXMudHVyYm9Nb2RlID0gZmFsc2U7XG4gICAgICBib2FyZC5hY3RpdmVTaGFwZSA9IGJvYXJkLnNwYXduU2hhcGUoKTtcblxuICAgICAgaWYgKGJvYXJkLmlzRnVsbCgpKSB7XG4gICAgICAgIHRoaXMucmVzdGFydCgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZ3Jhdml0eUlzQWN0aXZlKCkpIHtcbiAgICAgICAgcHJvY2Vzc0FjdGlvbihTaGFwZS5wcm90b3R5cGUuYWN0aW9ucy5GQUxMKTtcbiAgICAgIH1cblxuICAgICAgYm9hcmQuYWN0aXZlU2hhcGUuZHJhdyhjb250ZXh0KTtcbiAgICB9XG5cbiAgICBib2FyZC5kcmF3U3RhdGljQnJpY2tzKGNvbnRleHQpO1xuICAgIGJvYXJkLmRyYXdTY29yZShjb250ZXh0KTtcbiAgfTtcblxuICBjb25zdCBtYWluTG9vcCA9ICgpID0+IHtcbiAgICB0aGlzLnByb2NlZWQoKTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobWFpbkxvb3ApO1xuICB9O1xuXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShtYWluTG9vcCk7XG59Il0sIm5hbWVzIjpbIktleU1hcCJdLCJtYXBwaW5ncyI6Ijs7O0VBQWUsU0FBUyxZQUFZLENBQUMsSUFBSSxFQUFFO0VBQzNDLEVBQUUsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDLENBQUM7O0VBRW5DLEVBQUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxZQUFZO0VBQzdCLElBQUksT0FBTyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxL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QUMsQ0FBQyxFQUFFO0VBQ25ELElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDdEQsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRTtFQUN0RCxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDcEQsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDckQsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtFQUN0RCxHQUFHO0VBQ0gsRUFBRSxZQUFZLEVBQUU7RUFDaEIsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUs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
