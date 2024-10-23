/**
 * DevGameMaker - All-in-one game development controller.
 * Combines map creation, player control, event handling, input management, and enemy handling.
 * Replaces all client-side JavaScript modules into one object.
 * 
 * Author: BadNintendo (https://github.com/BadNintendo/mario)
 * © 2024 StickPM. All Rights Reserved.
 */

/**
 * DevGameMaker - All-in-one game development controller.
 * Combines map creation, player control, event handling, input management, and enemy handling.
 * Replaces all client-side JavaScript modules into one object.
 * 
 * Author: BadNintendo (https://github.com/BadNintendo/mario)
 * © 2024 StickPM. All Rights Reserved.
 */

class DevGameMaker {
    constructor() {
        // Initialize game entities and state
        this.maps = {};                // Maps collection
        this.enemies = [];             // Enemies array
        this.powerUps = [];            // Power-ups array
        this.eventListeners = {};      // Event listeners collection
        this.player = new Player({ x: 50, y: 100 }); // Initialize player at given position
        this.currentMap = null;        // Track the current map
        this.playerLives = 3;          // Number of player lives
        this.isPaused = false;         // State to manage game pause
        this.score = 0;                // Player's score
        this.init();                   // Call the init method to set up the game
    }

    init() {
        // Set up event listeners and start the game loop
        window.addEventListener('keydown', (event) => this.handleKeyPress(event)); // Key press handling
        requestAnimationFrame(this.gameLoop.bind(this)); // Start the game loop
    }

    /**
     * Handles key press events.
     * @param {KeyboardEvent} event - The keyboard event object.
     */
    handleKeyPress(event) {
        if (this.isPaused) return; // Ignore inputs if the game is paused

        switch(event.code) {
            case 'ArrowLeft':
                this.player.moveLeft(); // Move player left
                break;
            case 'ArrowRight':
                this.player.moveRight(); // Move player right
                break;
            case 'Space':
                this.player.jump(); // Make player jump
                break;
            case 'KeyF':
                this.player.fire(); // Player fires
                break;
            case 'Escape':
                this.togglePause(); // Toggle pause on Escape key
                break;
            case 'KeyR':
                this.restartGame(); // Restart game on 'R' key
                break;
        }
    }

    /**
     * Toggles the pause state of the game.
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        this.emit('pauseToggled', this.isPaused);
    
        if (this.isPaused) {
            // Optionally handle UI changes or audio pauses
            console.log("Game paused");
        } else {
            console.log("Game resumed");
        }
    }

    /**
     * Main game loop that updates game state and renders.
     */
    gameLoop() {
        if (this.isPaused) return; // Skip loop if paused
        this.updateEntities();      // Update all entities (player, enemies, power-ups)
        this.handleCollisions();     // Handle collision detection
        this.renderEntities();       // Render all entities to the screen
        this.cleanup();              // Clean up any destroyed entities
        requestAnimationFrame(this.gameLoop.bind(this)); // Request the next animation frame
    }

    /**
     * Updates the state of all game entities.
     */
    updateEntities() {
        // Update each entity's state
        this.enemies.forEach(enemy => enemy.update()); // Update each enemy
        this.powerUps.forEach(powerUp => powerUp.update()); // Update each power-up
        this.player.update(); // Update player
    }

    /**
     * Registers an event listener for a specific event.
     * @param {string} event - The name of the event.
     * @param {Function} callback - The callback function to execute when the event occurs.
     */
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = []; // Create array for new events
        }
        this.eventListeners[event].push(callback); // Add callback to the event
    }

    /**
     * Emits an event, calling all registered callbacks with the provided arguments.
     * @param {string} event - The name of the event to emit.
     * @param {...*} args - The arguments to pass to the event callbacks.
     */
    emit(event, ...args) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(...args)); // Call each callback
        }
    }

    /**
     * Handles collision detection between player and other entities.
     */
    handleCollisions() {
        this.enemies.forEach(enemy => this.checkPlayerCollisionWithEnemy(enemy));
        this.powerUps.forEach(powerUp => this.checkPlayerCollisionWithPowerUp(powerUp));
    }

    /**
     * Checks for collision between the player and an enemy.
     * If a collision occurs, the player takes damage and lives are decremented.
     * Emits a 'playerHit' event when the player collides with an enemy.
     * 
     * @param {Enemy} enemy - The enemy to check collision against.
     */
    checkPlayerCollisionWithEnemy(enemy) {
        if (this.player.isCollideWith(enemy) && !enemy.dying && !this.player.invincibility) {
            this.emit('playerHit', enemy); // Emit player hit event
            this.player.takeDamage(enemy.damage); // Player takes damage from enemy
            this.playerLives -= 1; // Reduce player lives
            console.log(`Player hit! Lives remaining: ${this.playerLives}`);
            if (this.playerLives <= 0) {
                this.emit('gameOver'); // Emit game over if lives are 0
                console.log('Game Over!');
                this.restartGame(); // Restart game after game over
            }
        }
    }

    /**
     * Checks for collision between the player and a power-up.
     * If a collision occurs, the power-up is activated and destroyed.
     * Emits a 'playerPowerUp' event when the player collects a power-up.
     * 
     * @param {PowerUp} powerUp - The power-up to check collision against.
     */
    checkPlayerCollisionWithPowerUp(powerUp) {
        if (this.player.isCollideWith(powerUp)) {
            this.emit('playerPowerUp', powerUp); // Emit power-up event
            powerUp.activate(this.player); // Activate the power-up
            powerUp.destroy(); // Destroy power-up after collection
        }
    }

    /**
     * Renders all entities to the screen.
     * This includes the player, enemies, power-ups, and the current map.
     */
    renderEntities() {
        // Clear the canvas or render area
        this.clearCanvas(); // Clear the rendering area before drawing

        // Render the current map if it exists
        if (this.currentMap) {
            this.currentMap.render(); // Render the map
        }

        // Render all game entities
        this.player.render(); // Render player
        this.enemies.forEach(enemy => enemy.render()); // Render enemies
        this.powerUps.forEach(powerUp => powerUp.render()); // Render power-ups
    }

    /**
     * Clears the rendering area (canvas).
     */
    clearCanvas() {
        // Assuming you have a method to get the rendering context
        const context = this.getRenderingContext(); // Obtain the rendering context
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    }

    /**
     * Cleans up destroyed entities from the game.
     */
    cleanup() {
        this.enemies = this.enemies.filter(enemy => !enemy.isDestroyed);
        this.powerUps = this.powerUps.filter(powerUp => !powerUp.isDestroyed);
    }
    
    /**
     * Restarts the game to the initial state.
     */
    restartGame() {
        this.playerLives = 3; // Reset player lives
        this.score = 0; // Reset score
        this.player.setPosition(50, 100); // Reset player position
        this.enemies.forEach(enemy => enemy.reset()); // Reset enemies
        this.powerUps.forEach(powerUp => powerUp.reset()); // Reset power-ups
        this.currentMap.reset(); // Reset the current map
        this.isPaused = false; // Unpause the game
        this.emit('gameRestarted'); // Emit event for game restart
        //this.initGameEntities();
    }
}

// Base Entity class for reusability (Player, Enemy, PowerUp all extend this)
class Entity {
    constructor(pos, sprite) {
        this.pos = [pos.x, pos.y];              // Position of the entity [x, y]
        this.vel = [0, 0];                      // Velocity [x, y]
        this.sprite = sprite;                   // Associated sprite
        this.hitbox = [pos.x, pos.y, 16, 16];   // Default hitbox
        this.dying = false;                     // State to manage enemy lifecycle
    }

    update() {
        this.pos[0] += this.vel[0];
        this.pos[1] += this.vel[1];
        this.checkBounds(); // Ensure entities stay within game bounds
    }

    checkBounds() {
        if (this.pos[0] < 0) {
            this.pos[0] = 0; // Prevent moving out of bounds
        } else if (this.pos[0] > canvas.width - this.hitbox[2]) {
            this.pos[0] = canvas.width - this.hitbox[2];
        }
        // Add vertical bounds if necessary
    }

    render(ctx, vX = 0, vY = 0) {
        this.sprite.render(ctx, this.pos[0], this.pos[1], vX, vY);
    }

    isCollideWith(entity) {
        const [x1, y1, w1, h1] = this.hitbox;
        const [x2, y2, w2, h2] = entity.hitbox;
        return !(x1 > x2 + w2 || x1 + w1 < x2 || y1 > y2 + h2 || y1 + h1 < y2);
    }

    destroy() {
        this.dying = true; // Set entity state to dying
        this.emit('destroyed'); // Emit destroyed event
    }
}

// Player class extending Entity
class Player extends Entity {
    constructor(pos) {
        super(pos, new Sprite('path/to/player/sprite')); // Update with the actual sprite path
        this.health = 100; // Initial health
        this.invincibility = false; // Initial state
    }

    moveLeft() {
        this.vel[0] = -5; // Move left
    }

    moveRight() {
        this.vel[0] = 5; // Move right
    }

    jump() {
        this.vel[1] = -10; // Jump up
    }

    fire() {
        console.log('Player fired!');
        // Logic for firing a projectile
    }

    update() {
        super.update();
        // Add gravity and collision with the ground
        this.vel[1] += 0.5; // Apply gravity

        // Reset velocity for left/right movement
        if (this.vel[0] !== 0) {
            this.vel[0] = 0; // Reset horizontal movement
        }
    }

    render() {
        // Custom render logic if needed
        super.render(); // Call parent render
    }
}

// Enemy class extending Entity
class Enemy extends Entity {
    constructor(pos) {
        super(pos, new Sprite('path/to/enemy/sprite')); // Update with actual sprite path
        this.dying = false; // Enemy state
    }

    update() {
        super.update();
        // Enemy movement logic (e.g., patrol)
        // For example, move left and right or towards the player
    }

    render() {
        // Custom render logic for enemy if needed
        super.render(); // Call parent render
    }
}

// PowerUp class extending Entity
class PowerUp extends Entity {
    constructor(pos, type) {
        super(pos, new Sprite('path/to/powerup/sprite')); // Update with actual sprite path
        this.type = type; // Type of power-up (e.g., 'speed', 'invincibility')
    }

    activate(player) {
        switch (this.type) {
            case 'speed':
                console.log('Speed power-up activated!');
                // Increase player speed logic
                break;
            case 'invincibility':
                console.log('Invincibility power-up activated!');
                player.invincibility = true;
                setTimeout(() => {
                    player.invincibility = false;
                }, 5000); // Lasts for 5 seconds
                break;
            // Add more power-up types as needed
        }
    }

    render() {
        // Custom render logic for power-up if needed
        super.render(); // Call parent render
    }
}

// Sprite class for handling sprite rendering
class Sprite {
    constructor(imagePath) {
        this.image = new Image();
        this.image.src = imagePath; // Load the image
    }

    render(ctx, x, y, vX = 0, vY = 0) {
        ctx.drawImage(this.image, x - vX, y - vY);
    }
}

// Example of how to initialize the game
const game = new DevGameMaker();
game.createMap('Level1', 100, 100);
game.renderMap('Level1');
