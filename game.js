var userAction = {
    ROTATE: 'shaperotate',
    MOVE_LEFT: 'shapemleft',
    MOVE_RIGHT: 'shapemright'
};

function Game() {
    this.staticBricks = [];
    this.currentShape = new Shape();
    this.playerScore = 0;
    this.action = null;

    this.checkFilledRegions = function () {
        var rows = [],
            bricks,
            bricksChecked = 0;

        for (
            var i = boardHeight - brickSize;
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

        var newBricks = [];

        for (var i = 0, rowsSkipped = 0; i < rows.length; ++i) {
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
            return brick.y < 60;
        });
    };

    this.gravityIsActive = function () {
        return frameCounter % 2 === 0;
    };

    this.continue = function () {
        if (this.currentShape.isFrozen) {
            for (var i = 0; i < 4; ++i) {
                this.staticBricks.push(this.currentShape.bricks.pop());
            }

            if (this.boardIsFull()) {
                this.staticBricks = [];
                this.playerScore = 0;

                alert('Game over! Restarting...');
            }

            this.checkFilledRegions();
            this.currentShape = new Shape();
        } else {
            var collisions = this.checkCollisions();

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
        var self = this,
            collisions = {
                left: false,
                right: false,
                bottom: false
            };

        function touchedGround(brick) {
            return brick.y === boardHeight - brickSize;
        }
        function touchedStatic(brick) {
            for (var i = 0; i < self.staticBricks.length; ++i) {
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
            for (var i = 0; i < self.staticBricks.length; ++i) {
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
            for (var i = 0; i < self.staticBricks.length; ++i) {
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
            /**
             * For some reason this code doesn't work and I had to use a switch
             *
             * collisions.bottom = (touchedGround(brick)    || touchedStatic(brick));
             * collisions.left   = (touchedLeftWall(brick)  || touchedLeftStatic(brick));
             * collisions.right  = (touchedRightWall(brick) || touchedRightStatic(brick));
             */
            // noinspection FallThroughInSwitchStatementJS
            switch (true) {
                case touchedGround(brick) || touchedStatic(brick):
                    collisions.bottom = true;

                case touchedLeftWall(brick) || touchedLeftStatic(brick):
                    collisions.left = true;

                case touchedRightWall(brick) || touchedRightStatic(brick):
                    collisions.right = true;

                default:
                    break;
            }
        });

        return collisions;
    };

    this.showStaticBricks = function () {
        for (var i = 0; i < this.staticBricks.length; i++) {
            this.staticBricks[i].show();
        }
    };

    this.applyAction = function (action, collisions) {
        this.cantBeRotated = function () {
            var tempShape = new Shape();

            tempShape.orientaion = this.currentShape.orientaion;
            tempShape.type = this.currentShape.type;
            for (var i = 0; i < 4; ++i) {
                Object.assign(tempShape.bricks[i], this.currentShape.bricks[i]);
            }

            tempShape.applyMovement(userAction.ROTATE);

            for (var t = 0; t < 4; ++t) {
                for (var s = 0; s < this.staticBricks.length; ++s) {
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
            case action === userAction.MOVE_RIGHT && collisions.right:
            case action === userAction.MOVE_LEFT && collisions.left:
            case action === userAction.ROTATE && this.cantBeRotated():
                break;
            default:
                this.currentShape.applyMovement(action);

                break;
        }
    };

    var self = this;

    this.handlePlayerInput = function (e) {
        var action;

        if (e.type === 'keyup') {
            action = null;
            boardColor = 'rgb(69,90,100)';
        } else {
            switch (e.key) {
                case 'ArrowLeft':
                    action = userAction.MOVE_LEFT;

                    break;

                case 'ArrowUp':
                    action = userAction.ROTATE;

                    break;

                case 'ArrowRight':
                    action = userAction.MOVE_RIGHT;

                    break;

                case 'ArrowDown':
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