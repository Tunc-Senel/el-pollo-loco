class DrawableObject {
    x;
    y;
    width;
    height;
    img;
    imageCache = {};
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

    isJumpingOnEnemyHead(object) {
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
               characterBottom >= objectTop &&
               characterBottom <= objectTop + 25;
               this.speedY < 0;
    }
    
    collectableObjectPlacement(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 100;    
    }
    
}