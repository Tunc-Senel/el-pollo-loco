class DrawableObject {
    x;
    y;
    width;
    height;
    img;
    imageCache = {};

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
    
    collectableObjectPlacement(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 100;    
    }
    
}