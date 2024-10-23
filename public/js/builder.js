/**
 * SpriteManager class to handle sprite retrieval and color manipulation.
 */
class SpriteManager {
    constructor() {
        this.sprites = {};
    }

    /**
     * Adds a sprite to the manager.
     * @param {string} type - The type of the sprite (e.g., 'grass', 'floor').
     * @param {string} imagePath - The path to the sprite image (e.g., 'grass.png').
     * @param {number} spriteWidth - The width of each sprite in pixels (16 for 16x16).
     * @param {number} spriteHeight - The height of each sprite in pixels (16 for 16x16).
     */
    addSprite(type, imagePath, spriteWidth, spriteHeight) {
        this.sprites[type] = {
            imagePath: imagePath,
            spriteWidth: spriteWidth,
            spriteHeight: spriteHeight,
            items: this._createItems(imagePath, spriteWidth, spriteHeight)
        };
    }

    /**
     * Generates item positions for the sprite based on image dimensions.
     * @param {string} imagePath - The path to the sprite image.
     * @param {number} spriteWidth - The width of each sprite.
     * @param {number} spriteHeight - The height of each sprite.
     * @returns {Array} - Array of item positions.
     * @private
     */
    _createItems(imagePath, spriteWidth, spriteHeight) {
        const img = new Image();
        img.src = imagePath;

        // Placeholder for storing item positions
        const items = [];

        img.onload = () => {
            const totalItems = (img.width / spriteWidth) * (img.height / spriteHeight);
            for (let i = 0; i < totalItems; i++) {
                const x = (i % (img.width / spriteWidth)) * spriteWidth;
                const y = Math.floor(i / (img.width / spriteWidth)) * spriteHeight;
                items.push({ index: i, x: x, y: y });
            }
        };

        return items;
    }

    /**
     * Retrieves a sprite based on the specified criteria.
     * @param {Object} request - The request object containing type, item, and color.
     * @returns {Object|null} - The sprite object or null if not found.
     */
    getSprite(request) {
        const { type, item, color = 'default' } = request;

        if (this.sprites[type]) {
            const spriteInfo = this.sprites[type];
            const items = spriteInfo.items;

            if (item < items.length) {
                const sprite = {
                    imagePath: spriteInfo.imagePath,
                    position: items[item],
                    color: color
                };
                return sprite;
            } else {
                console.warn(`Item ${item} exceeds max items: ${items.length}`);
                return null;
            }
        } else {
            console.error(`Sprite type "${type}" not found.`);
            return null;
        }
    }
}

// Example usage of SpriteManager
const spriteManager = new SpriteManager();
spriteManager.addSprite('grass', 'path/to/grass.png', 16, 16);
spriteManager.addSprite('floor', 'path/to/floor.png', 16, 16);

// Retrieve a grass sprite (example item 6, with red color)
const grassSprite = spriteManager.getSprite({ type: 'grass', item: 6, color: 'red' });

/**
 * Function to initialize the game and add the grass sprite to the canvas.
 */
function initializeGame() {
    const gameCanvas = document.getElementById('gameCanvas');

    if (grassSprite) {
        // Create an image element to represent the sprite
        const spriteElement = document.createElement('img');
        spriteElement.src = grassSprite.imagePath;
        spriteElement.style.position = 'absolute';
        spriteElement.style.left = `${grassSprite.position.x}px`;
        spriteElement.style.top = `${grassSprite.position.y}px`;
        spriteElement.style.width = `${16}px`; // Width of the sprite
        spriteElement.style.height = `${16}px`; // Height of the sprite

        // Add some styling for the color (if needed)
        if (grassSprite.color !== 'default') {
            spriteElement.style.filter = `hue-rotate(${getColorRotation(grassSprite.color)}deg)`;
        }

        // Append the sprite to the gameCanvas div
        gameCanvas.appendChild(spriteElement);
    } else {
        console.error('Failed to load grass sprite');
    }
}

/**
 * Utility function to convert color names to hue-rotate values for CSS.
 * This is just a basic example for handling color adjustments.
 * @param {string} color - Color name (e.g., 'red', 'green', etc.).
 * @returns {number} - The hue-rotate degree for CSS.
 */
function getColorRotation(color) {
    const colorMap = {
        red: 0,
        green: 120,
        blue: 240,
        // Add more color mappings if needed
    };
    return colorMap[color] || 0;
}
