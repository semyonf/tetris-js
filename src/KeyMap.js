import RotateCommand from './shape/commands/RotateCommand';
import MoveLeftCommand from './shape/commands/MoveLeftCommand';
import MoveRightCommand from './shape/commands/MoveRightCommand';
import DropCommand from './shape/commands/DropCommand';

export default function Controls(leftKey, rightKey, rotateKey, dropKey) {
  return {
    [leftKey]: new MoveLeftCommand(),
    [rightKey]: new MoveRightCommand(),
    [rotateKey]: new RotateCommand(),
    [dropKey]: new DropCommand()
  }
}
