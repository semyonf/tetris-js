var game = new Game();

function setup() {
    createCanvas(300, 200);
    frameRate(50);
    background(75);
}

function draw() {
    // background(75, 100);
    background(75);
    game.continue();
}