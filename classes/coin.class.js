/**
 * A collectable coin placed in the level. Static (does not move); picking it up fills the
 * coin bar. The generous offset shrinks its collision box so it must be clearly touched.
 * Built on DrawableObject.
 */
class Coin extends DrawableObject {
    width = 100;
    height = 100;
    offset = {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
    }

    /**
     * Coin sprite.
     */
    IMAGE = "assets/img/8_coin/coin_1.png"

    /**
     * Loads the coin sprite and places it at its level position.
     */
    constructor(x, y) {
        super().loadImage(this.IMAGE);
        this.collectableObjectPlacement(x, y); 
    }
}