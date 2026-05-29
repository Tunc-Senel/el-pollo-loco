class DrawableObject {
    x;
    y;
    width;
    height;
    img;
    imageCache = {};
    otherDirection = false;
    energy = 100;
    offset = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    }

    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    loadImages(arr) {
        arr.forEach(path => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    drawObject(ctx) {
        try {
         ctx.drawImage(this.img, this.x, this.y, this.width, this.height);   
        } catch {
            console.log('Could not load image', this.img.src);
        }
    }

     isColliding(object) {
        const characterLeft = this.x + this.offset.left;
        const characterRight = this.x + this.width - this.offset.right;
        const characterTop = this.y + this.offset.top;
        const characterBottom = this.y + this.height - this.offset.bottom;
        const objectLeft = object.x;
        const objectRight = object.x + object.width;
        const objectTop = object.y;
        const objectBottom = object.y + object.height;

        return characterRight > objectLeft &&
               characterLeft < objectRight &&
               characterBottom > objectTop + 25 &&
               characterTop < objectBottom;         
    }

    isOverlappingHorizontally(object) {
        const characterLeft = this.x + this.offset.left;
        const characterRight = this.x + this.width - this.offset.right;
        const objectLeft = object.x;
        const objectRight = object.x + object.width;
  
        return characterRight > objectLeft &&
               characterLeft < objectRight 
    }

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
    
    collectableObjectPlacement(x, y) {
        this.x = x;
        this.y = y;
    }
    
}