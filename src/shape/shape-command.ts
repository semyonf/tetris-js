import Board from '../board';
import Shape from './shape';

export default interface ShapeCommand {
  execute(this: Shape, board: Board): void;
}
