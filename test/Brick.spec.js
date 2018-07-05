import Brick from './../src/Brick.js';

xdescribe('Brick', () => {
  xtest('kinda works', () => {
    expect(new Brick(0,0,0x002, 15)).toEqual({});
  });
});
