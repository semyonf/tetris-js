import Shape from "../Shape";
import IShapeCommand from "../IShapeCommand"

export default class DropCommand implements IShapeCommand {
  execute(this: Shape, board) {
    /**
     * Add some FX here for the `this` shape
     */
    board.game.turboMode = true
  }
}
