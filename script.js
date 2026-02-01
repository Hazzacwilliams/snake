// -- INSTANCE VARIABLES --
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");

const game = document.querySelector('.game');
const welcomeBubble = document.querySelector('.welcome_bubble');
const start = document.getElementById('start');
const mediaControls = document.getElementById('media_controls');
const mediaControlsMenu = document.querySelector('.media_controls-menu');
let mediaMenuOpen = false;


const resetGame = document.getElementById('reset_game');
const pauseGameButton = document.getElementById('pause_game');
const popupScreen = document.querySelector('.popup_screen');
const popupScreenBtn = document.getElementById('popup_screen-button');
const countdownTimer = document.querySelector('.countdown');

let highscoreNum = document.getElementById('highscore_num');
let score = document.getElementById('score_num');
let scoreNum = 0;
const HIGHSCORE_KEY = 'highscore';
highscoreNum.innerHTML = getHighScore();

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
let nextDirection = 'right';

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

const musicButton = document.getElementById('play_pause');
const music = document.getElementById('music');
let isPlaying = false;

const themeToggle = document.getElementById('theme_toggle');
const themeToggleVal = document.getElementById('theme_toggle-value');
const body = document.body;
let THEME_KEY = 'snake-theme';
let isModernTheme = false;

const eatingSF = document.getElementById('eating_sf');
const gameoverSF = document.getElementById('gameover_sf');

// -- DRAWING FUNCTIONS --

/**
 * Helper function to draw rounded rectangles (for modern theme)
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Width
 * @param {number} height - Height
 * @param {number} radius - Corner radius
 * @returns {void}
 */
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

/**
 * Clears the canvas by filling it with the background color.
 * @returns {void}
 */
function clearCanvas() {
    if (isModernTheme) {
        // Modern theme: smooth dark gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(0.5, '#1e293b');
        gradient.addColorStop(1, '#0a0e27');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Subtle grid pattern
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= gridWidth; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i <= gridHeight; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(canvas.width, i * cellSize);
            ctx.stroke();
        }
    } else {
        // Classic theme: solid dark green with visible grid
        ctx.fillStyle = '#003333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Pixelated grid lines
        ctx.strokeStyle = '#001111';
        ctx.lineWidth = 1;
        for (let i = 0; i <= gridWidth; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i <= gridHeight; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(canvas.width, i * cellSize);
            ctx.stroke();
        }
    }
}

/**
 * Draws the snake's segments on the canvas, including the body and head with eyes.
 * The head's eye placement depends on the current movement direction.
 * @returns {void}
 */
function drawSnake() {
    snake.forEach((segment, index) => {

        const x = segment.x * cellSize;
        const y = segment.y * cellSize;

        if (isModernTheme) {
            // Modern theme: smooth rounded snake with gradients and shadows
            const isHead = segment === snake[0];
            const cornerRadius = 6;

            // Create shadow for depth
            ctx.shadowColor = 'rgba(99, 102, 241, 0.5)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 2;

            // Main body gradient
            const gradient = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
            if (isHead) {
                gradient.addColorStop(0, '#818cf8');
                gradient.addColorStop(0.5, '#6366f1');
                gradient.addColorStop(1, '#4f46e5');
            } else {
                gradient.addColorStop(0, '#6366f1');
                gradient.addColorStop(0.5, '#4f46e5');
                gradient.addColorStop(1, '#4338ca');
            }

            ctx.fillStyle = gradient;
            roundRect(ctx, x, y, cellSize, cellSize, cornerRadius);
            ctx.fill();

            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // Inner highlight for 3D effect
            const inset = 3;
            const innerGradient = ctx.createLinearGradient(x + inset, y + inset, x + cellSize - inset, y + cellSize - inset);
            innerGradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
            innerGradient.addColorStop(1, 'rgba(99, 102, 241, 0.2)');
            ctx.fillStyle = innerGradient;
            roundRect(ctx, x + inset, y + inset, cellSize - inset * 2, cellSize - inset * 2, cornerRadius - 1);
            ctx.fill();

            // Eyes for head - rounded
            if (isHead) {
                ctx.fillStyle = '#ffffff';
                const eyeSize = 4;
                const eyeRadius = 2;
                if (direction === 'left') {
                    roundRect(ctx, x + 5, y + 5, eyeSize, eyeSize, eyeRadius);
                    ctx.fill();
                    roundRect(ctx, x + 5, y + 11, eyeSize, eyeSize, eyeRadius);
                    ctx.fill();
                } else if (direction === 'right') {
                    roundRect(ctx, x + 11, y + 5, eyeSize, eyeSize, eyeRadius);
                    ctx.fill();
                    roundRect(ctx, x + 11, y + 11, eyeSize, eyeSize, eyeRadius);
                    ctx.fill();
                } else if (direction === 'up') {
                    roundRect(ctx, x + 5, y + 4, eyeSize, eyeSize, eyeRadius);
                    ctx.fill();
                    roundRect(ctx, x + 11, y + 4, eyeSize, eyeSize, eyeRadius);
                    ctx.fill();
                } else if (direction === 'down') {
                    roundRect(ctx, x + 5, y + 12, eyeSize, eyeSize, eyeRadius);
                    ctx.fill();
                    roundRect(ctx, x + 11, y + 12, eyeSize, eyeSize, eyeRadius);
                    ctx.fill();
                }
            }
        } else {
            // Classic theme: sharp pixelated green snake
            ctx.fillStyle = '#005500';
            ctx.fillRect(x, y, cellSize, cellSize);

            const inset = 1;
            ctx.fillStyle = '#33AA33';
            ctx.fillRect(x + inset, y + inset, cellSize - inset * 2, cellSize - inset * 2);

            // Pixelated border effect
            ctx.fillStyle = '#002200';
            ctx.fillRect(x, y, cellSize, 1);
            ctx.fillRect(x, y, 1, cellSize);
            ctx.fillRect(x + cellSize - 1, y, 1, cellSize);
            ctx.fillRect(x, y + cellSize - 1, cellSize, 1);

            if (segment === snake[0]) {
                ctx.fillStyle = 'white';
                if (direction === 'left') {
                    ctx.fillRect(x + 4, y + 4, 2, 2);
                    ctx.fillRect(x + 4, y + 14, 2, 2);
                } else if (direction === 'right') {
                    ctx.fillRect(x + 14, y + 4, 2, 2);
                    ctx.fillRect(x + 14, y + 14, 2, 2);
                } else if (direction === 'up') {
                    ctx.fillRect(x + 4, y + 3, 2, 2);
                    ctx.fillRect(x + 14, y + 3, 2, 2);
                } else if (direction === 'down') {
                    ctx.fillRect(x + 4, y + 14, 2, 2);
                    ctx.fillRect(x + 14, y + 14, 2, 2);
                }
            }
        }
    })
}

/**
 * Draws all currently spawned food items on the canvas as red circles.
 * @returns {void}
 */
function drawFood() {

    food.forEach(item => {

        const x = item.x * cellSize;
        const y = item.y * cellSize;

        const centerX = x + (cellSize / 2);
        const centerY = y + (cellSize / 2);

        const radius = (cellSize / 2) - 3;

        if (isModernTheme) {
            // Modern theme: glowing star-like food with pulsing effect
            // Outer glow with shadow
            ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
            ctx.shadowBlur = 12;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // Main gradient
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius + 3);
            gradient.addColorStop(0, '#fef3c7');
            gradient.addColorStop(0.4, '#fbbf24');
            gradient.addColorStop(0.7, '#f59e0b');
            gradient.addColorStop(1, '#d97706');

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius + 3, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;

            // Inner bright core
            const innerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            innerGradient.addColorStop(0, '#fffbeb');
            innerGradient.addColorStop(0.5, '#fcd34d');
            innerGradient.addColorStop(1, '#fbbf24');

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fillStyle = innerGradient;
            ctx.fill();

            // Bright highlight
            ctx.beginPath();
            ctx.arc(centerX - 3, centerY - 3, radius * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fill();

            // Sparkle effect - small dots
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(centerX - 6, centerY - 6, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + 6, centerY - 5, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + 5, centerY + 6, 1.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Classic theme: sharp pixelated red food (square-like)
            // Outer dark red square
            ctx.fillStyle = '#990000';
            ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

            // Inner bright red square
            ctx.fillStyle = '#ff5555';
            ctx.fillRect(x + 4, y + 4, cellSize - 8, cellSize - 8);

            // Pixelated corners for retro look
            ctx.fillStyle = '#cc0000';
            ctx.fillRect(x + 2, y + 2, 2, 2);
            ctx.fillRect(x + cellSize - 4, y + 2, 2, 2);
            ctx.fillRect(x + 2, y + cellSize - 4, 2, 2);
            ctx.fillRect(x + cellSize - 4, y + cellSize - 4, 2, 2);
        }

    })
}

// -- MOVEMENT & LOGIC --

/**
 * Updates the snake's position for one game tick.
 * 1. Commits 'nextDirection' to 'direction'.
 * 2. Calculates the new head position.
 * 3. Checks for self-collision and boundary (wall) collision.
 * 4. Adds the new head and removes the tail if no food was eaten.
 * @returns {void}
 */
function updateSnake() {

    if (gameOver) {
        return;
    }

    direction = nextDirection;

    const head = { x: snake[0].x, y: snake[0].y };

    if (direction === 'up') head.y--;
    else if (direction === 'down') head.y++;
    else if (direction === 'left') head.x--;
    else if (direction === 'right') head.x++;

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOverFunc();
        }
    }

    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        gameOverFunc();
    }


    snake.unshift(head);

    if (!foodCollision) {
        snake.pop();
    }

    foodCollision = false;
}

/**
 * Spawns a new food item at a random grid position if the maximum food limit has not been reached.
 * Note: This function does not explicitly check if the new food overlaps the snake's body.
 * @returns {void}
 */
function spawnFood() {
    if (currentFood <= maxFood) {
        const randPositionX = Math.floor(Math.random() * gridWidth);
        const randPositionY = Math.floor(Math.random() * gridHeight);

        const isOnSnake = snake.some(bodyPart => 
            bodyPart.x === randPositionX && bodyPart.y === randPositionY
        );

        if(isOnSnake) {
            spawnFood();
            return;
        }

        const newFoodLocation = { x: randPositionX, y: randPositionY };

        food.push(newFoodLocation);

        currentFood++;
    }
}

/**
 * Checks if the snake's head has collided with any food item.
 * If a collision occurs, the food is removed, the score is incremented, and 'foodCollision' is flagged.
 * @returns {boolean} True if food was eaten, otherwise false.
 */
function checkForFoodCollision() {
    const originalFoodCount = food.length;

    food = food.filter(foodItem => {
        return !(snake[0].x === foodItem.x && snake[0].y === foodItem.y);
    })

    const foodWasEaten = food.length < originalFoodCount;
    if (foodWasEaten) {
        eatingSF.play();
        currentFood--;
        foodCollision = true;
        spawnFood();
        scoreNum += 10;

    }

    return foodWasEaten;
}

/**
 * Modifies the game difficulty (speed and max food count) based on the current score.
 * Updates the global 'updateInterval' and 'maxFood' variables.
 * @returns {void}
 */
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

/**
 * Retrieves the high score from Local Storage.
 * @returns {string} The stored high score, or '0' if no score is found.
 */
function getHighScore() {
    let retrievedHighScore = localStorage.getItem(HIGHSCORE_KEY) ?? '0';
    return retrievedHighScore;
}

/**
 * Records the starting coordinates of a touch event for later swipe direction calculation.
 * @param {TouchEvent} event The touchstart event object.
 * @returns {void}
 */
function handleTouchStart(event) {
    if (gameStart && !gameOver) {
        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }
}

/**
 * Calculates the direction of a swipe gesture and sets the 'nextDirection' accordingly.
 * Prevents the snake from turning 180 degrees instantly.
 * @param {TouchEvent} event The touchend event object.
 * @returns {void}
 */
function handleTouchEnd(event) {
    if (!gameStart || gameOver) return;

    const touch = event.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > touchDist) {
            if (diffX > 0 && direction !== 'left') {
                nextDirection = 'right';
            } else if (diffX < 0 && direction !== 'right') {
                nextDirection = 'left';
            }
            gamePause = false;
        }
    } else {
        if (Math.abs(diffY) > touchDist) {
            if (diffY > 0 && direction !== 'up') {
                nextDirection = 'down';
            } else if (diffY < 0 && direction !== 'down') {
                nextDirection = 'up';
            }
        }
        gamePause = false;
    }
    event.preventDefault();
}

/**
 * Toggles the game's paused state and displays/hides the pause screen overlay.
 * @returns {void}
 */
function pauseGame() {
    if (gameStart) {
        gamePause = !gamePause;
        const pauseText = document.getElementById('pause_game-text');
        if (gamePause && gameStart) {
            popupScreen.style.display = 'flex';
            document.getElementById('popup_screen-type-icon').src = './assets/pause-play.png';
            document.getElementById('popup_screen-type').innerHTML = 'GAME PAUSED';
            popupScreenBtn.innerHTML = 'RESUME';
            if (pauseText) pauseText.innerHTML = 'RESUME';
        } else {
            popupScreen.style.display = 'none';
            if (mediaMenuOpen) mediaControlsToggle();
            if (pauseText) pauseText.innerHTML = 'PAUSE';
        }
    }

}

function countdownFunc() {
    let count = 3;
    countdownTimer.style.display = 'flex';
    countdownTimer.innerHTML = count;

    const timer = setInterval(() => {
        count--;
        if (count > 0) {
            countdownTimer.innerHTML = count;
        } else {
            countdownTimer.style.display = 'none';
            clearInterval(timer);
        }
    }, 1000);
}

/**
 * Handles the game over sequence: sets the 'gameOver' flag, plays a sound,
 * checks and saves a new high score, and displays the game over screen.
 * @returns {void}
 */
function gameOverFunc() {
    gameoverSF.play();
    gameOver = true;
    if (scoreNum > getHighScore()) {
        localStorage.setItem(HIGHSCORE_KEY, scoreNum);
        popupScreen.style.display = 'flex';
        document.getElementById('popup_screen-type-icon').src = './assets/game-over.png';
        document.getElementById('popup_screen-type').innerHTML = `NEW HIGHSCORE! ${scoreNum}`;
        popupScreenBtn.innerHTML = 'RESTART';
        return;
    }
    popupScreen.style.display = 'flex';
    document.getElementById('popup_screen-type-icon').src = './assets/game-over.png';
    document.getElementById('popup_screen-type').innerHTML = `Score: ${scoreNum}`;
    popupScreenBtn.innerHTML = 'RESTART';
    return;
}

// -- UTILITY FUNCTIONS --

/**
 * A utility function to reset all game values in the event of a game restart
 * @returns {void}
 */
function resetVals() {
    scoreNum = 0;
    snake = [
        { x: 10, y: 10 }
    ];
    food = [];
    direction = 'right';
    nextDirection = 'right';
    gamePause = false;
    gameStart = true;
    lastUpdateTime = 0;
    updateInterval = 300;
    gameOver = false;
    maxFood = 1;
    currentFood = 1;
    foodCollision = false;

    const pauseText = document.getElementById('pause_game-text');
    if (pauseText) pauseText.innerHTML = 'PAUSE';
}

function mediaControlsToggle() {
    mediaMenuOpen = !mediaMenuOpen;
    if (mediaMenuOpen) {
        if (mediaControls) mediaControls.style.display = 'grid';
        document.getElementById('menu-line1').style.transform = 'translateY(5px) rotate(45deg)';
        document.getElementById('menu-line2').style.display = 'none';
        document.getElementById('menu-line3').style.transform = 'translateY(-5px) rotate(-45deg)';
        if (!gamePause && !gameOver) {
            pauseGame();
        } 

    } else {
        mediaControls.style.display = 'none';
        document.getElementById('menu-line1').style.transform = 'translateY(0px) rotate(0deg)';
        document.getElementById('menu-line2').style.display = 'flex';
        document.getElementById('menu-line3').style.transform = 'translateY(0px) rotate(0deg)';
    }
}

// -- GAME ENGINE --

/**
 * The main game loop driven by requestAnimationFrame.
 * Updates the score display, checks the time delta, and calls logic/draw functions.
 * The game logic runs at a fixed 'updateInterval' to ensure consistent speed.
 * @param {DOMHighResTimeStamp} currentTime The timestamp provided by requestAnimationFrame.
 * @returns {void}
 */
function gameLoop(currentTime) {

    requestAnimationFrame(gameLoop);

    if (!gamePause) {

        score.innerHTML = `${scoreNum}`;
        highscoreNum.innerHTML = `${getHighScore()}`;

        const deltaTime = currentTime - lastUpdateTime;
        if (deltaTime > updateInterval) {
            lastUpdateTime = currentTime;

            updateSnake();
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
            nextDirection = 'up';
            gamePause = false;
        } else if ((key === 'ArrowDown' || key === 's') && direction !== 'up') {
            nextDirection = 'down';
            gamePause = false;
        } else if ((key === 'ArrowLeft' || key === 'a') && direction !== 'right') {
            nextDirection = 'left';
            gamePause = false;
        } else if ((key === 'ArrowRight' || key === 'd') && direction !== 'left') {
            nextDirection = 'right';
            gamePause = false;
        } else if (key === 'Escape') {
            if (gamePause) {
                countdownFunc()
                popupScreen.style.display = 'none';
                setTimeout(() => { pauseGame() }, 4000);
            } else {
                pauseGame();
            }
            
        };
    }
});

start.addEventListener("click", (e) => {
    welcomeBubble.style.display = 'none';
    gameStart = true;
    game.style.display = 'flex';
    countdownFunc();
    setTimeout(() => { gamePause = false }, 4000);
});

mediaControlsMenu.addEventListener("click", (e) => {
    mediaControlsToggle();
});

resetGame.addEventListener("click", (e) => {
    popupScreen.style.display = 'none';
    if (mediaMenuOpen) mediaControlsToggle();
    countdownFunc();
    setTimeout(() => { resetVals(); }, 4000);
});

pauseGameButton.addEventListener("click", (e) => {
    if (gamePause) {
        popupScreen.style.display = 'none';
        if (mediaMenuOpen) mediaControlsToggle();
        countdownFunc();
        setTimeout(() => { pauseGame() }, 4000);
    } else {
        pauseGame();
    }

});

popupScreenBtn.addEventListener("click", (e) => {
    if (gamePause) {
        popupScreen.style.display = 'none';
        if (mediaMenuOpen) mediaControlsToggle();
        countdownFunc();
        setTimeout(() => { pauseGame() }, 4000);
    } else {
        popupScreen.style.display = 'none';
        countdownFunc();
        setTimeout(() => { resetVals() }, 4000);

    }

})

canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchend', handleTouchEnd, false);

musicButton.addEventListener("click", (e) => {
    const musicText = document.getElementById('music_button-text');
    if (isPlaying) {
        music.pause();
        if (musicText) musicText.innerHTML = 'MUSIC';
    } else {
        music.play();
        if (musicText) musicText.innerHTML = 'MUSIC ✓';
    }
    isPlaying = !isPlaying;
});

// -- THEME TOGGLE FUNCTIONALITY --
function initTheme() {
    let savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'modern') {
        isModernTheme = true;
        body.setAttribute('data-theme', 'modern');
        document.documentElement.setAttribute('data-theme', 'modern');
        themeToggleVal.innerHTML = 'MODERN';
    } else {
        isModernTheme = false;
        body.removeAttribute('data-theme');
        document.documentElement.removeAttribute('data-theme');
        themeToggleVal.innerHTML = 'CLASSIC';
    }
}

function toggleTheme() {
    isModernTheme = !isModernTheme;
    if (isModernTheme) {
        body.setAttribute('data-theme', 'modern');
        document.documentElement.setAttribute('data-theme', 'modern');
        localStorage.setItem(THEME_KEY, 'modern');
        themeToggleVal.innerHTML = 'MODERN';
    } else {
        body.removeAttribute('data-theme');
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem(THEME_KEY, 'classic');
        themeToggleVal.innerHTML = 'CLASSIC';
    }
    clearCanvas();
    drawSnake();
    drawFood();
}

themeToggle.addEventListener('click', toggleTheme);

initTheme();

requestAnimationFrame(gameLoop);