class FlappyBird {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.audioManager = new AudioManager();
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 450;
        
        // Game state
        this.gameOver = false;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        
        // Bird properties
        this.bird = {
            x: this.canvas.width / 4,
            y: this.canvas.height / 2,
            velocity: 0,
            gravity: 0.5,
            jump: -8,
            size: 30
        };
        
        // Pipes properties
        this.pipes = [];
        this.pipeWidth = 60;
        this.pipeGap = 150;
        this.pipeInterval = 1500; // Milliseconds between pipe spawns
        this.lastPipeSpawn = 0;
        
        // Event listeners
        this.bindEvents();
        
        // Start game loop
        this.lastTime = 0;
        this.animate(0);
    }
    
    bindEvents() {
        // Handle click/space for jump
        const jumpHandler = (e) => {
            if (e.type === 'keydown' && e.code !== 'Space') return;
            
            if (this.gameOver) {
                this.restart();
                return;
            }
            
            this.bird.velocity = this.bird.jump;
            this.audioManager.playSound('jump');
        };
        
        this.canvas.addEventListener('click', jumpHandler);
        document.addEventListener('keydown', jumpHandler);
        
        document.getElementById('restartButton').addEventListener('click', () => this.restart());
    }
    
    spawnPipe() {
        const minHeight = 50;
        const maxHeight = this.canvas.height - this.pipeGap - minHeight;
        const height = Math.random() * (maxHeight - minHeight) + minHeight;
        
        this.pipes.push({
            x: this.canvas.width,
            height: height,
            passed: false
        });
    }
    
    update(deltaTime) {
        if (this.gameOver) return;
        
        // Update bird
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Spawn pipes
        if (Date.now() - this.lastPipeSpawn > this.pipeInterval) {
            this.spawnPipe();
            this.lastPipeSpawn = Date.now();
        }
        
        // Update pipes
        this.pipes.forEach(pipe => {
            pipe.x -= 3;
            
            // Check for score
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true;
                this.score++;
                this.audioManager.playSound('score');
                document.getElementById('score').textContent = this.score;
            }
            
            // Check collision
            if (this.checkCollision(pipe)) {
                this.gameOver = true;
                this.showGameOver();
            }
        });
        
        // Remove off-screen pipes
        this.pipes = this.pipes.filter(pipe => pipe.x + this.pipeWidth > 0);
        
        // Check boundary collision
        if (this.bird.y < 0 || this.bird.y + this.bird.size > this.canvas.height) {
            this.gameOver = true;
            this.showGameOver();
        }
    }
    
    checkCollision(pipe) {
        return (
            this.bird.x + this.bird.size > pipe.x &&
            this.bird.x < pipe.x + this.pipeWidth &&
            (this.bird.y < pipe.height || 
             this.bird.y + this.bird.size > pipe.height + this.pipeGap)
        );
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#70c5ce';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw pipes
        this.ctx.fillStyle = '#2ecc71';
        this.pipes.forEach(pipe => {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.height);
            // Bottom pipe
            this.ctx.fillRect(
                pipe.x,
                pipe.height + this.pipeGap,
                this.pipeWidth,
                this.canvas.height - pipe.height - this.pipeGap
            );
        });
        
        // Draw bird
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.fillRect(
            this.bird.x,
            this.bird.y,
            this.bird.size,
            this.bird.size
        );
    }
    
    animate(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame(time => this.animate(time));
    }
    
    showGameOver() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            document.getElementById('highScore').textContent = this.highScore;
        }
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.remove('d-none');
    }
    
    restart() {
        this.bird.y = this.canvas.height / 2;
        this.bird.velocity = 0;
        this.pipes = [];
        this.score = 0;
        this.gameOver = false;
        this.lastPipeSpawn = 0;
        
        document.getElementById('score').textContent = '0';
        document.getElementById('gameOver').classList.add('d-none');
    }
}

// Start game when page loads
window.addEventListener('load', () => {
    new FlappyBird();
});
