//Get the canvas element and its 2D rendering context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");

let score = document.getElementById('scoreNum');
let scoreNum = 0;

const cellSize = 20; //Each grid will be 20x20 pixels
const gridWidth = 20; //20 cells width
const gridHeight = 20; //20 cells height

canvas.width = cellSize * gridWidth;
canvas.height = cellSize * gridHeight;

let snake = [
    { x: 10, y: 10 }
];

let food = [];

let direction = 'right';

let lastUpdateTime = 0;
let updateInterval = 200; //200 milliseconds

let gameOver = false;

const maxFood = 3;
let currentFood = 0;
let foodCollision = false;

// -- DRAWING FUNCTIONS --
function clearCanvas() {
    ctx.fillStyle = '#ffffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = 'green';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
    })
}

function drawFood() {
    ctx.fillStyle = 'red';
    food.forEach(item => {
        ctx.fillRect(item.x * cellSize, item.y * cellSize, cellSize, cellSize);
    })
}

// -- MOVEMENT & LOGIC --
function updateSnake(direction) {

    if (gameOver) {
        return;
    }

    const head = { x: snake[0].x, y: snake[0].y };

    if (direction === 'up') head.y--;
    else if (direction === 'down') head.y++;
    else if (direction === 'left') head.x--;
    else if (direction === 'right') head.x++;

    for(let i = 1; i < snake.length; i++){
        if(head.x === snake[i].x && head.y === snake[i].y){
            gameOver = true;
            alert('Game Over: You ate yourself!');
            return;
        }
    }

    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight){
        gameOver = true;
        alert('Game Over: You hit a wall!');
        return;
    }


    snake.unshift(head);

    if (!foodCollision) {
        snake.pop();
    }

    foodCollision = false;
}

function spawnFood() {
    if (currentFood <= maxFood) {
        const randPositionX = Math.floor(Math.random() * gridWidth);
        const randPositionY = Math.floor(Math.random() * gridHeight);

        const newFoodLocation = { x: randPositionX, y: randPositionY };

        food.push(newFoodLocation);

        currentFood++;
    }

}

function checkForFoodCollision() {
    const originalFoodCount = food.length;

    food = food.filter(foodItem => {
        return !(snake[0].x === foodItem.x && snake[0].y === foodItem.y);
    })

    const foodWasEaten = food.length < originalFoodCount;
    if (foodWasEaten) {
        currentFood--;
        foodCollision = true;
        spawnFood();
        scoreNum += 10;
    }

    return foodWasEaten;
}

function scoreMultipliers() {
    if (scoreNum > 100) updateInterval = 150;
    else if (scoreNum > 200) updateInterval = 100;
    else if (scoreNum > 300) updateInterval = 50;
}

// -- GAME ENGINE --
function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);

    score.innerHTML = `${scoreNum}`;

    const deltaTime = currentTime - lastUpdateTime;
    if (deltaTime > updateInterval) {
        lastUpdateTime = currentTime;

        updateSnake(direction);
        spawnFood();
        checkForFoodCollision();
        scoreMultipliers();
    }

    clearCanvas();
    drawSnake();
    drawFood();

}

// -- INPUT HANDLING --
document.addEventListener("keydown", (e) => {
    const key = e.key;

    if (key === 'ArrowUp' && direction !== 'down') {
        direction = 'up';
    } else if (key === 'ArrowDown' && direction !== 'up') {
        direction = 'down';
    } else if (key === 'ArrowLeft' && direction !== 'right') {
        direction = 'left';
    } else if (key === 'ArrowRight' && direction !== 'left') {
        direction = 'right';
    }
});

requestAnimationFrame(gameLoop);