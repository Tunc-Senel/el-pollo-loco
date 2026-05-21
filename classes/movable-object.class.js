class MovableObject extends DrawableObject {
    currentImage = 0;
    speedY = 0;
    accelaration = 2.0;
    lastHit = 0;

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
            if (this.y > 170 && this instanceof Character) {
                this.y = 170;
                this.speedY = 0;
            }
        }, 1000 / 25);
    }

    isAboveGround() {
        if (this instanceof ThrowableObject) { // Throwable Object always falls
            return true;
        } else {
            return this.y < 170;
        }
    }

    jump() {
        this.speedY = 30;
    }

    hit() {
        if (!this.isHurt()) {
            this.energy -= 10;
            if (this.energy < 0) {
                this.energy = 0;
            } else {
                this.lastHit = new Date().getTime()
            }
        console.log(this.energy);
        
        }
    }

    isHurt() {
        let timepassed = new Date().getTime() - this.lastHit;
        timepassed = timepassed / 1000;
        return timepassed < 1;
    }

    isDead() {
        return this.energy == 0;
    }

}