import Shape from "./Shape";
import Board from "../Board";

export default interface IShapeCommand {
  execute(this: Shape, board: Board): void
}
