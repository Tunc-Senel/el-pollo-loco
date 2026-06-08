/**
 * A single background layer tile. Holds the layer image and its parallax factor, so the
 * renderer can scroll distant layers more slowly than the foreground. Sized to the canvas
 * and aligned to the bottom. Built on MovableObject only to share its drawing/position code.
 */
class BackgroundObject extends MovableObject {
    width = 720;
    height = 480;
    y = 480 - this.height;

    /**
     * How strongly this layer follows the camera (1 = foreground speed, lower = further back).
     */
    parallaxFactor = 1;

    /**
     * Loads the layer image and stores its horizontal position and parallax factor.
     */
    constructor(imagePath, x, parallaxFactor = 1) {
        super().loadImage(imagePath);
        this.x = x;
        this.parallaxFactor = parallaxFactor;
    }
}