import Board from '../Board'
import Brick from '../Brick'
import Game from '../Game'
import IRenderer from './IRenderer'

export default class VirtualRenderer implements IRenderer {
  constructor() {
    console.warn('Debug mode is active!')
  }

  public drawBoard(board: Board): void {
  }

  public drawBrick(brick: Brick): void {
  }

  public drawReplay(): void {
  }

  public drawScore(score: number): void {
  }
}
