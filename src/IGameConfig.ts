export default interface IGameConfig {
  context?: CanvasRenderingContext2D,
  debug?: boolean | undefined,
  spy?: any,
  board: {
    boardWidth: number,
    boardHeight: number,
    brickSize: number
  },
  customControls?: object[]
}
