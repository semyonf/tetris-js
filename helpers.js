// noinspection FunctionWithMultipleLoopsJS
function matrixMultiply(matrixA, matrixB) {
    var resultMatrix = [];
    for (var i = 0; i < matrixA.length; ++i) {
        resultMatrix[i] = [];
        for (var j = 0; j < matrixB[0].length; ++j) {
            resultMatrix[i][j] = 0;
            for (var k = 0; k < matrixA[0].length; ++k) {
                resultMatrix[i][j] += matrixA[i][k] * matrixB[k][j];
            }
        }
    }

    return resultMatrix;
}

function randInt(max, min) {
    if (min === undefined) {
        min = 0;
    } else {
        min = Math.ceil(min);
    }

    --max;
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}