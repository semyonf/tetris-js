import Board from '../../Board'
import IShapeCommand from '../IShapeCommand'
import Shape from '../Shape'

export default class DropCommand implements IShapeCommand {
  public execute(this: Shape, board: Board): void {
    /**
     * Add some FX here for the `this` shape
     */
    board.game.turboMode = true
  }
}
