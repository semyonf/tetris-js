import Shape from "../Shape";
import IShapeCommand from "../IShapeCommand";

export default class RotateCommand implements IShapeCommand  {
  execute(this: Shape, board) {
    const temp = new Shape(this)

    if (Shape.parameters.types[temp.type].name !== 'O') {
      temp.orientation = (temp.orientation === 3) ? 0 : ++temp.orientation;
      temp.applyOrientation();

      for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < board.staticBricks.length; ++j) {
          if (
            temp.bricks[i].x === board.staticBricks[j].x &&
            temp.bricks[i].y === board.staticBricks[j].y
          ) {
            return;
          }
        }

        if (
          temp.bricks[i].x >= board.width ||
          temp.bricks[i].x <= 0 ||
          temp.bricks[i].y >= board.height
        ) {
          return;
        }
      }
    }

    board.activeShape = temp
  }
}






