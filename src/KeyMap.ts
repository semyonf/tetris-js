import DropCommand from "./shape/commands/DropCommand"
import MoveLeftCommand from "./shape/commands/MoveLeftCommand"
import MoveRightCommand from "./shape/commands/MoveRightCommand"
import RotateCommand from "./shape/commands/RotateCommand"

export default function(leftKey, rightKey, rotateKey, dropKey) {
  return {
    [leftKey]: new MoveLeftCommand(),
    [rightKey]: new MoveRightCommand(),
    [rotateKey]: new RotateCommand(),
    [dropKey]: new DropCommand(),
  }
}
