function Game() {
    this.staticBricks = [];
    this.currentShape = new Shape();
    this.continue = function () {
        if (this.currentShape.isFrozen) {
            // TODO: There should be a faster way
            for (var i = 0; i < 4; ++i) {
                this.staticBricks.push(this.currentShape.bricks.pop());
            }

            this.currentShape = new Shape();
        } else {
            var collisions = this.checkCollisions(),
                action = this.getUserAction();

            this.transformShape(action, collisions);
            this.currentShape
                .fall()
                .show();
        }

        this.showStaticBricks();
    };

    this.checkCollisions = function () {
        var self = this,
            collisions = {
                left: false,
                right: false,
                bottom: false
            };

        function touchedGround(brick) {
            return brick.y === height - gridSize;
        }

        function touchedStatic(brick) {
            for (var i = 0; i < self.staticBricks.length; ++i) {
                if (
                    brick.y === self.staticBricks[i].y - gridSize &&
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
            return brick.x === width - gridSize;
        }

        function touchedRightStatic(brick) {
            for (var i = 0; i < self.staticBricks.length; ++i) {
                if (
                    brick.y === self.staticBricks[i].y &&
                    brick.x + gridSize === self.staticBricks[i].x
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
                    brick.x - 20 === self.staticBricks[i].x
                ) {
                    return true;
                }
            }

            return false;
        }

        // TODO: Refactor to eliminate the label
        iterateBricks:
            for (var i = 0; i < 4; ++i) {
                var brick = this.currentShape.bricks[i];

                switch (true) {
                    case touchedGround(brick):
                    case touchedStatic(brick):
                        this.currentShape.isFrozen = true;

                        break iterateBricks;

                    case touchedLeftWall(brick):
                    case touchedLeftStatic(brick):
                        collisions.left = true;
                    case touchedRightWall(brick):
                    case touchedRightStatic(brick):
                        collisions.right = true;

                        break;

                    default:
                        break;
                }
            }

        return collisions;
    };

    this.showStaticBricks = function () {
        for (var i = 0; i < this.staticBricks.length; i++) {
            this.staticBricks[i].show();
        }
    };

    this.getUserAction = function () {
        var action;

        switch (true) {
            case keyIsDown(UP_ARROW):
                action = 'rotate';

                break;
            case keyIsDown(LEFT_ARROW):
                action = 'moveleft';

                break;
            case keyIsDown(DOWN_ARROW):
                action = 'drop';

                break;
            case keyIsDown(RIGHT_ARROW):
                action = 'moveright';

                break;

            default:
                break;
        }

        // TODO: there should be a better way to restrict user input rate
        // if (frameCount % 2 === 0) {
        // TODO: action should be implemented as an enum-like thing
        return action;
        // } else {
        //     return null;
        // }
    };

    this.transformShape = function (action, collisions) {
        this.cantBeRotated = function () {
            var tempShape = new Shape();

            for (var i = 0; i < 4; ++i) {
                tempShape.bricks[i] = this.currentShape.bricks[i];
            }

            tempShape.orientaion = this.currentShape.orientaion;
            tempShape.applyMovement('rotate');

            for (var t = 0; t < 4; ++t) {
                for (var s = 0; s < this.staticBricks.length; ++s) {
                    if (
                        tempShape.bricks[t].x === this.staticBricks[s].x
                        &&
                        tempShape.bricks[t].y === this.staticBricks[s].y
                    ) {
                        return true;
                    }
                }
            }

            return false;
        };

        switch (true) {
            case action === 'moveright' && collisions.right:
            case action === 'moveleft' && collisions.left:
            case action === 'rotate' && this.cantBeRotated():
                break;
            default:
                this.currentShape.applyMovement(action);

                break;
        }
    };

    return this;
}