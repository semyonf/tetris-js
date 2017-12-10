function game() {
    this.staticBricks = [];
    this.currentShape = new Shape();
    this.continue = function() {
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

        this.refreshStaticBricks();
    };

    // TODO: Implement a collision detection mechanism
    this.checkCollisions = function() {
        var self = this,
            collisionSides = {
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

        for (var i = 0; i < 4; ++i) {
            var brick = this.currentShape.bricks[i];

            switch (true) {
                case brickTouchedLeftWall(brick):
                case brickTouchedLeftStatic(brick):
                    collisionSides.left = true;
                    break;

                case brickTouchedRightWall(brick):
                case brickTouchedRightStatic(brick):
                    collisionSides.right = true;
                    break;

                case brickTouchedGround(brick):
                case brickTouchedStatic(brick):
                    this.currentShape.isFrozen = true;
                    collisionSides.bottom = true;
                    break;

                default: break;
            }
        }

        return collisionSides;
    };

    this.refreshStaticBricks = function() {
        for (var i = 0; i < this.staticBricks.length; i++) {
            this.staticBricks[i].show();
        }
    };

    this.getUserAction = function() {
        var transformation;
        switch (true) {
            case keyIsDown(UP_ARROW):
                transformation = 'rotate';
                break;
            case keyIsDown(LEFT_ARROW):
                transformation = 'moveleft';
                break;
            case keyIsDown(DOWN_ARROW):
                transformation = 'drop';
                break;
            case keyIsDown(RIGHT_ARROW):
                transformation = 'moveright';
                break;
        }

        if (frameCount % 10 === 0) {
            // TODO: transformation should be some sort of enum
            return transformation;
        }
    };

    this.transformShape = function(transformationKind) {
        // TODO: Perform transformation on a temporary imaginary shape and apply to the real one if it's legal.
        this.currentShape.applyMovement(transformationKind);
    };

    return this;
}