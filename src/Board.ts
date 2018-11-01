import Brick from './Brick'
import Game from './Game'
import Shape from './shape/Shape'

export default class Board {
  public staticBricks: Brick[] = []
  public activeShape: Shape
  private readonly colors = {
    normal: 'rgb(69,90,100)',
    turbo: 'rgba(69,90,100,0.12)'
  }

  constructor(
    readonly game: Game,
    readonly width: number,
    readonly height: number,
    readonly brickSize: number,
    private readonly random: any
  ) {
    this.activeShape = this.spawnShape()
  }

  public spawnShape() {
    return new Shape(this.width, this.brickSize, this.random)
  }

  public drawBackground(context: CanvasRenderingContext2D) {
    context.fillStyle = this.game.turboMode ? this.colors.turbo : this.colors.normal
    context.fillRect(0, 0, this.width, this.height)
  }

  public drawStaticBricks(context: CanvasRenderingContext2D) {
    this.staticBricks.forEach((staticBrick) => staticBrick.draw(context))
  }

  public drawReplay(context: CanvasRenderingContext2D) {
    context.fillStyle = 'white'
    context.font = '12px Courier'
    context.fillText('REPLAY...', 0, 20)
  }

  public drawScore(context: CanvasRenderingContext2D) {
    context.fillStyle = 'white'
    context.font = '12px Courier'
    context.fillText('Score: ' + this.game.playerScore.get(), 0, 10)
  }

  public isFull() {
    return this.staticBricks.some((brick) => brick.y < this.brickSize * 2)
  }

  public checkFilledRegions() {
    const rows = []
    let bricks
    let bricksChecked = 0

    for (
      let i = this.height - this.brickSize;
      bricksChecked !== this.staticBricks.length;
      i -= this.brickSize
    ) {
      bricks = this.staticBricks.filter((brick) => brick.y === i)

      rows.push({
        bricks,
        isFull: bricks.length === this.width / this.brickSize
      })

      bricksChecked += bricks.length
    }

    let newBricks: Brick[] = []
    let rowsCleared = 0

    for (const row of rows) {
      if (row.isFull) {
        row.bricks = []
        ++rowsCleared
        this.game.playerScore.add(rowsCleared)
      } else {
        row.bricks.forEach((brick) => {
          brick.y += rowsCleared * this.brickSize
        })
      }

      newBricks = newBricks.concat(row.bricks)
    }

    this.staticBricks = newBricks
  }

  /**
   * todo: refactor
   */
  public checkCollisions(callback: (collisions: { [key: string]: boolean }) => any) {
    const collisions: { [key: string]: boolean } = Object.seal({
      bottom: false,
      left: false,
      right: false
    })

    const checkAgainst = (obstacle: string, side: string) => {
      // @ts-ignore
      return (brick) => {
        if (obstacle === 'board') {
          switch (side) {
            case 'bottom':
              return brick.y === this.height - this.brickSize
            case 'left':
              return brick.x === 0
            case 'right':
              return brick.x === this.width - this.brickSize
          }
        } else {
          let collision = false

          this.staticBricks.forEach((staticBrick) => {
            switch (side) {
              case 'bottom': {
                collision = collision ||
                  brick.y === staticBrick.y - this.brickSize &&
                  brick.x === staticBrick.x
                break
              }

              case 'left': {
                collision = collision ||
                  brick.y === staticBrick.y &&
                  brick.x - this.brickSize === staticBrick.x
                break
              }

              case 'right': {
                collision = collision ||
                  brick.y === staticBrick.y &&
                  brick.x + this.brickSize === staticBrick.x
                break
              }
            }
          })

          return collision
        }
      }
    }

    this.activeShape.bricks.forEach((brick) => {
      ['bottom', 'left', 'right'].forEach((side) => {
        if (
          checkAgainst('board', side)(brick) ||
          checkAgainst('static', side)(brick)
        ) {
          collisions[side] = true
        }
      })
    })

    callback(collisions)
  }
}
