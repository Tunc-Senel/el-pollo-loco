/**
 * A collectable salsa bottle placed in the level. Depending on its spawn height it shows
 * either a ground sprite (one of two variants, chosen at random) or the floating sprite,
 * so ground and mid-air bottles look right. Built on DrawableObject (it does not move).
 */
class Bottle extends DrawableObject {
    width = 50;
    height = 75;
    offset = {
        top: 5,
        bottom: 5,
        left: 10,
        right: 10
    }

    /**
     * Sprites: indexes 0/1 are the two ground variants, index 2 is the floating bottle.
     */
    IMAGES = [
        "assets/img/6_salsa_bottle/1_salsa_bottle_on_ground.png",
        "assets/img/6_salsa_bottle/2_salsa_bottle_on_ground.png",
        "assets/img/6_salsa_bottle/salsa_bottle.png"
    ]

    /**
     * Preloads the sprites, picks the correct one for the height and places the bottle.
     * @param {number} x Horizontal position in the level.
     * @param {number} y Vertical position; also decides the ground vs. floating sprite.
     */
    constructor(x, y) {
        super().loadImage("assets/img/6_salsa_bottle/1_salsa_bottle_on_ground.png");
        this.loadImages(this.IMAGES);
        this.selectCorrectBottle(y);
        this.collectableObjectPlacement(x, y); 
    }

    /**
     * Chooses the sprite by spawn height: bottles low on the ground get one of the two
     * ground variants at random, higher ones use the floating sprite.
     * @param {number} y Vertical spawn position; 250 or more counts as on the ground.
     */
    selectCorrectBottle(y) {
        if (y >= 250) {
            let bottleOnGroundIndex = Math.round(Math.random())
            let path = this.IMAGES[bottleOnGroundIndex];
            this.img = this.imageCache[path];   
        } else {
            let bottleAboveGroundIndex = 2;
            let path = this.IMAGES[bottleAboveGroundIndex];
            this.img = this.imageCache[path];   
        }
    }
}