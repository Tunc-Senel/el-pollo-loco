class BackgroundObject extends MovableObject {
    width = 720;
    height = 480;
    y = 480 - this.height;

    constructor(imagePath, x) {
        super().loadImage(imagePath);
        this.x = x;
    }

}