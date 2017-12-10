var matrices = {
    types: [
        {
            name: 'I',
            points: [
                [0, -1],
                [0, 1],
                [0, 2]
            ]
        },
        {
            name: 'O',
            points: [
                [0, 1],
                [1, 0],
                [1, 1]
            ]
        },
        {
            name: 'Z',
            points: [
                [0, -1],
                [-1, 0],
                [1, -1]
            ]
        },
        {
            name: 'S',
            points: [
                [-1, -1],
                [0, -1],
                [1, 0]
            ]
        },
        {
            name: 'T',
            points: [
                [1, 0],
                [-1, 0],
                [1, 1]
            ]
        },
        {
            name: 'J',
            points: [
                [1, 0],
                [-1, 0],
                [-1, 1]
            ]
        },
        {
            name: 'L',
            points: [
                [1, 0],
                [-1, 0],
                [-1, -1]
            ]
        }
    ],
    orientations: [
        [[ 1,  0], [ 0, 1 ]],
        [[ 0, -1], [ 1, 0 ]],
        [[-1,  0], [ 0, -1]],
        [[ 0,  1], [-1, 0 ]]
    ]
};

function myRandom(max, min) {
    if (min !== undefined) {
        min = Math.ceil(min);
    } else {
        min = 0;
    }

    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Shape() {
    this.x = 140;
    this.y = 20;
    this.isFrozen = false;
    this.color = myRandom(3);
    this.type = matrices.types[myRandom(6)];
    this.orientaion = myRandom(3);
    this.bricks = [];
    this.applyMovement = function(direction) {
        switch (direction) {
             // TODO: Implement 'drop' case

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
        }

        for (var i = 0; i < 4; ++i) {
            this.bricks[i].fall().show();

            if (this.bricks[i].isStuck) {
                this.isFrozen = true;
            }
        }
    };

    this.applyOrientation = function() {
        var rMatrix = matrices.orientations[this.orientaion],
            sMatrix = this.type.points;

        for (var i = 0; i < 3; ++i) {
            var coordinate,
                point = sMatrix[i],
                transformedPoint = [];

            for (var j = 0; j < 2; ++j) {
                coordinate = 0;

                for (var k = 0; k < 2; ++k) {
                    coordinate += point[k] * rMatrix[k][j];
                }

                transformedPoint[j] = coordinate;
            }

            this.bricks[i + 1].x = this.bricks[0].x + transformedPoint[0] * 20;
            this.bricks[i + 1].y = this.bricks[0].y + transformedPoint[1] * 20;
        }
    };

    for (var i = 0; i < 4; i++) {
        this.bricks.push(new Brick(this.x, this.y, this.color));
    }

    this.applyOrientation();

    return this;
}