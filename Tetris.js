(function (undefined) {
    'use strict';

    const board = document.querySelector('canvas#board'),
        boardWidth = 200,
        boardHeight = 440;

    board.width = boardWidth;
    board.height = boardHeight;

    const context = board.getContext('2d');

    let brickSize = 20,
        boardColor = 'rgb(69,90,100)',
        frameCounter = 0,
        refreshLag = 100,
        game = new Game();

    function animate() {
        setTimeout(function () {
            requestAnimationFrame(animate);
            game.continue();
            ++frameCounter;
        }, refreshLag);
    }

    animate();

    /**
     * An enum-like object to store user's actions
     * @type {{ROTATE: string, MOVE_LEFT: string, MOVE_RIGHT: string}}
     */
    const userActions = {
        ROTATE: 'rotate',
        MOVE_LEFT: 'moveLeft',
        MOVE_RIGHT: 'moveRight'
    };

    /**
     * Main Tetris logic
     * @returns {Game}
     * @constructor
     */
    function Game() {
        this.staticBricks = [];
        this.currentShape = new Shape();
        this.playerScore = 0;
        this.action = null;

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

            let newBricks = [];

            let rowsSkipped = 0;
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

        /**
         * TODO: Implement
         */
        this.showScoreWindow = function () {
            // fill('rgb(139,195,74)');
            // rect(0, 0, 200, 30);
            // fill(255);
            // text('Score:' + this.playerScore, 20, 20);
        };

        this.boardIsFull = function () {
            return this.staticBricks.some(function (brick) {
                return brick.y < brickSize * 2;
            });
        };

        this.gravityIsActive = function () {/**/
            return frameCounter % 2 === 0;
        };

        this.redrawBackground = function () {
            context.fillStyle = boardColor;
            context.fillRect(0, 0, boardWidth, boardHeight);
        };

        this.continue = function () {
            this.redrawBackground();
            if (this.currentShape.isFrozen) {
                for (let i = 0; i < 4; ++i) {
                    this.staticBricks.push(this.currentShape.bricks.pop());
                }

                if (this.boardIsFull()) {
                    this.staticBricks = [];
                    this.playerScore = 0;

                    // alert('Game over! Restarting...');
                }

                this.checkFilledRegions();
                this.currentShape = new Shape();
            } else {
                const collisions = this.checkCollisions();

                this.applyAction(this.action, collisions);
                this.currentShape.isFrozen = this.checkCollisions().bottom;

                if (this.gravityIsActive()) {
                    this.currentShape.fall();
                }

                this.currentShape.show();
            }

            this.showStaticBricks();
            this.showScoreWindow();
        };

        this.checkCollisions = function () {
            const self = this,
                collisions = {
                    left: false,
                    right: false,
                    bottom: false
                };

            function touchedGround(brick) {
                return brick.y === boardHeight - brickSize;
            }
            function touchedStatic(brick) {
                for (let i = 0; i < self.staticBricks.length; ++i) {
                    if (
                        brick.y === self.staticBricks[i].y - brickSize &&
                        brick.x === self.staticBricks[i].x
                    ) {
                        return true;
                    }
                }

                return false;
            }
            function touchedLeftWall(brick) {
                return brick.x === 0;
            }
            function touchedRightWall(brick) {
                return brick.x === boardWidth - brickSize;
            }
            function touchedRightStatic(brick) {
                for (let i = 0; i < self.staticBricks.length; ++i) {
                    if (
                        brick.y === self.staticBricks[i].y &&
                        brick.x + brickSize === self.staticBricks[i].x
                    ) {
                        return true;
                    }
                }

                return false;
            }
            function touchedLeftStatic(brick) {
                for (let i = 0; i < self.staticBricks.length; ++i) {
                    if (
                        brick.y === self.staticBricks[i].y &&
                        brick.x - brickSize === self.staticBricks[i].x
                    ) {
                        return true;
                    }
                }

                return false;
            }

            this.currentShape.bricks.forEach(function (brick) {
                if (touchedGround(brick) || touchedStatic(brick)) {
                    collisions.bottom = true;
                }

                if (touchedLeftWall(brick)  || touchedLeftStatic(brick)) {
                    collisions.left = true;
                }

                if (touchedRightWall(brick) || touchedRightStatic(brick)) {
                    collisions.right = true;
                }
            });

            return collisions;
        };

        this.showStaticBricks = function () {
            for (let i = 0; i < this.staticBricks.length; i++) {
                this.staticBricks[i].show();
            }
        };

        this.applyAction = function (action, collisions) {
            this.cantBeRotated = function () {
                const tempShape = new Shape();

                tempShape.orientaion = this.currentShape.orientaion;
                tempShape.type = this.currentShape.type;
                for (let i = 0; i < 4; ++i) {
                    Object.assign(tempShape.bricks[i], this.currentShape.bricks[i]);
                }

                tempShape.applyMovement(userActions.ROTATE);

                for (let t = 0; t < 4; ++t) {
                    for (let s = 0; s < this.staticBricks.length; ++s) {
                        if (
                            tempShape.bricks[t].x === this.staticBricks[s].x &&
                            tempShape.bricks[t].y === this.staticBricks[s].y
                        ) {
                            return true;
                        } else if (
                            tempShape.bricks[t].x >= boardWidth ||
                            tempShape.bricks[t].x <= 0 ||
                            tempShape.bricks[t].y >= boardHeight
                        ) {
                            return true;
                        }
                    }
                }

                return false;
            };

            switch (true) {
                case action === userActions.MOVE_RIGHT && collisions.right:
                case action === userActions.MOVE_LEFT && collisions.left:
                case action === userActions.ROTATE && this.cantBeRotated():
                    break;
                default:
                    this.currentShape.applyMovement(action);

                    break;
            }
        };

        // TODO: Refactor
        const self = this;

        this.handlePlayerInput = function (e) {
            let action;
            refreshLag = 100;

            if (e.type === 'keyup') {
                action = null;
                boardColor = 'rgb(69,90,100)';
            } else {
                switch (e.key) {
                    case 'ArrowLeft':
                        action = userActions.MOVE_LEFT;

                        break;

                    case 'ArrowUp':
                        action = userActions.ROTATE;

                        break;

                    case 'ArrowRight':
                        action = userActions.MOVE_RIGHT;

                        break;

                    case 'ArrowDown':
                        refreshLag = 20;
                        boardColor = 'rgba(69,90,100,0.25)';

                        break;

                    default:
                        break;
                }
            }

            self.action = action;
        };

        ['keydown', 'keyup'].forEach(function (event) {
            window.addEventListener(event, self.handlePlayerInput);
        });

        return this;
    }

    /**
     * Tetramino shape
     * @returns {Shape}
     * @constructor
     */
    function Shape() {
        this.shapeData = {
            types: [
                {
                    name: 'I',
                    matrix: [
                        [0, -1],
                        [0, 1],
                        [0, 2]
                    ]
                },
                {
                    name: 'O',
                    matrix: [
                        [0, 1],
                        [1, 0],
                        [1, 1]
                    ]
                },
                {
                    name: 'Z',
                    matrix: [
                        [0, -1],
                        [-1, 0],
                        [1, -1]
                    ]
                },
                {
                    name: 'S',
                    matrix: [
                        [-1, -1],
                        [0, -1],
                        [1, 0]
                    ]
                },
                {
                    name: 'T',
                    matrix: [
                        [1, 0],
                        [-1, 0],
                        [1, 1]
                    ]
                },
                {
                    name: 'J',
                    matrix: [
                        [1, 0],
                        [-1, 0],
                        [-1, 1]
                    ]
                },
                {
                    name: 'L',
                    matrix: [
                        [1, 0],
                        [-1, 0],
                        [-1, -1]
                    ]
                }
            ],
            orientations: [
                {
                    angle: 0,
                    matrix: [
                        [1, 0],
                        [0, 1]
                    ]
                }, {
                    angle: 90,
                    matrix: [
                        [0, -1],
                        [1, 0]
                    ]
                }, {
                    angle: 180,
                    matrix: [
                        [-1, 0],
                        [0, -1]
                    ]
                }, {
                    angle: 270,
                    matrix: [
                        [0, 1],
                        [-1, 0]
                    ]
                }
            ],
            colors: [
                {
                    name: 'orange',
                    rgb: 'rgb(239,108,0)'
                },{
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
        this.color = randInt(this.shapeData.colors.length);
        this.type = randInt(this.shapeData.types.length);
        this.orientaion = randInt(this.shapeData.orientations.length);
        this.bricks = [];

        this.fall = function () {
            if (!this.isFrozen) {
                this.bricks.forEach(function (brick) {
                    brick.y += brickSize;
                });
            }

            return this;
        };

        this.show = function () {
            for (let i = 0; i < 4; ++i) {
                this.bricks[i].show();
            }

            return this;
        };

        this.applyMovement = function (direction) {
            switch (direction) {
                case userActions.ROTATE:
                    if (this.shapeData.types[this.type].name !== 'O') {
                        if (this.orientaion === 3) {
                            this.orientaion = 0;
                        } else {
                            ++this.orientaion;
                        }

                        this.applyOrientation();
                    }

                    break;

                case userActions.MOVE_RIGHT:
                case userActions.MOVE_LEFT:
                    for (let i = 0; i < 4; ++i) {
                        if (direction === userActions.MOVE_LEFT) {
                            this.bricks[i].x -= brickSize;
                        } else {
                            this.bricks[i].x += brickSize;
                        }
                    }

                    break;

                default:
                    break;
            }

            return this;
        };

        this.applyOrientation = function () {
            const resultMatrix = matrixMultiply(
                this.shapeData.types[this.type].matrix,
                this.shapeData.orientations[this.orientaion].matrix
            );

            for (let i = 0; i < 3; ++i) {
                this.bricks[i + 1].x =
                    this.bricks[0].x + resultMatrix[i][0] * brickSize;
                this.bricks[i + 1].y =
                    this.bricks[0].y + resultMatrix[i][1] * brickSize;
            }

            return this;
        };

        for (let i = 0; i < 4; i++) {
            this.bricks.push(new Brick(
                this.startX,
                this.startY,
                this.shapeData.colors[this.color].rgb
            ));
        }

        this.applyOrientation();

        return this;
    }

    /**
     * Base tetramino building block
     * @param x
     * @param y
     * @param rgb
     * @returns {Brick}
     * @constructor
     */
    function Brick(x, y, rgb) {
        this.x = x;
        this.y = y;
        this.rgb = rgb;
        this.show = function() {
            context.fillStyle = this.rgb;
            context.fillRect(this.x, this.y, brickSize, brickSize);
        };

        return this;
    }

    /**
     * Matrix multiplication
     * @param matrixA
     * @param matrixB
     * @returns {Array}
     */
    function matrixMultiply(matrixA, matrixB) {
        let resultMatrix = [];
        for (let i = 0; i < matrixA.length; ++i) {
            resultMatrix[i] = [];
            for (let j = 0; j < matrixB[0].length; ++j) {
                resultMatrix[i][j] = 0;
                for (let k = 0; k < matrixA[0].length; ++k) {
                    resultMatrix[i][j] += matrixA[i][k] * matrixB[k][j];
                }
            }
        }

        return resultMatrix;
    }

    /**
     * Random integer generator
     * @param max
     * @param min
     * @returns {*}
     */
    function randInt(max, min) {
        if (min === undefined) {
            min = 0;
        } else {
            min = Math.ceil(min);
        }

        --max;
        max = Math.floor(max);

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
})();