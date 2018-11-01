import Shape from "../Shape";

export default class DropCommand {
  execute(this: Shape, board) {
    /**
     * Add some FX here for the `this` shape
     */
    board.game.turboMode = true
  }
}
