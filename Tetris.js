/**
 * MIT License
 *
 * Copyright (c) 2017 Semyon Fomin
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
        brickSize = 20;

    let frameCounter = 0,
        refreshLag = 100,
        boardColor = 'rgb(69,90,100)',
        game = new Game();

    /**
     * Main loop
     */
    function animate() {
        setTimeout(function () {
            requestAnimationFrame(animate);
            game.continue();
            ++frameCounter;
        }, refreshLag);
    }

    animate();

    /**
     * An enum-like object to store actions for user input
     * @type {*}
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

        this.showScoreWindow = function () {
            context.fillStyle = 'rgb(255,255,255)';
            context.font="12px Courier";
            context.fillText('Score: ' + this.playerScore, 0, 10);
        };

        this.boardIsFull = function () {
            return this.staticBricks.some(function (brick) {
                return brick.y < brickSize * 2;
            });
        };

        this.gravityIsActive = function () {
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
                }

                this.checkFilledRegions();
                this.currentShape = new Shape();
            } else {
                this.applyAction(this.action, this.checkCollisions());
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
                                case 'bottom':
                                    collision = collision ||
                                        brick.y === staticBrick.y - brickSize &&
                                        brick.x === staticBrick.x;
                                    break;
                                case 'left':
                                    collision = collision ||
                                        brick.y === staticBrick.y &&
                                        brick.x - brickSize === staticBrick.x;
                                    break;
                                case 'right':
                                    collision = collision ||
                                        brick.y === staticBrick.y &&
                                        brick.x + brickSize === staticBrick.x;
                                    break;
                            }
                        };

                        self.staticBricks.forEach(callback);

                        return collision;
                    }
                };
            }
            
            this.currentShape.bricks.forEach(function (brick) {
                ['bottom', 'left', 'right'].forEach(function (direction) {
                    if (
                        checkAgainst('board', direction)(brick) ||
                        checkAgainst('static', direction)(brick)
                    ) {
                        collisions[direction] = true;
                    }
                });
            });

            return collisions;
        };

        this.showStaticBricks = function () {
            this.staticBricks.forEach(function (staticBrick) {
                staticBrick.show();
            }, this);
        };

        this.applyAction = function (action, collisions) {
            this.cantBeRotated = function () {
                const tempShape = new Shape();

                tempShape.orientaion = this.currentShape.orientaion;
                tempShape.type = this.currentShape.type;

                for (let i = 0; i < 4; ++i) {
                    Object.assign(
                        tempShape.bricks[i],
                        this.currentShape.bricks[i]
                    );
                }

                tempShape.applyMovement(userActions.ROTATE);

                for (let i = 0; i < 4; ++i) {
                    for (let j = 0; j < this.staticBricks.length; ++j) {
                        if (
                            tempShape.bricks[i].x === this.staticBricks[j].x &&
                            tempShape.bricks[i].y === this.staticBricks[j].y
                        ) {
                            return true;
                        } else if (
                            tempShape.bricks[i].x >= boardWidth ||
                            tempShape.bricks[i].x <= 0 ||
                            tempShape.bricks[i].y >= boardHeight
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
            window.addEventListener(event, this.handlePlayerInput);
        }, this);

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
            const oriented = matrixMultiply(
                this.shapeData.types[this.type].matrix,
                this.shapeData.orientations[this.orientaion].matrix
            );

            const center = this.bricks[0];

            for (let i = 0; i < 3; ++i) {
                this.bricks[i + 1].x = center.x + oriented[i][0] * brickSize;
                this.bricks[i + 1].y = center.y + oriented[i][1] * brickSize;
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
     * @param x coordinate
     * @param y coordinate
     * @param rgb color sting
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
     * TODO: hardcode dimensions in
     * @param matrixA 2-dimensional
     * @param matrixB 2-dimensional
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