class MovableObject {
    x;
    y;
    width;
    height;
    img;
    imageCache = {};
    currentImage = 0;
    speed = 0.15;

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

     playAnimation(images) {
        this.currentImage = this.currentImage % images.length;
        let path = images[this.currentImage];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    moveRight() {
        this.x += this.speed;
    }
    

}