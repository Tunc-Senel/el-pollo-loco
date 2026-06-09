/**
 * Base class for everything that can be drawn on the canvas. Holds position, size,
 * the current image plus an image cache, and provides the shared collision helpers
 * used by characters, enemies and collectables. Subclasses add movement and behavior.
 */
class DrawableObject {
    x;
    y;
    width;
    height;
    img;

    /** 
     * Preloaded images keyed by path, so animations can switch frames without reloading.
     */
    imageCache = {};

    /**
     * true when the object faces left; the renderer mirrors it accordingly.
     */
    otherDirection = false;
    energy = 100;

    /**
     * Inset of the visual sprite from its bounding box, for more forgiving collisions.
     */
    offset = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    }

    /** 
     * Sets the currently shown image (used for single, non-animated sprites).
     * @param {string} path Path to the image file.
     */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    /** 
     * Preloads a set of images into the cache so playAnimation can swap frames instantly. 
     * @param {string[]} arr Paths of the images to preload.
     */
    loadImages(arr) {
        arr.forEach(path => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    /** 
     * Draws the current image; the try/catch guards against frames that failed to load. 
     * @param {CanvasRenderingContext2D} ctx The canvas context to draw on.
     */
    drawObject(ctx) {
        try {
         ctx.drawImage(this.img, this.x, this.y, this.width, this.height);   
        } catch {
        }
    }

    /**
     * Box collision between this object and another, both shrunk by their offsets.
     * The extra +25 on the top edge keeps shallow vertical touches from counting,
     * so brushing past an enemy's head is not treated as a hit.
     * @param {DrawableObject} object The other object to test against.
     * @returns {boolean} True if the bounding boxes overlap.
     */
    isColliding(object) {
        const characterLeft = this.x + this.offset.left;
        const characterRight = this.x + this.width - this.offset.right;
        const characterTop = this.y + this.offset.top;
        const characterBottom = this.y + this.height - this.offset.bottom;
        const objectLeft = object.x + object.offset.left;
        const objectRight = object.x + object.width - object.offset.right;
        const objectTop = object.y + object.offset.top;
        const objectBottom = object.y + object.height - object.offset.bottom;

        return characterRight > objectLeft &&
               characterLeft < objectRight &&
               characterBottom > objectTop + 25 &&
               characterTop < objectBottom;         
    }

    /**
     * Pure horizontal overlap test (ignores vertical position). Used to pick up
     * ground bottles already when the character walks over them.
     * @param {DrawableObject} object The other object to test against.
     * @returns {boolean} True if the objects overlap on the x-axis.
     */
    isOverlappingHorizontally(object) {
        const characterLeft = this.x + this.offset.left;
        const characterRight = this.x + this.width - this.offset.right;
        const objectLeft = object.x;
        const objectRight = object.x + object.width;
  
        return characterRight > objectLeft &&
               characterLeft < objectRight 
    }

    /**
     * Detects a valid stomp on an enemy: only counts while falling, horizontally
     * overlapping and with the feet near the enemy's top, so the hit reads as
     * landing on the enemy rather than running into it.
     * @param {DrawableObject} enemy The enemy being tested for a stomp.
     * @returns {boolean} True if this object is stomping the enemy from above.
     */
    isStompingEnemy(enemy) {
        const characterBottom = this.y + this.height - this.offset.bottom;
        const characterLeft = this.x + this.offset.left;
        const characterRight = this.x + this.width - this.offset.right;

        const enemyTop = enemy.y + enemy.offset.top;
        const enemyLeft = enemy.x + enemy.offset.left;
        const enemyRight = enemy.x + enemy.width - enemy.offset.right;

        const isFalling = this.speedY < 0;
        const isHorizontallyOverlapping = characterRight > enemyLeft && characterLeft < enemyRight;
        const isCloseToEnemyTop = characterBottom >= enemyTop - 20 && characterBottom <= enemyTop + 5;

        return isFalling && isHorizontallyOverlapping && isCloseToEnemyTop;
    }

    /** 
     * Places a collectable (coin/bottle) at its level position. 
     * @param {number} x Horizontal position in the level.
     * @param {number} y Vertical position in the level.
     */
    collectableObjectPlacement(x, y) {
        this.x = x;
        this.y = y;
    }
    
}