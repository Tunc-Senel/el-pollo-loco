class MovableObject extends DrawableObject {
    currentImage = 0;
    speedY = 0;
    accelaration = 2.0;

     playAnimation(images) {
        this.currentImage = this.currentImage % images.length;
        let path = images[this.currentImage];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    moveRight() {
        this.x += this.speed;
    }
    
    moveLeft() {
        this.x -= this.speed;
    }

    applyGravity() {
        setInterval( () => {
            if (this.isAboveGround() || this.speedY > 0) {    
                this.y -= this.speedY;
                this.speedY -= this.accelaration;
            }
        }, 1000 / 25);
    }

    isAboveGround() {
        return this.y < 170;
    }

    jump() {
        this.speedY = 30;
    }

}