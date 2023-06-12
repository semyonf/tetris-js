import Board from '../../board';
import ShapeCommand from '../shape-command';
import Shape from '../shape';

export default class DropCommand implements ShapeCommand {
  public execute(this: Shape, board: Board): void {
    /**
     * Add some FX here for the `this` shape
     */
    board.game.turboMode = true;
  }
}
