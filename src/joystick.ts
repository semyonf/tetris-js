const buttons = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'] as const;

export type Button = typeof buttons[number];

export default class Joystick {
  private reactToButtons = false;
  public buttonStates: { [key in Button]: boolean } = {
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
  };

  public lastPressedButton: Button | null = null;

  private onKeyPressed = (e: KeyboardEvent) => {
    const isDown = e.type === 'keydown';
    const keyCode = e.code;

    if (!keyCodeIsKnown(keyCode)) {
      return;
    }

    e.preventDefault();

    this.buttonStates[keyCode] = isDown;

    if (!isDown) {
      return;
    }

    this.postButtonPress(keyCode);
  };

  public postButtonPress(keyCode: Button) {
    if (!this.reactToButtons) {
      return;
    }

    this.lastPressedButton = keyCode;
    this.onButtonPressCb(keyCode);
  }

  private onButtonPressCb: (button: Button) => unknown;

  public connect() {
    addEventListener('keyup', this.onKeyPressed);
    addEventListener('keydown', this.onKeyPressed);
    this.reactToButtons = true;
  }

  public disconnect() {
    removeEventListener('keyup', this.onKeyPressed);
    removeEventListener('keydown', this.onKeyPressed);
    this.reactToButtons = false;
  }

  setOnButtonPressCb(onButtonPressCb: (button: Button) => unknown): void {
    this.onButtonPressCb = onButtonPressCb;
  }
}

function keyCodeIsKnown(keyCode: string): keyCode is Button {
  return buttons.includes(keyCode as Button);
}
