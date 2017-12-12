var game;
var brickSize = 20;

function setup() {
    createCanvas(200, 440);
    frameRate(10);
    background(75);
    game = new Game();
}

function draw() {
    background('rgb(69,90,100)');
    game.continue();
}