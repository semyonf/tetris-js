import Brick from '../Brick'

export default class Shape {
  public static parameters = Object.freeze({
    colors: [
      {name: 'orange', rgb: 'rgb(239,108,0)'},
      {name: 'red', rgb: 'rgb(211,47,47)'},
      {name: 'green', rgb: 'rgb(76,175,80)'},
      {name: 'blue', rgb: 'rgb(33,150,243)'},
      {name: 'yellow', rgb: 'rgb(255,235,59)'},
      {name: 'cyan', rgb: 'rgb(0,188,212)'},
      {name: 'pink', rgb: 'rgb(233,30,99)'},
      {name: 'white', rgb: 'rgb(224,224,224)'},
    ],
    orientations: [
      {angle: 0, matrix: [[1, 0], [0, 1]]},
      {angle: 90, matrix: [[0, -1], [1, 0]]},
      {angle: 180, matrix: [[-1, 0], [0, -1]]},
      {angle: 270, matrix: [[0, 1], [-1, 0]]},
    ],
    types: [
      {name: 'I', matrix: [[0, -1], [0, 1], [0, 2]]},
      {name: 'O', matrix: [[0, 1], [1, 0], [1, 1]]},
      {name: 'Z', matrix: [[0, -1], [-1, 0], [1, -1]]},
      {name: 'S', matrix: [[-1, -1], [0, -1], [1, 0]]},
      {name: 'T', matrix: [[1, 0], [-1, 0], [0, 1]]},
      {name: 'J', matrix: [[1, 0], [-1, 0], [-1, 1]]},
      {name: 'L', matrix: [[1, 0], [-1, 0], [-1, -1]]},
    ],
  })

  public bricks = []
  public isFrozen = false
  public orientation: number
  public type: number
  private startX: number
  private startY: number
  private color: number

  constructor(...args) {
    if (args.length === 1 && args[0] instanceof Shape) {
      this._copyingConstructor.apply(this, args)
    } else {
      this._defaultConstructor.apply(this, args)
    }
  }

  public draw(context) {
    for (const brick of this.bricks) {
      brick.draw(context)
    }
  }

  public applyOrientation() {
    const type = Shape.parameters.types[this.type].matrix
    const orientation = Shape.parameters.orientations[this.orientation].matrix

    const oriented = []

    // Dot product of a type matrix and an orientation matrix
    for (let i = 0; i < 3; ++i) {
      oriented[i] = []
      for (let j = 0; j < 2; ++j) {
        oriented[i][j] = 0
        for (let k = 0; k < 2; ++k) {
          oriented[i][j] += type[i][k] * orientation[k][j]
        }
      }
    }

    const center = this.bricks[0]

    for (let i = 0; i < 3; ++i) {
      this.bricks[i + 1].x = center.x + oriented[i][0] * this.startY
      this.bricks[i + 1].y = center.y + oriented[i][1] * this.startY
    }

    return this
  }

  private _defaultConstructor(boardWidth, brickSize, random) {
    this.startX = boardWidth / 2
    this.startY = brickSize
    this.color = random.integerInRange(0, Shape.parameters.colors.length - 1)
    this.type = random.integerInRange(0, Shape.parameters.types.length - 1)
    this.orientation = random.integerInRange(0, Shape.parameters.orientations.length - 1)

    for (let i = 0; i < 4; ++i) {
      this.bricks.push(new Brick(
        this.startX,
        this.startY,
        Shape.parameters.colors[this.color].rgb,
        brickSize,
      ))
    }

    this.applyOrientation()
  }

  private _copyingConstructor(sourceShape) {
    this.color = sourceShape.color
    this.type = sourceShape.type
    this.startX = sourceShape.startX
    this.startY = sourceShape.startY
    this.orientation = sourceShape.orientation

    for (let i = 0; i < 4; ++i) {
      this.bricks.push(new Brick(sourceShape.bricks[i]))
    }
  }
}
