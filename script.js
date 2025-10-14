//Get the canvas element and its 2D rendering context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");

const game = document.querySelector('.game');
const welcomeBubble = document.querySelector('.welcome_bubble');
const start = document.getElementById('start');

const pausedScreen = document.querySelector('.paused_screen');
const resetGame = document.getElementById('reset_game');

let highscoreNum = document.getElementById('highscore_num');
let score = document.getElementById('score_num');
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
let gamePause = true;
let gameStart = false;

let lastUpdateTime = 0;
let updateInterval = 300; 

let gameOver = false;

let maxFood = 1;
let currentFood = 1;
let foodCollision = false;

let touchStartX = 0;
let touchStartY = 0;
let touchDist = 30;

// -- DRAWING FUNCTIONS --
function clearCanvas() {
    ctx.fillStyle = '#003333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    snake.forEach(segment => {

        const x = segment.x * cellSize;
        const y = segment.y * cellSize;

        ctx.fillStyle = '#005500';
        ctx.fillRect(x, y, cellSize, cellSize);

        const inset = 1;
        ctx.fillStyle = '#33AA33';
        ctx.fillRect(x + inset, y + inset, cellSize - inset * 2, cellSize - inset * 2);

        if (segment === snake[0]) {
            ctx.fillStyle = 'white';
            if (direction === 'left'){
                ctx.fillRect(x + 4, y + 4, 2, 2);
                ctx.fillRect(x + 4, y + 14, 2, 2);
            } else if (direction === 'right'){
                ctx.fillRect(x + 14, y + 4, 2, 2);
                ctx.fillRect(x + 14, y + 14, 2, 2);
            } else if (direction === 'up'){
                ctx.fillRect(x + 4, y + 3, 2, 2);
                ctx.fillRect(x + 14, y + 3, 2, 2);
            } else if (direction === 'down') {
                ctx.fillRect(x + 4, y + 14, 2, 2);
                ctx.fillRect(x + 14, y + 14, 2, 2);
            }
        }
    })
}

function drawFood() {
    
    food.forEach(item => {

        const x = item.x * cellSize;
        const y = item.y * cellSize;

        const centerX = x + (cellSize / 2);
        const centerY = y + (cellSize / 2);

        const radius = (cellSize / 2) - 3;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 1, 0, Math.PI * 2);
        ctx.fillStyle = '#990000';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ff5555';
        ctx.fill();

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

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
            localStorage.setItem('highscore', scoreNum);
            alert('Game Over: You ate yourself!');
            return;
        }
    }

    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        gameOver = true;
        localStorage.setItem('highscore', scoreNum);
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
    if (scoreNum >= 100 && scoreNum < 200) {
        updateInterval = 225;
        maxFood = 2;
    }
    else if (scoreNum >= 200 && scoreNum < 300) {
        updateInterval = 150;
        maxFood = 3;
    }
    else if (scoreNum >= 300) {
        updateInterval = 75;
        maxFood = 4;
    }
}

function readHS() {
    let retrievedHighScore = localStorage.getItem('highscore') ?? '0';
    return retrievedHighScore;
}

function handleTouchStart(event) {
    if (gameStart && !gameOver) {
        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }
}

function handleTouchEnd(event) {
    if (!gameStart || gameOver) return;

    const touch = event.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if(Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > touchDist) {
            if (diffX > 0 && direction !== 'left'){
                direction = 'right';
            } else if (diffX < 0 && direction !== 'right') {
                direction = 'left';
            }
            gamePause = false;
        }
    } else {
        if (Math.abs(diffY) > touchDist) {
            if (diffY > 0 && direction !== 'up') {
                direction = 'down';
            } else if (diffY < 0 && direction !== 'down') {
                direction = 'up';
            }
        }
        gamePause = false;
    }
    event.preventDefault();
}

// -- GAME ENGINE --
function gameLoop(currentTime) {

    requestAnimationFrame(gameLoop);

    if (!gamePause) {

        score.innerHTML = `${scoreNum}`;
        highscoreNum.innerHTML = `${readHS()}`;

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
}

// -- INPUT HANDLING --
document.addEventListener("keydown", (e) => {
    const key = e.key;

    if (gameStart) {
        if ((key === 'ArrowUp' || key === 'w') && direction !== 'down') {
            direction = 'up';
            gamePause = false;
        } else if ((key === 'ArrowDown' || key === 's') && direction !== 'up') {
            direction = 'down';
            gamePause = false;
        } else if ((key === 'ArrowLeft' || key === 'a') && direction !== 'right') {
            direction = 'left';
            gamePause = false;
        } else if ((key === 'ArrowRight' || key === 'd') && direction !== 'left') {
            direction = 'right';
            gamePause = false;
        } else if (key === ' ' || key === 'Escape') {
            gamePause = !gamePause
            if (gamePause && gameStart) {
                pausedScreen.style.display = 'flex';
            } else {
                pausedScreen.style.display = 'none';
            }
        };
    }
});

start.addEventListener("click", (e) => {
    welcomeBubble.style.display = 'none';
    gameStart = true;
    game.style.display = 'flex';
    setTimeout(() => { gamePause = false }, 1000);
});

resetGame.addEventListener("click", (e) => {
    scoreNum = 0
    snake = [
        { x: 10, y: 10 }
    ];
    food = [];
    direction = 'right';
    gamePause = false;
    gameStart = true;
    lastUpdateTime = 0;
    updateInterval = 300; 
    gameOver = false;
    maxFood = 1;
    currentFood = 1;
    foodCollision = false;
});

canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchend', handleTouchEnd, false);

requestAnimationFrame(gameLoop);