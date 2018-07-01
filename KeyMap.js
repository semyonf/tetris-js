import Shape from "./Shape";

export default function Controls(leftKey, rightKey, rotateKey, dropKey) {
  return {
    [leftKey]: Shape.prototype.actions.MOVE_LEFT,
    [rightKey]: Shape.prototype.actions.MOVE_RIGHT,
    [rotateKey]: Shape.prototype.actions.ROTATE,
    [dropKey]: Shape.prototype.actions.DROP
  }
}
