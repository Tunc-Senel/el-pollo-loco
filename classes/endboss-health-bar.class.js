/**
 * Health bar for the endboss, shown top-right once the boss appears. otherDirection is
 * set so the bar is mirrored to fill from the right. Reuses StatusBar's percentage-to-sprite
 * logic; endbossAppeared gates whether the renderer draws it.
 */
class EndbossHealthBar extends StatusBar {
    percentage = 100;
    otherDirection = true;

    /**
     * Set to true when the boss enters; the renderer only draws the bar after that.
     */
    endbossAppeared = false;

    /**
     * Orange endboss sprites from empty (0%) to full (100%) in 20% steps; index chosen by resolveImageIndex.
     */
    IMAGES = [
            "assets/img/7_statusbars/2_statusbar_endboss/orange/orange0.png",
            "assets/img/7_statusbars/2_statusbar_endboss/orange/orange20.png",
            "assets/img/7_statusbars/2_statusbar_endboss/orange/orange40.png",
            "assets/img/7_statusbars/2_statusbar_endboss/orange/orange60.png",
            "assets/img/7_statusbars/2_statusbar_endboss/orange/orange80.png",
            "assets/img/7_statusbars/2_statusbar_endboss/orange/orange100.png",
            ]

    /**
     * Preloads the bar images, fixes its top-right position and shows the initial full bar.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.x = 545;
        this.y = 3;
        this.width = 140;
        this.height = 50;
        this.setPercentage(this.percentage);
    }
}