export default interface IGameConfig {
  context?: CanvasRenderingContext2D;
  debug?: boolean | undefined;
  spy?: any;
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
