var canvas = document.querySelector('canvas'),
    boardWidth = 200,
    boardHeight = 440;

canvas.width = boardWidth;
canvas.height = boardHeight;

var c = canvas.getContext('2d');

// TODO: Compile to one object and pass to Game()
var brickSize = 20,
    boardColor = 'rgb(69,90,100)',
    frameCounter = 0,
    refreshLag = 100,
    game = new Game();

function animate() {
    setTimeout(function () {
        requestAnimationFrame(animate);
        game.continue();
        ++frameCounter;
    }, refreshLag);
}

animate();