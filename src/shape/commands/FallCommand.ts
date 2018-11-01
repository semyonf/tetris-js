import IShapeCommand from '../IShapeCommand'
import Shape from '../Shape'

export default class FallCommand implements IShapeCommand {
  public execute(this: Shape, board): void {
    this.bricks.forEach((brick) => {
      brick.y += board.brickSize
    })
  }
}
