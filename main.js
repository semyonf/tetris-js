var game;
var gridSize = 20;

function setup() {
    createCanvas(500, 500);
    frameRate(10);
    background(75);
    game = new Game();
}

function draw() {
    background('rgb(55,71,79)');
    game.continue();
}