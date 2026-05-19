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

    drawObject(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
    
}