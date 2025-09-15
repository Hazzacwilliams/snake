const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const boxSize = 20; //Size of each grid square and snake segement (in pixels)

//Snakes starting position
let snakeX = canvas.width / 2;
let snakeY = canvas.height / 2;

//Snakes movement delta
let dx = boxSize;
let dy = 0;

function gameLoop() {

    setTimeout(function onTick() {
        clearCanvas();
        drawSnake();
        updateSnakePosition();

        requestAnimationFrame(gameLoop);
    }, 300);

    function clearCanvas() {
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }

    function drawSnake() {
        ctx.fillStyle = 'limegreen';
        ctx.fillRect(snakeX - (boxSize / 2), snakeY - (boxSize / 2), boxSize, boxSize);
    }

    function updateSnakePosition() {
        snakeX += dx;
        snakeY += dy;

        if(snakeX < 0) {
            snakeX = canvas.width - (boxSize / 2);
        }
        if(snakeX > canvas.width) {
            snakeX = 0 + (boxSize / 2);
        }
        if(snakeY < 0) {
            snakeY = canvas.height - (boxSize / 2);
        }
        if(snakeY > canvas.height) {
            snakeY = 0 + (boxSize / 2);
        }
    };

}

document.addEventListener("keydown", changeDirection);

    function changeDirection(event) {
        const keyPresses = event.key;
        const moveUp = (dy === -boxSize);
        const moveDown = (dy === boxSize);
        const moveLeft = (dx === -boxSize);
        const moveRight = (dx === boxSize);

        if(keyPresses === "ArrowLeft" && !moveRight) {
            dx = -boxSize;
            dy = 0;
        }
        if (keyPresses === "ArrowUp" && !moveDown) {
            dx = 0;
            dy = -boxSize;
        }
        if (keyPresses === "ArrowRight" && !moveLeft) {
            dx = boxSize;
            dy = 0;
        }
        if (keyPresses === "ArrowDown" && !moveUp) {
            dx = 0;
            dy = boxSize;
        }
    }

requestAnimationFrame(gameLoop);