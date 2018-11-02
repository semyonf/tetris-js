export default class Brick {
  public x: number
  public y: number
  private rgb: string
  private size: number

  constructor(brick: Brick)
  constructor(x: number, y: number, rgb: string, size: number)
  constructor() {
    if (arguments.length === 1) {
      this._copyingConstructor.apply(this, arguments)
    } else {
      this._defaultConstructor.apply(this, arguments)
    }
  }

  public draw(context: CanvasRenderingContext2D) {
    context.fillStyle = this.rgb
    context.beginPath()
    context.moveTo(this.x, this.y)
    context.lineTo(this.x + this.size - 1, this.y)
    context.lineTo(this.x, this.y + this.size - 1)
    context.closePath()
    context.fill()

    context.fillStyle = modifyRgb(this.rgb, 0.9)
    context.beginPath()
    context.moveTo(this.x + this.size - 1, this.y)
    context.lineTo(this.x, this.y + this.size - 1)
    context.lineTo(this.x, this.y + this.size - 1)
    context.lineTo(this.x + this.size - 1, this.y + this.size - 1)
    context.closePath()
    context.fill()
  }

  private _defaultConstructor(x: number, y: number, rgb: string, size: number) {
    this.x = x
    this.y = y
    this.rgb = rgb
    this.size = size
  }

  private _copyingConstructor(sourceBrick: Brick) {
    this.x = sourceBrick.x
    this.y = sourceBrick.y
    this.rgb = sourceBrick.rgb
    this.size = sourceBrick.size
  }
}

/**
 * A function to darken or lighten rgb color strings
 * @param {string} color
 * @param {number} factor
 * @returns {string}
 */
export function modifyRgb(color: string, factor: number) {
  const regexp = /rgb\((\d+) ?, ?(\d+) ?, ?(\d+)\)/g
  const matches = regexp.exec(color)

  const colors = [
    matches[1],
    matches[2],
    matches[3]
  ]

  colors.forEach((c, index, arr) => {
    // @ts-ignore
    arr[index] = Math.floor(c * factor)
  })

  return `rgb(${colors[0]},${colors[1]},${colors[2]})`
}
