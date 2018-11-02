import Board from '../Board'
import Brick from '../Brick'
import Game from '../Game'
import IRenderer from './IRenderer'

export default class VirtualRenderer implements IRenderer {
  private readonly game: Game
  private readonly spy: any

  constructor(game: Game, spy: any) {
    this.game = game
    this.game.setClock('timeout')
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
    this.spy.drawScore()
  }
}
