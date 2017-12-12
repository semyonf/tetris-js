var game,
    brickSize = 20,
    boardColor = 'rgb(69,90,100)';

function setup() {
    createCanvas(200, 440);
    frameRate(8);
    background(75);
    game = new Game();
}

function draw() {
    background(boardColor);
    game.continue();
}