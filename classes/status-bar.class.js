/**
 * Base class for all HUD bars (health, coins, bottles). Maps a fill percentage to
 * one of six sprite images and draws it. Subclasses supply the concrete images and
 * the screen position.
 */
class StatusBar extends DrawableObject {
    
    constructor() {
        super();
    }

    /** 
     * Updates the fill level and switches to the sprite matching the new percentage.
     * @param {number} percentage The new fill level (0-100).
     */
    setPercentage(percentage) {
        this.percentage = percentage;
        let path = this.IMAGES[this.resolveImageIndex()]
        this.img = this.imageCache[path];
    }

    /** 
     * Maps the current percentage to an image index (0..5) in 20% steps. 
     */
    resolveImageIndex() {
        if (this.percentage > 80) {
            return 5;
        } else if (this.percentage > 60) {
            return 4;
        } else if (this.percentage > 40) {
            return 3;
        } else if (this.percentage > 20) {
            return 2;
        } else if (this.percentage > 0) {
            return 1;
        } else {
            return 0;
        }
    }

}