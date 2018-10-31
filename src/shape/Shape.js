import Brick from '../Brick.js';

Shape.prototype._copyingConstructor = function (sourceShape) {
  this.color = sourceShape.color
  this.type = sourceShape.type
  this.startX = sourceShape.startX
  this.startY = sourceShape.startY
  this.orientaion = sourceShape.orientaion

  for (let i = 0; i < 4; ++i) {
    this.bricks.push(new Brick(sourceShape.bricks[i]))
  }
}

Shape.prototype._defaultConstructor = function (boardWidth, brickSize, random) {
  this.startX = boardWidth / 2;
  this.startY = brickSize;
  this.color = random.nextInRange(Shape.prototype.parameters.colors.length);
  this.type = random.nextInRange(Shape.prototype.parameters.types.length);
  this.orientaion = random.nextInRange(Shape.prototype.parameters.orientations.length);

  for (let i = 0; i < 4; ++i) {
    this.bricks.push(new Brick(
      this.startX,
      this.startY,
      Shape.prototype.parameters.colors[this.color].rgb,
      brickSize
    ));
  }

  this.applyOrientation();
}

export default function Shape() {
  this.bricks = [];
  this.isFrozen = false;

  if (arguments.length === 1 && arguments[0] instanceof Shape) {
    this._copyingConstructor.apply(this, arguments)
  } else {
    this._defaultConstructor.apply(this, arguments)
  }
}

Shape.prototype.draw = function (context) {
  this.bricks.forEach((brick) => brick.draw(context));
};

Shape.prototype.applyOrientation = function () {
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
    this.bricks[i + 1].x = center.x + oriented[i][0] * this.startY;
    this.bricks[i + 1].y = center.y + oriented[i][1] * this.startY;
  }

  return this;
};

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
