export default interface GameConfig {
  context?: CanvasRenderingContext2D;
  board: {
    boardWidth: number;
    boardHeight: number;
    brickSize: number;
  };
  onScreenControls?: (a: {
    left: CallableFunction;
    right: CallableFunction;
    up: CallableFunction;
    down: CallableFunction;
    escape: CallableFunction;
  }) => void;
}
