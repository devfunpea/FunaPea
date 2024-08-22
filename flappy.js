const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load high score from localStorage
let highScore = parseInt(localStorage.getItem('highScore')) || 0;

// Initialize game variables
const bird = { x: 50, y: canvas.height / 2, width: 40, height: 40, gravity: 0.6, lift: -10, velocity: 0 };
let pipes = [];
const basePipeWidth = 50;
const pipeGap = 200;
let pipeFrequency = 90;
let frameCount = 0;
let score = 0;
let gamePaused = false;
let fallingAnimation = false;
let fallingFrameCount = 0;

function handleInput() {
    if (!gamePaused && !fallingAnimation) {
        bird.velocity = bird.lift;
    }
}

document.addEventListener('keydown', handleInput);
document.addEventListener('touchstart', (event) => {
    event.preventDefault();
    handleInput();
});

function drawBird() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    ctx.fillStyle = 'green';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.height);
        ctx.fillRect(pipe.x, pipe.height + pipeGap, pipe.width, canvas.height - pipe.height - pipeGap);
    });
}

function updatePipes() {
    if (frameCount % pipeFrequency === 0) {
        const height = Math.floor(Math.random() * (canvas.height - pipeGap - 100)) + 50;
        const width = basePipeWidth + (score >= 20 ? 20 : 0);
        pipes.push({ x: canvas.width, width, height });
    }
    pipes.forEach(pipe => {
        pipe.x -= 2;
    });
    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
}

function detectCollision() {
    pipes.forEach(pipe => {
        if (bird.x < pipe.x + pipe.width && bird.x + bird.width > pipe.x &&
            (bird.y < pipe.height || bird.y + bird.height > pipe.height + pipeGap)) {
            fallingAnimation = true; // Trigger falling animation
            gamePaused = true;
            document.getElementById('score').textContent = `Score: ${score}`;
            document.getElementById('restart-score').textContent = `Score: ${score}`;
            setTimeout(() => {
                shakeCanvas();
                bird.velocity = 0;
            }, 100);
            setTimeout(() => {
                document.getElementById('restart').style.display = 'block';
            }, 1000);
        }
    });
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        fallingAnimation = true; // Trigger falling animation
        gamePaused = true;
        document.getElementById('score').textContent = `Score: ${score}`;
        document.getElementById('restart-score').textContent = `Score: ${score}`;
        setTimeout(() => {
            shakeCanvas();
            bird.velocity = 0;
        }, 100);
        setTimeout(() => {
            document.getElementById('restart').style.display = 'block';
        }, 1000);
    }
}

function shakeCanvas() {
    let shakeCount = 0;
    const interval = setInterval(() => {
        if (shakeCount >= 10) {
            clearInterval(interval);
            canvas.style.transform = 'translate(0, 0)';
            return;
        }
        shakeCount++;
        canvas.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
    }, 50);
}

function updateScore() {
    pipes.forEach(pipe => {
        if (pipe.x + pipe.width === bird.x) {
            score++;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
                document.getElementById('highscore').textContent = `High Score: ${highScore}`;
            }
            document.getElementById('score').textContent = `Score: ${score}`;
            if (score >= 20) {
                pipeFrequency = 80;
                if (score >= 30) pipeFrequency = 70;
                if (score >= 40) pipeFrequency = 60;
                if (score >= 50) pipeFrequency = 50;
                if (score >= 60) pipeFrequency = 40;
                if (score >= 70) pipeFrequency = 30;
                if (score >= 80) pipeFrequency = 20;
                if (score >= 90) pipeFrequency = 15;
            }
        }
    });
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('restart').style.display = 'none';
    gamePaused = false;
    fallingAnimation = false; // Reset falling animation
    fallingFrameCount = 0;
}

function gameLoop() {
    if (!gamePaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        if (bird.y < 0) bird.y = 0;
        if (bird.y + bird.height > canvas.height) bird.y = canvas.height - bird.height;

        drawBird();
        updatePipes();
        drawPipes();
        detectCollision();
        updateScore();

        frameCount++;
    } else if (fallingAnimation) {
        // Animate falling effect
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPipes(); // Show pipes during falling animation

        bird.velocity += bird.gravity; // Apply gravity effect
        bird.y += bird.velocity; // Move bird based on velocity

        if (bird.y + bird.height > canvas.height) {
            bird.y = canvas.height - bird.height; // Stop falling at bottom boundary
            bird.velocity = 0; // Stop the bird's vertical movement
            fallingAnimation = false;
            gamePaused = true; // Keep the game paused after animation
        }

        drawBird();
        requestAnimationFrame(gameLoop);
        return; // Skip normal game loop if animating falling
    }

    requestAnimationFrame(gameLoop);
}


// Initialize high score display
document.getElementById('highscore').textContent = `High Score: ${highScore}`;

gameLoop();
