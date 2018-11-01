// @ts-ignore
import ParkMiller from 'park-miller'
import Board from './Board'
import {IGameConfig} from './IGameConfig'
import Joystick from './Joystick'
import KeyMap from './KeyMap'
import Recorder from './Recorder'
import FallCommand from './shape/commands/FallCommand'

export default class Game {
  public playerScore: any
  public turboMode: boolean
  public frameCount: number
  public onProceed: any

  private randomSeed: any
  private fallCommand = new FallCommand()
  private random: any
  private difficulty: number
  private config: any
  private board: Board
  private readonly joystick: Joystick
  private recorder: Recorder
  private context: any

  constructor(config: IGameConfig) {
    this.context = config.context
    this.config = config

    this.joystick = new Joystick([
      new KeyMap(
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown'
      ),
      new KeyMap(
        'KeyH',
        'KeyL',
        'KeyK',
        'KeyJ'
      ),
      new KeyMap(
        'KeyA',
        'KeyD',
        'KeyW',
        'KeyS'
      )
    ])

    this.recorder = new Recorder(this.joystick, this)

    this.joystick.connect()
    this.recorder.record()

    this.randomSeed = +(new Date())
    this.random = new ParkMiller(this.randomSeed)

    this.playerScore = (() => {
      let pplayerScore = 0
      const scoreThresholds = [149, 49, 39, 9, 0]

      return {
        get() {
          return pplayerScore
        },
        set(newScore: number) {
          pplayerScore = newScore

          scoreThresholds.some((threshold, index) => {
            if (newScore >= threshold) {
              this.difficulty = 5 - index

              return true
            }

            return false
          })
        },
        add(extraScore: number) {
          this.set(pplayerScore + extraScore)
        }
      }
    })()

    this.board = new Board(
      this,
      config.board.boardWidth,
      config.board.boardHeight,
      config.board.brickSize,
      this.random
    )
    this.frameCount = 0
    this.onProceed = undefined
    this.difficulty = 1
    this.turboMode = false

    this.mainLoop()
  }

  public drawReplay() {
    this.board.drawReplay(this.context)
  }

  public restart() {
    this.random = new ParkMiller(this.randomSeed)
    this.playerScore.set(0)
    this.frameCount = 0
    this.difficulty = 1
    this.turboMode = false
    this.board = new Board(
      this, this.config.board.boardWidth,
      this.config.board.boardHeight,
      this.config.board.brickSize,
      this.random
    )
  }

  public setRandomSeed(newSeed: number) {
    this.randomSeed = newSeed
  }

  public proceed() {
    this.frameCount++
    this.board.drawBackground(this.context)

    if (this.onProceed !== undefined) {
      this.onProceed()
    }

    this.readCommand()

    this.board.checkCollisions((collisions: any) => {
      this.board.activeShape.isFrozen = collisions.bottom
    })

    if (this.board.activeShape.isFrozen) {
      for (let i = 0; i < 4; ++i) {
        this.board.staticBricks.push(this.board.activeShape.bricks.pop())
      }

      this.board.checkFilledRegions()
      this.turboMode = false
      this.board.activeShape = this.board.spawnShape()

      if (this.board.isFull()) {
        this.restart()
      }
    } else {
      if (this.gravityIsActive()) {
        this.fallCommand.execute.call(this.board.activeShape, this.board)
      }

      this.board.activeShape.draw(this.context)
    }

    this.board.drawStaticBricks(this.context)
    this.board.drawScore(this.context)
  }

  private mainLoop() {
    this.proceed()
    requestAnimationFrame(this.mainLoop.bind(this))
  }

  private gravityIsActive() {
    const gameSpeeds = [null, 27, 24, 16, 12, 8]

    return this.turboMode || this.frameCount % gameSpeeds[this.difficulty] === 0
  }

  private readCommand() {
    const nextKey = this.joystick.keyQueue.shift()
    const command = this.joystick.keyMaps[nextKey]

    if (command) {
      command.execute.call(this.board.activeShape, this.board)
    }
  }
}
