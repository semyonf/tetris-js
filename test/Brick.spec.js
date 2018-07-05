import Brick, {modifyRgb} from "../src/Brick";

describe('Brick', () => {
  it('is able to initialize', () => {
    expect(new Brick(0, 0, 'rgb(250,250,250)', 15)).toEqual({
      x: 0,
      y: 0,
      rgb: 'rgb(250,250,250)',
      size: 15
    });
  });
});

describe('modifyRgb', () => {
  it('works fine when numbers are not separated with a space', () => {
    expect(modifyRgb('rgb(250,250,250)', 0.5)).toEqual('rgb(125,125,125)');
  });

  it('works fine when numbers are separated with a space', () => {
    expect(modifyRgb('rgb(250 , 250 ,250)', 0.5)).toEqual('rgb(125,125,125)');
  });
});