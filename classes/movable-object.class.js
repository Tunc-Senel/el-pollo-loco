class MovableObject {
    x;
    y;
    width;
    height;
    img;

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
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
    
}