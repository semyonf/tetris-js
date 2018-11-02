import Board from '../Board'
import Brick from '../Brick'
import IRenderer from './IRenderer'

export default class CanvasRenderer implements IRenderer {
  private readonly context: CanvasRenderingContext2D

  constructor(context: CanvasRenderingContext2D) {
    this.context = context
  }

  public drawBoard(board: Board) {
    this.context.fillStyle = board.game.turboMode ? board.colors.turbo : board.colors.normal
    this.context.fillRect(0, 0, board.width, board.height)
  }

  public drawReplay() {
    this.context.fillStyle = 'white'
    this.context.font = '12px Courier'
    this.context.fillText('REPLAY...', 0, 20)
  }

  public drawScore(score: number) {
    this.context.fillStyle = 'white'
    this.context.font = '12px Courier'
    this.context.fillText(`Score: ${score}`, 0, 10)
  }

  public drawBrick(brick: Brick) {
    this.context.fillStyle = brick.rgb
    this.context.beginPath()
    this.context.moveTo(brick.x, brick.y)
    this.context.lineTo(brick.x + brick.size - 1, brick.y)
    this.context.lineTo(brick.x, brick.y + brick.size - 1)
    this.context.closePath()
    this.context.fill()

    this.context.fillStyle = this.modifyRgb(brick.rgb, 0.9)
    this.context.beginPath()
    this.context.moveTo(brick.x + brick.size - 1, brick.y)
    this.context.lineTo(brick.x, brick.y + brick.size - 1)
    this.context.lineTo(brick.x, brick.y + brick.size - 1)
    this.context.lineTo(brick.x + brick.size - 1, brick.y + brick.size - 1)
    this.context.closePath()
    this.context.fill()
  }

  /**
   * A function to darken or lighten rgb color strings
   * @param {string} color
   * @param {number} factor
   * @returns {string}
   */
  private modifyRgb(color: string, factor: number) {
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
}
