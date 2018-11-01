import Board from '../Board'
import Shape from './Shape'

export default interface IShapeCommand {
  execute(this: Shape, board: Board): void
}
