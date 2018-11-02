import Board from '../Board'
import Brick from '../Brick'
import Game from '../Game'
import IRenderer from './IRenderer'

export default class VirtualRenderer implements IRenderer {
  private readonly spy: any

  constructor(game: Game, spy: any) {
    game.setClock('timeout')
    game.setRandomSeed(spy.injection.seed)
    game.recorder.tape = spy.injection.tape
    game.recorder.stop()
    game.recorder.play()
    this.spy = spy

    console.warn('Debug mode is active!')
  }

  public drawBoard(board: Board): void {
    this.spy.drawBoard()
  }

  public drawBrick(brick: Brick): void {
    this.spy.drawBrick()
  }

  public drawReplay(): void {
    this.spy.drawReplay()
  }

  public drawScore(score: number): void {
    this.spy.drawScore(score)
  }
}
