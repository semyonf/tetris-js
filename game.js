function Game() {
    this.staticBricks = [];
    this.currentShape = new Shape();
    this.continue = function () {
        if (this.currentShape.isFrozen) {
            for (var i = 0; i < 4; ++i) {
                this.staticBricks.push(this.currentShape.bricks.pop());
            }

            this.currentShape = new Shape();
        } else {
            var collisions = this.checkCollisions(),
                action = this.getUserAction();

            this.transformShape(action, collisions);
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

        function brickTouchedGround(brick) {
            return brick.y === height - 20;
        }

        function brickTouchedStatic(brick) {
            for (var i = 0; i < self.staticBricks.length; ++i) {
                if (
                    brick.y === self.staticBricks[i].y - 20 &&
                    brick.x === self.staticBricks[i].x
                ) {
                    return true;
                }
            }

            return false;
        }

        function brickTouchedLeftWall(brick) {
            return brick.x === 0;
        }

        function brickTouchedRightWall(brick) {
            return brick.x === width - 20;
        }

        function brickTouchedRightStatic(brick) {
            for (var i = 0; i < self.staticBricks.length; ++i) {
                if (
                    brick.y === self.staticBricks[i].y &&
                    brick.x + 20 === self.staticBricks[i].x
                ) {
                    return true;
                }
            }

            return false;
        }

        function brickTouchedLeftStatic(brick) {
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
                    case brickTouchedGround(brick):
                    case brickTouchedStatic(brick):
                        collisions.bottom = true;
                        this.currentShape.isFrozen = true;

                        break iterateBricks;
                    case brickTouchedLeftWall(brick):
                    case brickTouchedLeftStatic(brick):
                        collisions.left = true;
                    case brickTouchedRightWall(brick):
                    case brickTouchedRightStatic(brick):
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
        if (frameCount % 5 === 0) {
            // TODO: action should be implemented as an enum-like thing
            return action;
        } else {
            return null;
        }
    };

    this.transformShape = function (action, collisions) {
        // TODO: Implement
        this.shapeCanNotBeRotated = function () {
            return false;
        };

        switch (true) {
            case action === 'moveright' && collisions.right:
            case action === 'moveleft' && collisions.left:
            case action === 'rotate' && this.shapeCanNotBeRotated():
                break;
            default:
                this.currentShape.applyMovement(action);

                break;
        }
    };

    return this;
}