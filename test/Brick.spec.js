import {Brick, modifyRgb} from './../src/Brick.js';

xdescribe('Brick', () => {
  xit('kinda works', () => {
    expect(new Brick(0,0,0x002, 15)).toEqual({});
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