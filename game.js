const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game Variables
let bird = { x: 50, y: canvas.height / 2, width: 250, height: 250, gravity: 0.2, jump: 4.0, velocity: 0 };

let pipes = [];
let frame = 0;
let score = 0;

// Load images (optional)
const birdImage = new Image();
birdImage.src = 'bird.png'; // You can add a custom bird image
const spikeTopImage = new Image();
spikeTopImage.src = 'pipe-top.png'; // Custom pipe images (optional)
const spikeBottomImage = new Image();
spikeBottomImage.src = 'pipe-top.jpg';

const backgroundImage = new Image();
backgroundImage.src = 'moon.png';  // Make sure the path is correct

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Adjust bird position based on new canvas size
    bird.x = canvas.width * 0.1;
    bird.y = canvas.height / 2;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();  // Call this initially to set the canvas size


function drawBird() {
    // Check if the image has loaded before drawing it
    if (birdImage.complete) {
        ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
    } else {
        // Fallback in case image hasn't loaded yet
        ctx.fillStyle = "blue";
        ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    }

    // Debug: Draw the bird's hitbox (optional, you can remove this)
    //ctx.strokeStyle = "red";
    //ctx.strokeRect(bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Draw top spikes (repeated along the pipe's height)
        if (spikeTopImage.complete) {
            let spikeHeight = spikeTopImage.height * (pipe.width / spikeTopImage.width);  // Maintain aspect ratio
            let numSpikes = Math.ceil(pipe.height / spikeHeight);  // Calculate how many spikes fit along the height

            for (let i = 0; i < numSpikes; i++) {
                let yPos = pipe.y + i * spikeHeight;  // Y position for each spike
                ctx.drawImage(spikeTopImage, pipe.x, yPos, pipe.width, spikeHeight);
            }
        } else {
            // Fallback: draw rectangle if image is not loaded
            ctx.fillStyle = "green";
            ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
        }

        // Draw bottom spikes (repeated along the bottom pipe's height)
        if (spikeBottomImage.complete) {
            let spikeHeight = spikeBottomImage.height * (pipe.width / spikeBottomImage.width);  // Maintain aspect ratio
            let pipeBottomY = pipe.y + pipe.height + pipe.gap;  // Starting Y position for the bottom pipe
            let bottomPipeHeight = canvas.height - (pipe.height + pipe.gap);  // Height of the bottom pipe
            let numSpikesBottom = Math.ceil(bottomPipeHeight / spikeHeight);  // Calculate how many spikes fit along the height

            for (let i = 0; i < numSpikesBottom; i++) {
                let yPos = pipeBottomY + i * spikeHeight;  // Y position for each spike
                ctx.drawImage(spikeBottomImage, pipe.x, yPos, pipe.width, spikeHeight);
            }
        } else {
            // Fallback: draw rectangle if image is not loaded
            ctx.fillStyle = "green";
            ctx.fillRect(pipe.x, pipe.y + pipe.height + pipe.gap, pipe.width, canvas.height - pipe.height - pipe.gap);
        }
    });
}


function updatePipes() {
    const minHeight = 50;  // Minimum height for the top spike
    const maxHeight = canvas.height / 2;  // Maximum height for the top spike
    const gap = 120;  // Adjust the gap between spikes

    pipes.forEach(pipe => {
        pipe.x -= 2;  // Move the pipes (now spikes) to the left
    });

    // Generate new spikes every 100 frames
    if (frame % 100 === 0) {
        const pipeHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        const topSpike = { x: canvas.width, y: 0, width: 40, height: pipeHeight, gap: gap };
        const bottomSpike = {
            x: canvas.width,
            y: pipeHeight + gap,
            width: 40,
            height: canvas.height - (pipeHeight + gap)
        };

        pipes.push(topSpike);
        pipes.push(bottomSpike);
    }

    // Remove spikes when off the screen
    if (pipes.length && pipes[0].x + pipes[0].width < 0) {
        pipes.shift();
        pipes.shift();
        score++;
    }
}




function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Prevent bird from flying off the canvas (top or bottom)
    if (bird.y < 0) {
        bird.y = 0; // Stop the bird from going above the canvas
    } 
    if (bird.y + bird.height > canvas.height) {
        bird.y = canvas.height - bird.height; // Stop the bird from falling below the canvas
    }
}


function updatePipes() {
    const minHeight = 50; 
    const maxHeight = canvas.height / 2; 
    const gap = 120;

    pipes.forEach(pipe => {
        pipe.x -= 2; // Move pipes to the left
    });

    // Generate new pipes every 100 frames
    if (frame % 100 === 0) {
        const pipeHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        const topPipe = { x: canvas.width, y: 0, width: 40, height: pipeHeight };
        const bottomPipe = {
            x: canvas.width,
            y: pipeHeight + gap,
            width: 40,
            height: canvas.height - (pipeHeight + gap)
        };

        // Push both pipes into the pipes array
        pipes.push(topPipe);
        pipes.push(bottomPipe);
    }

    // Remove pipes when they move off-screen
    if (pipes.length && pipes[0].x + pipes[0].width < 0) {
        pipes.shift();
        pipes.shift(); // Remove both top and bottom pipes at the same time
        score++;
    }
}



function detectCollision() {
    // Check if bird hit the top or bottom of the canvas
    if (bird.y + bird.height >= canvas.height || bird.y <= 0) {
        console.log("Bird hit the boundary:", bird.y);
        return true;
    }

    // Iterate over pipes and check collisions
    for (let i = 0; i < pipes.length; i += 2) {
        const topPipe = pipes[i];
        const bottomPipe = pipes[i + 1]; // Pipes are paired (top and bottom)

        // Horizontal collision check
        if (bird.x + bird.width > topPipe.x && bird.x < topPipe.x + topPipe.width) {
            // Vertical collision with top or bottom pipes
            if (bird.y < topPipe.height || bird.y + bird.height > bottomPipe.y) {
                console.log("Collision detected at pipe:", topPipe);
                return true;
            }
        }
    }

    return false;
}







function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    frame = 0;
    score = 0;
}

function drawBackground() {
    if (backgroundImage.complete) {
        // Scale the background to fit the entire canvas
        ctx.drawImage(backgroundImage, -75, 0, canvas.width+150, canvas.height);
    } else {
        // Fallback: Fill with a solid color if the image is not loaded yet
        ctx.fillStyle = "#70c5ce"; // Light blue background color
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function adjustGameElements() {
    // Scale bird and pipes based on canvas size
    bird.width = canvas.width * 0.05;  // 5% of the screen width
    bird.height = canvas.height * 0.05;  // 5% of the screen height

    pipes.forEach(pipe => {
        pipe.width = canvas.width * 0.1;  // Adjust pipe width based on screen width
        pipe.gap = canvas.height * 0.3;   // Adjust gap between pipes based on screen height
    });
}

function gameLoop() {
    frame++;

    // Clear the canvas for the next frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Adjust game elements based on current screen size
    adjustGameElements();

    // Draw the background
    drawBackground();

    // Update and draw bird
    updateBird();
    drawBird();

    // Update and draw pipes
    updatePipes();
    drawPipes();

    // Detect collision
    if (detectCollision()) 
    {

        if(score < 111)
        {
            alert("Game Over! \nYou lose! \nYour score is: " + score);
        }
        else
        {
            alert("Love u! Invitation on 7/10/2024 19:00. \nYour score is: " + score);
        }

        resetGame();
    }

    // Display score
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("Score(Goal 111): " + score, 10, 20);

    // Loop the game
    requestAnimationFrame(gameLoop);
}

// Listen for spacebar key to make the bird jump
window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault(); 
        bird.velocity = -bird.jump;
    }
});

// Listen for touchstart event on mobile to make the bird jump
window.addEventListener("touchstart", (e) => {
    e.preventDefault();  // Prevent touch scrolling or zooming
    bird.velocity = -bird.jump;  // Make the bird jump
}, { passive: false });  // Use passive: false to ensure preventDefault works


// Start the game loop
gameLoop();
