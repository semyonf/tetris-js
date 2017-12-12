var shapeData = {
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
    ]
};

function randInt(max, min) {
    if (min === undefined) {
        min = 0;
    } else {
        min = Math.ceil(min);
    }

    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Shape() {
    this.startX = width / 2; // TODO: Make sure it's also a multiple of 20
    this.startY = gridSize;
    this.isFrozen = false;
    this.color = randInt(3);
    this.type = randInt(6);
    this.orientaion = randInt(3);
    this.bricks = [];
    this.fall = function () {
        if (!this.isFrozen) {
            // TODO: Rewrite using declarative approach
            for (var i = 0; i < 4; ++i) {
                this.bricks[i].y += gridSize;
            }
        }

        return this;
    };
    this.show = function () {
        for (var i = 0; i < 4; ++i) {
            this.bricks[i].show();
        }

        return this;
    };
    this.applyMovement = function (direction) {
        switch (direction) {
            // TODO: Implement 'drop' case
            case 'rotate':
                if (this.type.name !== 'O') {
                    if (this.orientaion === 3) {
                        this.orientaion = 0;
                    } else {
                        ++this.orientaion;
                    }

                    this.applyOrientation();
                }

                break;

            case 'moveright':
            case 'moveleft':
                for (var i = 0; i < 4; ++i) {
                    if (direction === 'moveleft') {
                        this.bricks[i].x -= 20;
                    } else {
                        this.bricks[i].x += 20;
                    }
                }

                break;
        }

        return this;
    };
    this.applyOrientation = function () {
        var resultMatrix = math.multiply(
            shapeData.types[this.type].matrix,
            shapeData.orientations[this.orientaion].matrix
        );

        for (var i = 0; i < 3; ++i) {
            this.bricks[i + 1].x = this.bricks[0].x + resultMatrix[i][0] * 20;
            this.bricks[i + 1].y = this.bricks[0].y + resultMatrix[i][1] * 20;
        }

        return this;
    };

    for (var i = 0; i < 4; i++) {
        this.bricks.push(new Brick(this.startX, this.startY, this.color));
    }

    this.applyOrientation();

    return this;
}