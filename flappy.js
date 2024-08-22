const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    gravity: 1, // Increased gravity for more realistic fall
    lift: -10, // Increased lift for a stronger jump
    velocity: 0
};

let pipes = [];
const pipeWidth = 50;
const pipeGap = 150;
const pipeFrequency = 90;
let frameCount = 0;
let score = 0;
let highScore = 0;
let gamePaused = false;

function handleInput() {
    if (!gamePaused) {
        bird.velocity = bird.lift;
    }
}

// Add event listeners for keyboard and touchscreen controls
document.addEventListener('keydown', handleInput);
document.addEventListener('touchstart', (event) => {
    event.preventDefault(); // Prevent default touch behavior
    handleInput();
});

function drawBird() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    ctx.fillStyle = 'green';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.height);
        ctx.fillRect(pipe.x, pipe.height + pipeGap, pipeWidth, canvas.height - pipe.height - pipeGap);
    });
}

function updatePipes() {
    if (frameCount % pipeFrequency === 0) {
        const height = Math.floor(Math.random() * (canvas.height - pipeGap - 100)) + 50; // Ensure pipes are within canvas height
        pipes.push({ x: canvas.width, height });
    }
    pipes.forEach(pipe => {
        pipe.x -= 2;
    });
    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
}

function detectCollision() {
    pipes.forEach(pipe => {
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.height || bird.y + bird.height > pipe.height + pipeGap)) {
            gamePaused = true;
            document.getElementById('score').textContent = `Score: ${score}`;
            document.getElementById('restart-score').textContent = `Score: ${score}`;
            setTimeout(() => {
                shakeCanvas();
                bird.velocity = 0; // Stop vertical movement upon collision
            }, 100);
            setTimeout(() => {
                document.getElementById('restart').style.display = 'block';
            }, 1000);
        }
    });
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        gamePaused = true;
        document.getElementById('score').textContent = `Score: ${score}`;
        document.getElementById('restart-score').textContent = `Score: ${score}`;
        setTimeout(() => {
            shakeCanvas();
            bird.velocity = 0; // Stop vertical movement upon collision
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
        if (pipe.x + pipeWidth === bird.x) {
            score++;
            if (score > highScore) {
                highScore = score;
                document.getElementById('highscore').textContent = `High Score: ${highScore}`;
            }
            document.getElementById('score').textContent = `Score: ${score}`;
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
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
