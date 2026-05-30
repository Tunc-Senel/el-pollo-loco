class BackgroundObject extends MovableObject {
    width = 720;
    height = 480;
    y = 480 - this.height;
    parallaxFactor = 1;

    constructor(imagePath, x, parallaxFactor = 1) {
        super().loadImage(imagePath);
        this.x = x;
        this.parallaxFactor = parallaxFactor;
    }
}