export interface IGameConfig {
  context: CanvasRenderingContext2D,
  board: {
    boardWidth: number,
    boardHeight: number,
    brickSize: number,
  },
  customControls: object[]
}
