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
        refreshLag = 20,
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
     * An enum-like object to identify possible actions
     */
    const shapeActions = {
        ROTATE: 'rotate',
        MOVE_LEFT: 'moveLeft',
        MOVE_RIGHT: 'moveRight',
        MOVE_DOWN: 'moveDown'
    };

    /**
     * Main game logic
     * @returns {Game}
     * @constructor
     */
    function Game() {
        this.staticBricks = [];
        this.activeShape = new Shape();
        this.playerScore = 0;
        this.difficulty = 3;
        this.inputDisabled = false;

        const self = this;

        this.updateDifficulty = function () {
            [39, 29, 9, 4].forEach(function (targetScore, index) {
                if (self.playerScore > targetScore) {
                    self.difficulty = 5 - index;
                }
            });
        };

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
                    this.updateDifficulty();
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
            let mods = [15, 12, 10, 8, 4];

            return frameCounter % mods[this.difficulty] === 0;
        };

        this.drawBackground = function () {
            context.fillStyle = boardColor;
            context.fillRect(0, 0, boardWidth, boardHeight);
        };

        this.continue = function () {
            this.drawBackground();

            if (this.activeShape.isFrozen) {
                for (let i = 0; i < 4; ++i) {
                    this.staticBricks.push(this.activeShape.bricks.pop());
                }

                if (this.boardIsFull()) {
                    this.staticBricks = [];
                    this.playerScore = 0;
                }

                this.checkFilledRegions();
                this.activeShape = new Shape();
            } else {
                if (this.gravityIsActive()) {
                    this.applyAction(shapeActions.MOVE_DOWN);
                }

                this.activeShape.draw();
            }

            this.drawStaticBricks();
            this.drawScore();
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

            this.activeShape.bricks.forEach(function (brick) {
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

        this.drawStaticBricks = function () {
            this.staticBricks.forEach(function (staticBrick) {
                staticBrick.draw();
            }, this);
        };

        this.applyAction = function (action) {
            this.cantBeRotated = function () {
                const tempShape = new Shape();

                tempShape.orientaion = this.activeShape.orientaion;
                tempShape.type = this.activeShape.type;

                for (let i = 0; i < 4; ++i) {
                    Object.assign(
                        tempShape.bricks[i],
                        this.activeShape.bricks[i]
                    );
                }

                tempShape.applyMovement(shapeActions.ROTATE);

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

            const collisions = self.checkCollisions();
            this.activeShape.isFrozen = collisions.bottom;

            switch (true) {
                case action === shapeActions.MOVE_RIGHT && collisions.right:
                case action === shapeActions.MOVE_LEFT && collisions.left:
                case action === shapeActions.MOVE_DOWN && collisions.bottom:
                case action === shapeActions.ROTATE && this.cantBeRotated():
                    break;
                default:
                    this.activeShape.applyMovement(action);

                    break;
            }
        };

        this.enableInput = function () {
            self.inputDisabled = false;
        };

        this.processAction = function (event) {
            const actions = {
                'ArrowLeft': shapeActions.MOVE_LEFT,
                'ArrowRight': shapeActions.MOVE_RIGHT,
                'ArrowUp': shapeActions.ROTATE,
                // todo: implement 'ArrowDown'
            };

            if (!self.inputDisabled) {
                self.applyAction(actions[event.key]);
                self.inputDisabled = true;
                let collisions = self.checkCollisions();
                self.activeShape.isFrozen = collisions.bottom;
            }
        };

        window.addEventListener('keydown', this.processAction);
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
                        [1, 0], [-1, 0], [1, 1]
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
                    matrix: [ [1, 0], [0, 1] ]
                }, {
                    angle: 90,
                    matrix: [ [0, -1], [1, 0] ]
                }, {
                    angle: 180,
                    matrix: [ [-1, 0], [0, -1] ]
                }, {
                    angle: 270,
                    matrix: [ [0, 1], [-1, 0] ]
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
        this.color = randInt(this.data.colors.length);
        this.type = randInt(this.data.types.length);
        this.orientaion = randInt(this.data.orientations.length);
        this.bricks = [];

        this.draw = function () {
            for (let i = 0; i < 4; ++i) {
                this.bricks[i].draw();
            }
        };

        this.applyMovement = function (direction) {
            switch (direction) {
                case shapeActions.ROTATE:
                    if (this.data.types[this.type].name !== 'O') {
                        if (this.orientaion === 3) {
                            this.orientaion = 0;
                        } else {
                            ++this.orientaion;
                        }

                        this.applyOrientation();
                    }

                    break;
                case shapeActions.MOVE_DOWN:
                    this.bricks.forEach(function (brick) {
                        brick.y += brickSize;
                    });
                    break;

                case shapeActions.MOVE_RIGHT:
                case shapeActions.MOVE_LEFT:
                    for (let i = 0; i < 4; ++i) {
                        if (direction === shapeActions.MOVE_LEFT) {
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
            const
                type = this.data.types[this.type].matrix,
                orientation = this.data.orientations[this.orientaion].matrix;

            let oriented = [];

            // Dot product of data matrix and orientation matrix
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
        this.draw = function() {
            context.fillStyle = this.rgb;
            context.fillRect(this.x, this.y, brickSize, brickSize);
        };

        return this;
    }

    /**
     * Random integer generator
     * @returns {Number}
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