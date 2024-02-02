export default interface GameConfig {
  context: CanvasRenderingContext2D;
  onScreenControls?: (a: {
    left: CallableFunction;
    right: CallableFunction;
    up: CallableFunction;
    down: CallableFunction;
    escape: CallableFunction;
  }) => void;
}
