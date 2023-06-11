import { Button } from './Joystick';

export default class TapeItem {
  public key: Button;
  public frame: number;

  constructor(key: Button, frame: number) {
    this.key = key;
    this.frame = frame;
  }
}
