import Tetris from './tetris';
import Joystick, { Button } from './joystick';
import TapeItem from './tape-item';

export default class Recorder {
  public tape: TapeItem[] = [];

  constructor(public joystick: Joystick, public game: Tetris) {}

  public finishRecording() {
    const oldTape = this.tape;
    this.tape = [];

    return oldTape;
  }

  public startRecording() {
    this.joystick.setOnButtonPressCb((button: Button) => {
      this.tape.push(new TapeItem(button, this.game.frameCount));
    });
  }
}
