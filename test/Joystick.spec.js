import Joystick from "../src/Joystick";
import KeyMap from "../src/KeyMap";

describe('Joystick', () => {
  let joystick = new Joystick(
    new KeyMap('ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown')
  );

  // beforeEach(() => {
  //   joystick = new Joystick(
  //     new KeyMap('ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown')
  //   );
  // });

  it('has the correct keyStates object', () => {
    expect(joystick.keys).toEqual({
      'ArrowLeft': false,
      'ArrowRight': false,
      'ArrowUp': false,
      'ArrowDown': false,
      "Enter": false,
      "Escape": false,
      "anyKey": false
    });
  });
});
