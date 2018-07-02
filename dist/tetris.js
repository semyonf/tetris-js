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

    const mainLoop = () => {
      this.proceed();
      requestAnimationFrame(mainLoop);
    };

    requestAnimationFrame(mainLoop);
  }

  return Game;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV0cmlzLmpzIiwic291cmNlcyI6WyIuLi9zcmMvU2VlZGVkUmFuZG9tLmpzIiwiLi4vc3JjL0JyaWNrLmpzIiwiLi4vc3JjL1NoYXBlLmpzIiwiLi4vc3JjL0JvYXJkLmpzIiwiLi4vc3JjL0tleU1hcC5qcyIsIi4uL3NyYy9Kb3lzdGljay5qcyIsIi4uL3NyYy9SZWNvcmRlci5qcyIsIi4uL3NyYy9HYW1lLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNlZWRlZFJhbmRvbShzZWVkKSB7XG4gIHRoaXMuX3NlZWQgPSAoc2VlZCAlIDIxNDc0ODM2NDcpO1xuXG4gIHRoaXMubmV4dEludCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2VlZCA9IHRoaXMuX3NlZWQgKiAxNjgwNyAlIDIxNDc0ODM2NDc7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJhbmRvbSBpbnRlZ2VyIGdlbmVyYXRvclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWF4IC0gbm90IGluY2x1ZGVkXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbbWluXSAtIGluY2x1ZGVkXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICB0aGlzLm5leHRJblJhbmdlID0gZnVuY3Rpb24gKG1heCwgbWluKSB7XG4gICAgbWluID0gKG1pbiA9PT0gdW5kZWZpbmVkKSA/IDAgOiBtaW47XG4gICAgLS1tYXg7XG5cbiAgICByZXR1cm4gTWF0aC5mbG9vcihtaW4gKyB0aGlzLm5leHRGbG9hdCgpICogKG1heCArIDEgLSBtaW4pKTtcbiAgfTtcblxuICB0aGlzLm5leHRGbG9hdCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKHRoaXMubmV4dEludCgpIC0gMSkgLyAyMTQ3NDgzNjQ2O1xuICB9O1xuXG4gIGlmICh0aGlzLl9zZWVkIDw9IDApIHtcbiAgICB0aGlzLl9zZWVkICs9IDIxNDc0ODM2NDY7XG4gIH1cbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBCcmljayh4LCB5LCByZ2IsIGJyaWNrU2l6ZSkge1xuICB0aGlzLnggPSB4O1xuICB0aGlzLnkgPSB5O1xuICB0aGlzLnJnYiA9IHJnYjtcbiAgdGhpcy5kcmF3ID0gKGNvbnRleHQpID0+IHtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMucmdiO1xuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5tb3ZlVG8odGhpcy54LCB0aGlzLnkpO1xuICAgIGNvbnRleHQubGluZVRvKHRoaXMueCArIGJyaWNrU2l6ZSAtIDEsIHRoaXMueSk7XG4gICAgY29udGV4dC5saW5lVG8odGhpcy54LCB0aGlzLnkgKyBicmlja1NpemUgLSAxKTtcbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIGNvbnRleHQuZmlsbCgpO1xuXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBtb2RpZnlSZ2IodGhpcy5yZ2IsIDAuOSk7XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0Lm1vdmVUbyh0aGlzLnggKyBicmlja1NpemUgLSAxLCB0aGlzLnkpO1xuICAgIGNvbnRleHQubGluZVRvKHRoaXMueCwgdGhpcy55ICsgYnJpY2tTaXplIC0gMSk7XG4gICAgY29udGV4dC5saW5lVG8odGhpcy54LCB0aGlzLnkgKyBicmlja1NpemUgLSAxKTtcbiAgICBjb250ZXh0LmxpbmVUbyh0aGlzLnggKyBicmlja1NpemUgLSAxLCB0aGlzLnkgKyBicmlja1NpemUgLSAxKTtcbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIGNvbnRleHQuZmlsbCgpO1xuICB9O1xuXG4gIHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIEEgZnVuY3Rpb24gdG8gZGFya2VuIG9yIGxpZ2h0ZW4gcmdiIGNvbG9yIHN0cmluZ3NcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvclxuICogQHBhcmFtIHtudW1iZXJ9IGZhY3RvclxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gbW9kaWZ5UmdiKGNvbG9yLCBmYWN0b3IpIHtcbiAgY29uc3RcbiAgICByZWdleHAgPSAvcmdiXFwoKFxcZCspLChcXGQrKSwoXFxkKylcXCkvZyxcbiAgICBtYXRjaGVzID0gcmVnZXhwLmV4ZWMoY29sb3IpO1xuXG4gIGxldFxuICAgIGNvbG9ycyA9IFtcbiAgICAgIG1hdGNoZXNbMV0sXG4gICAgICBtYXRjaGVzWzJdLFxuICAgICAgbWF0Y2hlc1szXVxuICAgIF07XG5cbiAgY29sb3JzLmZvckVhY2goZnVuY3Rpb24gKGNvbG9yLCBpbmRleCwgY29sb3JzKSB7XG4gICAgY29sb3JzW2luZGV4XSA9IE1hdGguZmxvb3IoY29sb3IgKiBmYWN0b3IpO1xuICB9KTtcblxuICByZXR1cm4gYHJnYigke2NvbG9yc1swXX0sICR7Y29sb3JzWzFdfSwgJHtjb2xvcnNbMl19KWA7XG59XG4iLCJpbXBvcnQgQnJpY2sgZnJvbSAnLi9Ccmljay5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNoYXBlKGJvYXJkV2lkdGgsIGJyaWNrU2l6ZSwgcmFuZG9tKSB7XG4gIHRoaXMuc3RhcnRYID0gYm9hcmRXaWR0aCAvIDI7XG4gIHRoaXMuc3RhcnRZID0gYnJpY2tTaXplO1xuICB0aGlzLmlzRnJvemVuID0gZmFsc2U7XG4gIHRoaXMuY29sb3IgPSByYW5kb20ubmV4dEluUmFuZ2UoU2hhcGUucHJvdG90eXBlLnBhcmFtZXRlcnMuY29sb3JzLmxlbmd0aCk7XG4gIHRoaXMudHlwZSA9IHJhbmRvbS5uZXh0SW5SYW5nZShTaGFwZS5wcm90b3R5cGUucGFyYW1ldGVycy50eXBlcy5sZW5ndGgpO1xuICB0aGlzLm9yaWVudGFpb24gPSByYW5kb20ubmV4dEluUmFuZ2UoU2hhcGUucHJvdG90eXBlLnBhcmFtZXRlcnMub3JpZW50YXRpb25zLmxlbmd0aCk7XG4gIHRoaXMuYnJpY2tzID0gW107XG5cbiAgdGhpcy5kcmF3ID0gKGNvbnRleHQpID0+IHtcbiAgICB0aGlzLmJyaWNrcy5mb3JFYWNoKChicmljaykgPT4gYnJpY2suZHJhdyhjb250ZXh0KSk7XG4gIH07XG5cbiAgdGhpcy5wZXJmb3JtQWN0aW9uID0gKG1vdmVtZW50KSA9PiB7XG4gICAgc3dpdGNoIChtb3ZlbWVudCkge1xuICAgICAgY2FzZSBTaGFwZS5wcm90b3R5cGUuYWN0aW9ucy5ST1RBVEU6XG4gICAgICAgIGlmIChTaGFwZS5wcm90b3R5cGUucGFyYW1ldGVycy50eXBlc1t0aGlzLnR5cGVdLm5hbWUgIT09ICdPJykge1xuICAgICAgICAgIHRoaXMub3JpZW50YWlvbiA9ICh0aGlzLm9yaWVudGFpb24gPT09IDMpID8gMCA6ICsrdGhpcy5vcmllbnRhaW9uO1xuICAgICAgICAgIHRoaXMuYXBwbHlPcmllbnRhdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFNoYXBlLnByb3RvdHlwZS5hY3Rpb25zLkZBTEw6XG4gICAgICAgIHRoaXMuYnJpY2tzLmZvckVhY2goZnVuY3Rpb24gKGJyaWNrKSB7XG4gICAgICAgICAgYnJpY2sueSArPSBicmlja1NpemU7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBTaGFwZS5wcm90b3R5cGUuYWN0aW9ucy5NT1ZFX1JJR0hUOlxuICAgICAgY2FzZSBTaGFwZS5wcm90b3R5cGUuYWN0aW9ucy5NT1ZFX0xFRlQ6XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgKytpKSB7XG4gICAgICAgICAgaWYgKG1vdmVtZW50ID09PSBTaGFwZS5wcm90b3R5cGUuYWN0aW9ucy5NT1ZFX0xFRlQpIHtcbiAgICAgICAgICAgIHRoaXMuYnJpY2tzW2ldLnggLT0gYnJpY2tTaXplO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmJyaWNrc1tpXS54ICs9IGJyaWNrU2l6ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgU2hhcGUucHJvdG90eXBlLmFjdGlvbnMuRFJPUDpcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdGhpcy5hcHBseU9yaWVudGF0aW9uID0gKCkgPT4ge1xuICAgIGNvbnN0XG4gICAgICB0eXBlID0gU2hhcGUucHJvdG90eXBlLnBhcmFtZXRlcnMudHlwZXNbdGhpcy50eXBlXS5tYXRyaXgsXG4gICAgICBvcmllbnRhdGlvbiA9IFNoYXBlLnByb3RvdHlwZS5wYXJhbWV0ZXJzLm9yaWVudGF0aW9uc1t0aGlzLm9yaWVudGFpb25dLm1hdHJpeDtcblxuICAgIGxldCBvcmllbnRlZCA9IFtdO1xuXG4gICAgLy8gRG90IHByb2R1Y3Qgb2YgYSB0eXBlIG1hdHJpeCBhbmQgYW4gb3JpZW50YXRpb24gbWF0cml4XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzOyArK2kpIHtcbiAgICAgIG9yaWVudGVkW2ldID0gW107XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDI7ICsraikge1xuICAgICAgICBvcmllbnRlZFtpXVtqXSA9IDA7XG4gICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgMjsgKytrKSB7XG4gICAgICAgICAgb3JpZW50ZWRbaV1bal0gKz0gdHlwZVtpXVtrXSAqIG9yaWVudGF0aW9uW2tdW2pdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgY2VudGVyID0gdGhpcy5icmlja3NbMF07XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDM7ICsraSkge1xuICAgICAgdGhpcy5icmlja3NbaSArIDFdLnggPSBjZW50ZXIueCArIG9yaWVudGVkW2ldWzBdICogYnJpY2tTaXplO1xuICAgICAgdGhpcy5icmlja3NbaSArIDFdLnkgPSBjZW50ZXIueSArIG9yaWVudGVkW2ldWzFdICogYnJpY2tTaXplO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgKytpKSB7XG4gICAgdGhpcy5icmlja3MucHVzaChuZXcgQnJpY2soXG4gICAgICB0aGlzLnN0YXJ0WCxcbiAgICAgIHRoaXMuc3RhcnRZLFxuICAgICAgU2hhcGUucHJvdG90eXBlLnBhcmFtZXRlcnMuY29sb3JzW3RoaXMuY29sb3JdLnJnYixcbiAgICAgIGJyaWNrU2l6ZVxuICAgICkpO1xuICB9XG5cbiAgdGhpcy5hcHBseU9yaWVudGF0aW9uKCk7XG5cbiAgcmV0dXJuIHRoaXM7XG59XG5cblNoYXBlLnByb3RvdHlwZS5wYXJhbWV0ZXJzID0gT2JqZWN0LmZyZWV6ZSh7XG4gIHR5cGVzOiBbXG4gICAgeyBuYW1lOiAnSScsIG1hdHJpeDogW1swLCAtMV0sIFswLCAxXSwgWzAsIDJdXSB9LFxuICAgIHsgbmFtZTogJ08nLCBtYXRyaXg6IFtbMCwgMV0sIFsxLCAwXSwgWzEsIDFdXSB9LFxuICAgIHsgbmFtZTogJ1onLCBtYXRyaXg6IFtbMCwgLTFdLCBbLTEsIDBdLCBbMSwgLTFdXSB9LFxuICAgIHsgbmFtZTogJ1MnLCBtYXRyaXg6IFtbLTEsIC0xXSwgWzAsIC0xXSwgWzEsIDBdXSB9LFxuICAgIHsgbmFtZTogJ1QnLCBtYXRyaXg6IFtbMSwgMF0sIFstMSwgMF0sIFswLCAxXV0gfSxcbiAgICB7IG5hbWU6ICdKJywgbWF0cml4OiBbWzEsIDBdLCBbLTEsIDBdLCBbLTEsIDFdXSB9LFxuICAgIHsgbmFtZTogJ0wnLCBtYXRyaXg6IFtbMSwgMF0sIFstMSwgMF0sIFstMSwgLTFdXSB9XG4gIF0sXG4gIG9yaWVudGF0aW9uczogW1xuICAgIHsgYW5nbGU6IDAsIG1hdHJpeDogW1sxLCAwXSwgWzAsIDFdXSB9LFxuICAgIHsgYW5nbGU6IDkwLCBtYXRyaXg6IFtbMCwgLTFdLCBbMSwgMF1dIH0sXG4gICAgeyBhbmdsZTogMTgwLCBtYXRyaXg6IFtbLTEsIDBdLCBbMCwgLTFdXSB9LFxuICAgIHsgYW5nbGU6IDI3MCwgbWF0cml4OiBbWzAsIDFdLCBbLTEsIDBdXSB9XG4gIF0sXG4gIGNvbG9yczogW1xuICAgIHsgbmFtZTogJ29yYW5nZScsIHJnYjogJ3JnYigyMzksMTA4LDApJyB9LFxuICAgIHsgbmFtZTogJ3JlZCcsIHJnYjogJ3JnYigyMTEsNDcsNDcpJyB9LFxuICAgIHsgbmFtZTogJ2dyZWVuJywgcmdiOiAncmdiKDc2LDE3NSw4MCknIH0sXG4gICAgeyBuYW1lOiAnYmx1ZScsIHJnYjogJ3JnYigzMywxNTAsMjQzKScgfSxcbiAgICB7IG5hbWU6ICd5ZWxsb3cnLCByZ2I6ICdyZ2IoMjU1LDIzNSw1OSknIH0sXG4gICAgeyBuYW1lOiAnY3lhbicsIHJnYjogJ3JnYigwLDE4OCwyMTIpJyB9LFxuICAgIHsgbmFtZTogJ3BpbmsnLCByZ2I6ICdyZ2IoMjMzLDMwLDk5KScgfSxcbiAgICB7IG5hbWU6ICd3aGl0ZScsIHJnYjogJ3JnYigyMjQsMjI0LDIyNCknIH1cbiAgXVxufSk7XG5cblNoYXBlLnByb3RvdHlwZS5hY3Rpb25zID0gT2JqZWN0LmZyZWV6ZSh7XG4gIFJPVEFURTogJ3JvdGF0ZScsXG4gIE1PVkVfTEVGVDogJ21vdmUtbGVmdCcsXG4gIE1PVkVfUklHSFQ6ICdtb3ZlLXJpZ2h0JyxcbiAgRkFMTDogJ2ZhbGwnLFxuICBEUk9QOiAnZHJvcCdcbn0pO1xuIiwiaW1wb3J0IFNoYXBlIGZyb20gXCIuL1NoYXBlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEJvYXJkKGdhbWUsIGJvYXJkV2lkdGgsIGJvYXJkSGVpZ2h0LCBicmlja1NpemUsIHJhbmRvbSkge1xuICBjb25zdCBjb2xvcnMgPSB7XG4gICAgbm9ybWFsOiAncmdiKDY5LDkwLDEwMCknLFxuICAgIHR1cmJvOiAncmdiYSg2OSw5MCwxMDAsMC4xMiknXG4gIH07XG5cbiAgdGhpcy5zcGF3blNoYXBlID0gKCkgPT4gbmV3IFNoYXBlKGJvYXJkV2lkdGgsIGJyaWNrU2l6ZSwgcmFuZG9tKTtcbiAgdGhpcy5hY3RpdmVTaGFwZSA9IHRoaXMuc3Bhd25TaGFwZSgpO1xuICB0aGlzLnN0YXRpY0JyaWNrcyA9IFtdO1xuXG4gIHRoaXMuZHJhd1N0YXRpY0JyaWNrcyA9IChjb250ZXh0KSA9PiB7XG4gICAgdGhpcy5zdGF0aWNCcmlja3MuZm9yRWFjaCgoc3RhdGljQnJpY2spID0+IHN0YXRpY0JyaWNrLmRyYXcoY29udGV4dCkpO1xuICB9O1xuXG4gIHRoaXMuZHJhd0JhY2tncm91bmQgPSAoY29udGV4dCkgPT4ge1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gZ2FtZS50dXJib01vZGUgPyBjb2xvcnMudHVyYm8gOiBjb2xvcnMubm9ybWFsO1xuICAgIGNvbnRleHQuZmlsbFJlY3QoMCwgMCwgYm9hcmRXaWR0aCwgYm9hcmRIZWlnaHQpO1xuICB9O1xuXG4gIHRoaXMuZHJhd1JlcGxheSA9IChjb250ZXh0KSA9PiB7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgIGNvbnRleHQuZm9udCA9ICcxMnB4IENvdXJpZXInO1xuICAgIGNvbnRleHQuZmlsbFRleHQoJ1JFUExBWS4uLicsIDAsIDIwKTtcbiAgfTtcblxuICB0aGlzLmRyYXdTY29yZSA9IChjb250ZXh0KSA9PiB7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgIGNvbnRleHQuZm9udCA9ICcxMnB4IENvdXJpZXInO1xuICAgIGNvbnRleHQuZmlsbFRleHQoJ1Njb3JlOiAnICsgZ2FtZS5wbGF5ZXJTY29yZS5nZXQoKSwgMCwgMTApO1xuICB9O1xuXG4gIHRoaXMuaXNGdWxsID0gKCkgPT4gdGhpcy5zdGF0aWNCcmlja3Muc29tZSgoYnJpY2spID0+IGJyaWNrLnkgPCBicmlja1NpemUgKiAyKTtcblxuICB0aGlzLmNoZWNrRmlsbGVkUmVnaW9ucyA9ICgpID0+IHtcbiAgICBsZXQgcm93cyA9IFtdLCBicmlja3MsIGJyaWNrc0NoZWNrZWQgPSAwO1xuXG4gICAgZm9yIChcbiAgICAgIGxldCBpID0gYm9hcmRIZWlnaHQgLSBicmlja1NpemU7XG4gICAgICBicmlja3NDaGVja2VkICE9PSB0aGlzLnN0YXRpY0JyaWNrcy5sZW5ndGg7XG4gICAgICBpIC09IGJyaWNrU2l6ZVxuICAgICkge1xuICAgICAgYnJpY2tzID0gdGhpcy5zdGF0aWNCcmlja3MuZmlsdGVyKChicmljaykgPT4gYnJpY2sueSA9PT0gaSk7XG5cbiAgICAgIHJvd3MucHVzaCh7XG4gICAgICAgIGJyaWNrczogYnJpY2tzLFxuICAgICAgICBpc0Z1bGw6IGJyaWNrcy5sZW5ndGggPT09IGJvYXJkV2lkdGggLyBicmlja1NpemVcbiAgICAgIH0pO1xuXG4gICAgICBicmlja3NDaGVja2VkICs9IGJyaWNrcy5sZW5ndGg7XG4gICAgfVxuXG4gICAgbGV0IG5ld0JyaWNrcyA9IFtdLCByb3dzQ2xlYXJlZCA9IDA7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJvd3MubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmIChyb3dzW2ldLmlzRnVsbCkge1xuICAgICAgICByb3dzW2ldLmJyaWNrcyA9IFtdO1xuICAgICAgICArK3Jvd3NDbGVhcmVkO1xuICAgICAgICBnYW1lLnBsYXllclNjb3JlLmFkZChyb3dzQ2xlYXJlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByb3dzW2ldLmJyaWNrcy5mb3JFYWNoKChicmljaykgPT4ge1xuICAgICAgICAgIC8vIHRvZG86IGludmVzdGlnYXRlIGJyaWNrLnlcbiAgICAgICAgICAvLyBub2luc3BlY3Rpb24gSlNVbmRlZmluZWRQcm9wZXJ0eUFzc2lnbm1lbnRcbiAgICAgICAgICBicmljay55ICs9IHJvd3NDbGVhcmVkICogYnJpY2tTaXplO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgbmV3QnJpY2tzID0gbmV3QnJpY2tzLmNvbmNhdChyb3dzW2ldLmJyaWNrcyk7XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0aWNCcmlja3MgPSBuZXdCcmlja3M7XG4gIH07XG5cbiAgdGhpcy5jaGVja0NvbGxpc2lvbnMgPSAoY2FsbGJhY2spID0+IHtcbiAgICBjb25zdCBjb2xsaXNpb25zID0gT2JqZWN0LnNlYWwoe1xuICAgICAgbGVmdDogZmFsc2UsXG4gICAgICByaWdodDogZmFsc2UsXG4gICAgICBib3R0b206IGZhbHNlXG4gICAgfSk7XG5cbiAgICBjb25zdCBjaGVja0FnYWluc3QgPSAob2JzdGFjbGUsIHNpZGUpID0+IHtcbiAgICAgIHJldHVybiAoYnJpY2spID0+IHtcbiAgICAgICAgaWYgKG9ic3RhY2xlID09PSAnYm9hcmQnKSB7XG4gICAgICAgICAgc3dpdGNoIChzaWRlKSB7XG4gICAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgICByZXR1cm4gYnJpY2sueSA9PT0gYm9hcmRIZWlnaHQgLSBicmlja1NpemU7XG4gICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgcmV0dXJuIGJyaWNrLnggPT09IDA7XG4gICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICAgIHJldHVybiBicmljay54ID09PSBib2FyZFdpZHRoIC0gYnJpY2tTaXplO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZXQgY29sbGlzaW9uID0gZmFsc2U7XG5cbiAgICAgICAgICB0aGlzLnN0YXRpY0JyaWNrcy5mb3JFYWNoKChzdGF0aWNCcmljaykgPT4ge1xuICAgICAgICAgICAgc3dpdGNoIChzaWRlKSB7XG4gICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6IHtcbiAgICAgICAgICAgICAgICBjb2xsaXNpb24gPSBjb2xsaXNpb24gfHxcbiAgICAgICAgICAgICAgICAgIGJyaWNrLnkgPT09IHN0YXRpY0JyaWNrLnkgLSBicmlja1NpemUgJiZcbiAgICAgICAgICAgICAgICAgIGJyaWNrLnggPT09IHN0YXRpY0JyaWNrLng7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjYXNlICdsZWZ0Jzoge1xuICAgICAgICAgICAgICAgIGNvbGxpc2lvbiA9IGNvbGxpc2lvbiB8fFxuICAgICAgICAgICAgICAgICAgYnJpY2sueSA9PT0gc3RhdGljQnJpY2sueSAmJlxuICAgICAgICAgICAgICAgICAgYnJpY2sueCAtIGJyaWNrU2l6ZSA9PT0gc3RhdGljQnJpY2sueDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0Jzoge1xuICAgICAgICAgICAgICAgIGNvbGxpc2lvbiA9IGNvbGxpc2lvbiB8fFxuICAgICAgICAgICAgICAgICAgYnJpY2sueSA9PT0gc3RhdGljQnJpY2sueSAmJlxuICAgICAgICAgICAgICAgICAgYnJpY2sueCArIGJyaWNrU2l6ZSA9PT0gc3RhdGljQnJpY2sueDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuIGNvbGxpc2lvbjtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgdGhpcy5hY3RpdmVTaGFwZS5icmlja3MuZm9yRWFjaCgoYnJpY2spID0+IHtcbiAgICAgIFsnYm90dG9tJywgJ2xlZnQnLCAncmlnaHQnXS5mb3JFYWNoKChzaWRlKSA9PiB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBjaGVja0FnYWluc3QoJ2JvYXJkJywgc2lkZSkoYnJpY2spIHx8XG4gICAgICAgICAgY2hlY2tBZ2FpbnN0KCdzdGF0aWMnLCBzaWRlKShicmljaylcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29sbGlzaW9uc1tzaWRlXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgY2FsbGJhY2soY29sbGlzaW9ucyk7XG4gIH07XG59XG4iLCJpbXBvcnQgU2hhcGUgZnJvbSBcIi4vU2hhcGVcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ29udHJvbHMobGVmdEtleSwgcmlnaHRLZXksIHJvdGF0ZUtleSwgZHJvcEtleSkge1xuICByZXR1cm4ge1xuICAgIFtsZWZ0S2V5XTogU2hhcGUucHJvdG90eXBlLmFjdGlvbnMuTU9WRV9MRUZULFxuICAgIFtyaWdodEtleV06IFNoYXBlLnByb3RvdHlwZS5hY3Rpb25zLk1PVkVfUklHSFQsXG4gICAgW3JvdGF0ZUtleV06IFNoYXBlLnByb3RvdHlwZS5hY3Rpb25zLlJPVEFURSxcbiAgICBbZHJvcEtleV06IFNoYXBlLnByb3RvdHlwZS5hY3Rpb25zLkRST1BcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gSm95c3RpY2soa2V5TWFwKSB7XG4gIGNvbnN0IGtleVN0YXRlcyA9IE9iamVjdC5zZWFsKFxuICAgIE9iamVjdC5hc3NpZ24oe1xuICAgICAgRXNjYXBlOiBmYWxzZSxcbiAgICAgIEVudGVyOiBmYWxzZSxcbiAgICAgIGFueUtleTogZmFsc2VcbiAgICB9LCBrZXlNYXApXG4gICk7XG5cbiAgLy8gdG9kbzogaW52ZXN0aWdhdGUgbGludGVyIHdhcm5pbmdcbiAgT2JqZWN0LmtleXMoa2V5U3RhdGVzKS5mb3JFYWNoKGtleVN0YXRlID0+IGtleVN0YXRlID0gZmFsc2UpO1xuXG4gIGNvbnN0IGNhbGxiYWNrcyA9IHt9LCBrZXlRdWV1ZSA9IFtdO1xuXG4gIGZ1bmN0aW9uIGtleUV2ZW50cyhlKSB7XG4gICAgY29uc3QgaXNEb3duID0gKGUudHlwZSA9PT0gJ2tleWRvd24nKSwga2V5Q29kZSA9IGUuY29kZTtcbiAgICBrZXlTdGF0ZXMuYW55S2V5ID0gaXNEb3duO1xuXG4gICAgaWYgKGlzRG93biAmJiBjYWxsYmFja3MuYW55S2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNhbGxiYWNrcy5hbnlLZXkoa2V5Q29kZSk7XG4gICAgfVxuXG4gICAgaWYgKGtleVN0YXRlc1trZXlDb2RlXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBrZXlTdGF0ZXNba2V5Q29kZV0gPSBpc0Rvd247XG5cbiAgICAgIGlmIChpc0Rvd24pIHtcbiAgICAgICAgaWYgKGtleUNvZGUgaW4ga2V5TWFwKSB7XG4gICAgICAgICAga2V5UXVldWUucHVzaChrZXlDb2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjYWxsYmFja3Nba2V5Q29kZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNhbGxiYWNrc1trZXlDb2RlXSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFB1YmxpY1xuICAgKi9cbiAgcmV0dXJuIHtcbiAgICBrZXlzOiBrZXlTdGF0ZXMsXG4gICAga2V5TWFwLFxuICAgIGtleVF1ZXVlLFxuICAgIHN0YXJ0KCkge1xuICAgICAgYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBrZXlFdmVudHMpO1xuICAgICAgYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGtleUV2ZW50cyk7XG4gICAgfSxcbiAgICBzdG9wKCkge1xuICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBrZXlFdmVudHMpO1xuICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGtleUV2ZW50cyk7XG4gICAgfSxcbiAgICBzZXRDYWxsYmFjayhrZXksIGNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFja3Nba2V5XSA9IGNhbGxiYWNrO1xuICAgIH1cbiAgfTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFJlY29yZGVyKGpveXN0aWNrLCBnYW1lKSB7XG4gIGNvbnN0IHRhcGUgPSBbXTtcbiAgbGV0IGxhc3RGcmFtZSA9IEluZmluaXR5O1xuXG4gIGNvbnN0IHN0YXJ0ID0gKCkgPT4ge1xuICAgIGpveXN0aWNrLnNldENhbGxiYWNrKCdhbnlLZXknLCAoa2V5KSA9PiB7XG4gICAgICB0YXBlLnB1c2goeyBrZXksIGZyYW1lOiBnYW1lLmdldEZyYW1lQ291bnQoKSB9KTtcbiAgICB9KTtcblxuICAgIGpveXN0aWNrLnNldENhbGxiYWNrKCdFc2NhcGUnLCAoKSA9PiB7XG4gICAgICBqb3lzdGljay5zdG9wKCk7XG4gICAgICBsYXN0RnJhbWUgPSBnYW1lLmdldEZyYW1lQ291bnQoKTtcbiAgICAgIHN0b3AoKTtcbiAgICAgIHRhcGUucG9wKCk7XG4gICAgICBwbGF5KCk7XG4gICAgICBnYW1lLnJlc3RhcnQoKTtcbiAgICAgIGdhbWUuc2V0UmFuZG9tU2VlZCgrKG5ldyBEYXRlKCkpKTtcbiAgICB9KTtcbiAgfTtcblxuICBjb25zdCBzdG9wID0gKCkgPT4ge1xuICAgIGpveXN0aWNrLnNldENhbGxiYWNrKCdhbnlLZXknLCB1bmRlZmluZWQpO1xuICAgIGpveXN0aWNrLnNldENhbGxiYWNrKCdFc2NhcGUnLCB1bmRlZmluZWQpO1xuICB9O1xuXG4gIGNvbnN0IHBsYXkgPSAoKSA9PiB7XG4gICAgZ2FtZS5vblByb2NlZWQgPSAoKSA9PiB7XG4gICAgICBpZiAoZ2FtZS5nZXRGcmFtZUNvdW50KCkgIT09IGxhc3RGcmFtZSkge1xuICAgICAgICBnYW1lLmRyYXdSZXBsYXkoKTtcblxuICAgICAgICBpZiAodGFwZS5sZW5ndGggJiYgZ2FtZS5nZXRGcmFtZUNvdW50KCkgPT09IHRhcGVbMF0uZnJhbWUpIHtcbiAgICAgICAgICBqb3lzdGljay5rZXlRdWV1ZS5wdXNoKHRhcGUuc2hpZnQoKS5rZXkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnYW1lLm9uUHJvY2VlZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgam95c3RpY2suc3RhcnQoKTtcbiAgICAgICAgc3RhcnQoKTtcbiAgICAgICAgZ2FtZS5yZXN0YXJ0KCk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvKipcbiAgICogUHVibGljXG4gICAqL1xuICByZXR1cm4ge1xuICAgIHRhcGUsXG4gICAgbGFzdEZyYW1lLFxuICAgIHN0YXJ0LFxuICAgIHN0b3AsXG4gICAgcGxheVxuICB9O1xufVxuIiwiaW1wb3J0IFNlZWRlZFJhbmRvbSBmcm9tIFwiLi9TZWVkZWRSYW5kb21cIjtcbmltcG9ydCBTaGFwZSBmcm9tIFwiLi9TaGFwZVwiO1xuaW1wb3J0IEJvYXJkIGZyb20gXCIuL0JvYXJkXCI7XG5pbXBvcnQgS2V5TWFwIGZyb20gXCIuL0tleU1hcFwiO1xuaW1wb3J0IEpveXN0aWNrIGZyb20gXCIuL0pveXN0aWNrXCI7XG5pbXBvcnQgUmVjb3JkZXIgZnJvbSBcIi4vUmVjb3JkZXJcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gR2FtZShjb25maWcpIHtcbiAgY29uc3QgY29udGV4dCA9IGNvbmZpZy5jb250ZXh0O1xuXG4gIGNvbnN0IGtleU1hcHMgPSBbXG4gICAgICBuZXcgS2V5TWFwKCdBcnJvd0xlZnQnLCAnQXJyb3dSaWdodCcsICdBcnJvd1VwJywgJ0Fycm93RG93bicpLFxuICAgICAgbmV3IEtleU1hcCgnS2V5QScsICdLZXlEJywgJ0tleVcnLCAnS2V5UycpLCAvLyBXLUEtUy1EXG4gICAgICBuZXcgS2V5TWFwKCdLZXlIJywgJ0tleUwnLCAnS2V5SycsICdLZXlKJykgIC8vIFZJTVxuICAgIF0sXG4gICAga2V5TWFwID0gT2JqZWN0LmFzc2lnbiguLi5rZXlNYXBzKTtcblxuICAvLyB0b2RvOiBjdXN0b20gY29udHJvbHMgd291bGQgZ28gc29tZXdoZXJlIGhlcmUuLi5cblxuICBjb25zdCBqb3lzdGljayA9IG5ldyBKb3lzdGljayhrZXlNYXApO1xuICBjb25zdCByZWNvcmRlciA9IG5ldyBSZWNvcmRlcihqb3lzdGljaywgdGhpcyk7XG5cbiAgam95c3RpY2suc3RhcnQoKTtcbiAgcmVjb3JkZXIuc3RhcnQoKTtcblxuICB0aGlzLnJhbmRvbVNlZWQgPSArKG5ldyBEYXRlKCkpO1xuICB0aGlzLnJhbmRvbSA9IG5ldyBTZWVkZWRSYW5kb20odGhpcy5yYW5kb21TZWVkKTtcblxuICB0aGlzLnBsYXllclNjb3JlID0gKCgpID0+IHtcbiAgICBsZXQgX3BsYXllclNjb3JlID0gMDtcbiAgICBjb25zdCBzY29yZVRocmVzaG9sZHMgPSBbMTQ5LCA0OSwgMzksIDksIDBdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIF9wbGF5ZXJTY29yZTtcbiAgICAgIH0sXG4gICAgICBzZXQobmV3U2NvcmUpIHtcbiAgICAgICAgX3BsYXllclNjb3JlID0gbmV3U2NvcmU7XG5cbiAgICAgICAgc2NvcmVUaHJlc2hvbGRzLnNvbWUoKHRocmVzaG9sZCwgaW5kZXgpID0+IHtcbiAgICAgICAgICBpZiAobmV3U2NvcmUgPj0gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICBkaWZmaWN1bHR5ID0gNSAtIGluZGV4O1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGFkZChleHRyYVNjb3JlKSB7XG4gICAgICAgIHRoaXMuc2V0KF9wbGF5ZXJTY29yZSArIGV4dHJhU2NvcmUpO1xuICAgICAgfVxuICAgIH07XG4gIH0pKCk7XG5cbiAgbGV0IGJvYXJkID0gbmV3IEJvYXJkKHRoaXMsIGNvbmZpZy5ib2FyZC5ib2FyZFdpZHRoLCBjb25maWcuYm9hcmQuYm9hcmRIZWlnaHQsIGNvbmZpZy5ib2FyZC5icmlja1NpemUsIHRoaXMucmFuZG9tKTtcbiAgbGV0IGZyYW1lQ291bnQgPSAwO1xuICAvLyBub2luc3BlY3Rpb24gSlNVbnVzZWRMb2NhbFN5bWJvbHNcbiAgdGhpcy5vblByb2NlZWQgPSB1bmRlZmluZWQ7XG4gIGxldCBkaWZmaWN1bHR5ID0gMSwgdHVyYm9Nb2RlID0gZmFsc2U7XG5cbiAgY29uc3QgZ3Jhdml0eUlzQWN0aXZlID0gKCkgPT4ge1xuICAgIGNvbnN0IGdhbWVTcGVlZHMgPSBbbnVsbCwgMjcsIDI0LCAxNiwgMTIsIDhdO1xuXG4gICAgcmV0dXJuIHR1cmJvTW9kZSB8fCBmcmFtZUNvdW50ICUgZ2FtZVNwZWVkc1tkaWZmaWN1bHR5XSA9PT0gMDtcbiAgfTtcblxuICB0aGlzLmRyYXdSZXBsYXkgPSAoKSA9PiB7XG4gICAgYm9hcmQuZHJhd1JlcGxheShjb250ZXh0KTtcbiAgfTtcblxuICB0aGlzLmdldEZyYW1lQ291bnQgPSAoKSA9PiBmcmFtZUNvdW50O1xuXG4gIHRoaXMucmVzdGFydCA9ICgpID0+IHtcbiAgICB0aGlzLnJhbmRvbSA9IG5ldyBTZWVkZWRSYW5kb20odGhpcy5yYW5kb21TZWVkKTtcbiAgICB0aGlzLnBsYXllclNjb3JlLnNldCgwKTtcbiAgICBmcmFtZUNvdW50ID0gMDtcbiAgICBkaWZmaWN1bHR5ID0gMTtcbiAgICB0dXJib01vZGUgPSBmYWxzZTtcbiAgICBib2FyZCA9IG5ldyBCb2FyZCh0aGlzLCBjb25maWcuYm9hcmQuYm9hcmRXaWR0aCwgY29uZmlnLmJvYXJkLmJvYXJkSGVpZ2h0LCBjb25maWcuYm9hcmQuYnJpY2tTaXplLCB0aGlzLnJhbmRvbSk7XG4gIH07XG5cbiAgdGhpcy5zZXRSYW5kb21TZWVkID0gKG5ld1NlZWQpID0+IHtcbiAgICB0aGlzLnJhbmRvbVNlZWQgPSBuZXdTZWVkO1xuICB9O1xuXG4gIGNvbnN0IHByb2Nlc3NBY3Rpb24gPSAoYWN0aW9uKSA9PiB7XG4gICAgYm9hcmQuY2hlY2tDb2xsaXNpb25zKChjb2xsaXNpb25zKSA9PiB7XG4gICAgICBib2FyZC5hY3RpdmVTaGFwZS5pc0Zyb3plbiA9IGNvbGxpc2lvbnMuYm90dG9tO1xuXG4gICAgICBzd2l0Y2ggKHRydWUpIHtcbiAgICAgICAgY2FzZSBhY3Rpb24gPT09IFNoYXBlLnByb3RvdHlwZS5hY3Rpb25zLlJPVEFURSAmJiBjYW50QmVSb3RhdGVkKCk6XG4gICAgICAgIGNhc2UgYWN0aW9uID09PSBTaGFwZS5wcm90b3R5cGUuYWN0aW9ucy5NT1ZFX1JJR0hUICYmIGNvbGxpc2lvbnMucmlnaHQ6XG4gICAgICAgIGNhc2UgYWN0aW9uID09PSBTaGFwZS5wcm90b3R5cGUuYWN0aW9ucy5NT1ZFX0xFRlQgJiYgY29sbGlzaW9ucy5sZWZ0OlxuICAgICAgICBjYXNlIGFjdGlvbiA9PT0gU2hhcGUucHJvdG90eXBlLmFjdGlvbnMuRkFMTCAmJiBjb2xsaXNpb25zLmJvdHRvbTpcbiAgICAgICAgY2FzZSBhY3Rpb24gPT09IFNoYXBlLnByb3RvdHlwZS5hY3Rpb25zLkRST1AgJiYgY29sbGlzaW9ucy5ib3R0b206XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAoYWN0aW9uID09PSBTaGFwZS5wcm90b3R5cGUuYWN0aW9ucy5EUk9QKSB7XG4gICAgICAgICAgICB0dXJib01vZGUgPSB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJvYXJkLmFjdGl2ZVNoYXBlLnBlcmZvcm1BY3Rpb24oYWN0aW9uKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY2FudEJlUm90YXRlZCgpIHtcbiAgICAgICAgY29uc3QgdGVtcCA9IGJvYXJkLnNwYXduU2hhcGUoKTtcblxuICAgICAgICB0ZW1wLm9yaWVudGFpb24gPSBib2FyZC5hY3RpdmVTaGFwZS5vcmllbnRhaW9uO1xuICAgICAgICB0ZW1wLnR5cGUgPSBib2FyZC5hY3RpdmVTaGFwZS50eXBlO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgKytpKSB7XG4gICAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIHRlbXAuYnJpY2tzW2ldLFxuICAgICAgICAgICAgYm9hcmQuYWN0aXZlU2hhcGUuYnJpY2tzW2ldXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRlbXAucGVyZm9ybUFjdGlvbihTaGFwZS5wcm90b3R5cGUuYWN0aW9ucy5ST1RBVEUpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgKytpKSB7XG4gICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBib2FyZC5zdGF0aWNCcmlja3MubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgdGVtcC5icmlja3NbaV0ueCA9PT0gYm9hcmQuc3RhdGljQnJpY2tzW2pdLnggJiZcbiAgICAgICAgICAgICAgdGVtcC5icmlja3NbaV0ueSA9PT0gYm9hcmQuc3RhdGljQnJpY2tzW2pdLnlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICB0ZW1wLmJyaWNrc1tpXS54ID49IGNvbmZpZy5ib2FyZC5ib2FyZFdpZHRoIHx8XG4gICAgICAgICAgICB0ZW1wLmJyaWNrc1tpXS54IDw9IDAgfHxcbiAgICAgICAgICAgIHRlbXAuYnJpY2tzW2ldLnkgPj0gY29uZmlnLmJvYXJkLmJvYXJkSGVpZ2h0XG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgY29uc3QgcmVhZEFjdGlvbiA9ICgpID0+IHtcbiAgICBjb25zdCBuZXh0S2V5ID0gam95c3RpY2sua2V5UXVldWUuc2hpZnQoKTtcbiAgICBwcm9jZXNzQWN0aW9uKGpveXN0aWNrLmtleU1hcFtuZXh0S2V5XSk7XG5cbiAgICBib2FyZC5jaGVja0NvbGxpc2lvbnMoKGNvbGxpc2lvbnMpID0+IHtcbiAgICAgIGJvYXJkLmFjdGl2ZVNoYXBlLmlzRnJvemVuID0gY29sbGlzaW9ucy5ib3R0b207XG4gICAgfSk7XG4gIH07XG5cbiAgdGhpcy5wcm9jZWVkID0gKCkgPT4ge1xuICAgICsrZnJhbWVDb3VudDtcbiAgICBib2FyZC5kcmF3QmFja2dyb3VuZChjb250ZXh0KTtcblxuICAgIGlmICh0aGlzLm9uUHJvY2VlZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLm9uUHJvY2VlZCgpO1xuICAgIH1cblxuICAgIHJlYWRBY3Rpb24oKTtcblxuICAgIGlmIChib2FyZC5hY3RpdmVTaGFwZS5pc0Zyb3plbikge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyArK2kpIHtcbiAgICAgICAgYm9hcmQuc3RhdGljQnJpY2tzLnB1c2goYm9hcmQuYWN0aXZlU2hhcGUuYnJpY2tzLnBvcCgpKTtcbiAgICAgIH1cblxuICAgICAgYm9hcmQuY2hlY2tGaWxsZWRSZWdpb25zKCk7XG4gICAgICB0dXJib01vZGUgPSBmYWxzZTtcbiAgICAgIGJvYXJkLmFjdGl2ZVNoYXBlID0gYm9hcmQuc3Bhd25TaGFwZSgpO1xuXG4gICAgICBpZiAoYm9hcmQuaXNGdWxsKCkpIHtcbiAgICAgICAgdGhpcy5yZXN0YXJ0KCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChncmF2aXR5SXNBY3RpdmUoKSkge1xuICAgICAgICBwcm9jZXNzQWN0aW9uKFNoYXBlLnByb3RvdHlwZS5hY3Rpb25zLkZBTEwpO1xuICAgICAgfVxuXG4gICAgICBib2FyZC5hY3RpdmVTaGFwZS5kcmF3KGNvbnRleHQpO1xuICAgIH1cblxuICAgIGJvYXJkLmRyYXdTdGF0aWNCcmlja3MoY29udGV4dCk7XG4gICAgYm9hcmQuZHJhd1Njb3JlKGNvbnRleHQpO1xuICB9O1xuXG4gIGNvbnN0IG1haW5Mb29wID0gKCkgPT4ge1xuICAgIHRoaXMucHJvY2VlZCgpO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShtYWluTG9vcCk7XG4gIH07XG5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1haW5Mb29wKTtcbn0iXSwibmFtZXMiOlsiS2V5TWFwIl0sIm1hcHBpbmdzIjoiOzs7RUFBZSxTQUFTLFlBQVksQ0FBQyxJQUFJLEVBQUU7RUFDM0MsRUFBRSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQzs7RUFFbkMsRUFBRSxJQUFJLENBQUMsT0FBTyxHQUFHLFlBQVk7RUFDN0IsSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLEdBQUcsVUFBVSxDQUFDO0VBQ3hELEdBQUcsQ0FBQzs7RUFFSjtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxFQUFFLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxHQUFHLEVBQUUsR0FBRyxFQUFFO0VBQ3pDLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxLQUFLLFNBQVMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO0VBQ3hDLElBQUksRUFBRSxHQUFHLENBQUM7O0VBRVYsSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7RUFDaEUsR0FBRyxDQUFDOztFQUVKLEVBQUUsSUFBSSxDQUFDLFNBQVMsR0FBRyxZQUFZO0VBQy9CLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLElBQUksVUFBVSxDQUFDO0VBQzdDLEdBQUcsQ0FBQzs7RUFFSixFQUFFLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUU7RUFDdkIsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLFVBQVUsQ0FBQztFQUM3QixHQUFHO0VBQ0g7O0dBQUMsREMzQmMsU0FBUyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFO0VBQ3BELEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDYixFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ2IsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztFQUNqQixFQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLEtBQUs7RUFDM0IsSUFBSSxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7RUFDakMsSUFBSSxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7RUFDeEIsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ25DLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ25ELElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO0VBQ25ELElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO0VBQ3hCLElBQUksT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDOztFQUVuQixJQUFJLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7RUFDakQsSUFBSSxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7RUFDeEIsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDbkQsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7RUFDbkQsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7RUFDbkQsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztFQUNuRSxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztFQUN4QixJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztFQUNuQixHQUFHLENBQUM7O0VBRUosRUFBRSxPQUFPLElBQUksQ0FBQztFQUNkLENBQUM7O0VBRUQ7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsU0FBUyxTQUFTLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRTtFQUNsQyxFQUFFO0VBQ0YsSUFBSSxNQUFNLEdBQUcsMkJBQTJCO0VBQ3hDLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7O0VBRWpDLEVBQUU7RUFDRixJQUFJLE1BQU0sR0FBRztFQUNiLE1BQU0sT0FBTyxDQUFDLENBQUMsQ0FBQztFQUNoQixNQUFNLE9BQU8sQ0FBQyxDQUFDLENBQUM7RUFDaEIsTUFBTSxPQUFPLENBQUMsQ0FBQyxDQUFDO0VBQ2hCLEtBQUssQ0FBQzs7RUFFTixFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRTtFQUNqRCxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQztFQUMvQyxHQUFHLENBQUMsQ0FBQzs7RUFFTCxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUN6RCxDQUFDOztFQy9DYyxTQUFTLEtBQUssQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRTtFQUM3RCxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQztFQUMvQixFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO0VBQzFCLEVBQUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7RUFDeEIsRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0VBQzVFLEVBQUUsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUMxRSxFQUFFLElBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7RUFDdkYsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQzs7RUFFbkIsRUFBRSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsT0FBTyxLQUFLO0VBQzNCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0VBQ3hELEdBQUcsQ0FBQzs7RUFFSixFQUFFLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxRQUFRLEtBQUs7RUFDckMsSUFBSSxRQUFRLFFBQVE7RUFDcEIsTUFBTSxLQUFLLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU07RUFDekMsUUFBUSxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLEdBQUcsRUFBRTtFQUN0RSxVQUFVLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDO0VBQzVFLFVBQVUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7RUFDbEMsU0FBUztFQUNULFFBQVEsTUFBTTs7RUFFZCxNQUFNLEtBQUssS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSTtFQUN2QyxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsS0FBSyxFQUFFO0VBQzdDLFVBQVUsS0FBSyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUM7RUFDL0IsU0FBUyxDQUFDLENBQUM7RUFDWCxRQUFRLE1BQU07O0VBRWQsTUFBTSxLQUFLLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztFQUM5QyxNQUFNLEtBQUssS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUztFQUM1QyxRQUFRLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7RUFDcEMsVUFBVSxJQUFJLFFBQVEsS0FBSyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUU7RUFDOUQsWUFBWSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUM7RUFDMUMsV0FBVyxNQUFNO0VBQ2pCLFlBQVksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDO0VBQzFDLFdBQVc7RUFDWCxTQUFTO0VBQ1QsUUFBUSxNQUFNOztFQUVkLE1BQU0sS0FBSyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJO0VBQ3ZDLFFBQVEsTUFBTTtFQUNkLEtBQUs7O0VBRUwsSUFBSSxPQUFPLElBQUksQ0FBQztFQUNoQixHQUFHLENBQUM7O0VBRUosRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsTUFBTTtFQUNoQyxJQUFJO0VBQ0osTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNO0VBQy9ELE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDOztFQUVwRixJQUFJLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQzs7RUFFdEI7RUFDQSxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7RUFDaEMsTUFBTSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0VBQ3ZCLE1BQU0sS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtFQUNsQyxRQUFRLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDM0IsUUFBUSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0VBQ3BDLFVBQVUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDM0QsU0FBUztFQUNULE9BQU87RUFDUCxLQUFLOztFQUVMLElBQUksTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzs7RUFFbEMsSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0VBQ2hDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQztFQUNuRSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUM7RUFDbkUsS0FBSzs7RUFFTCxJQUFJLE9BQU8sSUFBSSxDQUFDO0VBQ2hCLEdBQUcsQ0FBQzs7RUFFSixFQUFFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7RUFDOUIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUs7RUFDOUIsTUFBTSxJQUFJLENBQUMsTUFBTTtFQUNqQixNQUFNLElBQUksQ0FBQyxNQUFNO0VBQ2pCLE1BQU0sS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHO0VBQ3ZELE1BQU0sU0FBUztFQUNmLEtBQUssQ0FBQyxDQUFDO0VBQ1AsR0FBRzs7RUFFSCxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDOztFQUUxQixFQUFFLE9BQU8sSUFBSSxDQUFDO0VBQ2QsQ0FBQzs7RUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQzNDLEVBQUUsS0FBSyxFQUFFO0VBQ1QsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ3BELElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDbkQsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtFQUN0RCxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ3RELElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRTtFQUNwRCxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRTtFQUNyRCxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ3RELEdBQUc7RUFDSCxFQUFFLFlBQVksRUFBRTtFQUNoQixJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQzFDLElBQUksRUFBRSxL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
