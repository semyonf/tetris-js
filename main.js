var canvas = document.querySelector('canvas'),
    boardWidth = 200,
    boardHeight = 440;

canvas.width = boardWidth;
canvas.height = boardHeight;

var c = canvas.getContext('2d');

var brickSize = 20,
    boardColor = 'rgb(69,90,100)',
    game = new Game();

function redrawBackground() {
    c.fillStyle = boardColor;
    c.fillRect(0, 0, boardWidth, boardHeight);
}

function animate() {
    setTimeout(function () {
        requestAnimationFrame(animate);
        redrawBackground();
        game.continue();
    }, 100);
}

animate();