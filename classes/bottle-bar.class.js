/** 
 * Bottle bar shown below the health bar; starts empty and fills as bottles are collected.
 */
class BottleBar extends StatusBar {
    percentage = 0;

    /** 
     * Orange bottle sprites from empty (0%) to full (100%) in 20% steps; index chosen by resolveImageIndex.
     */
    IMAGES = [
        "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/0.png",
        "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/20.png",
        "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/40.png",
        "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/60.png",
        "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/80.png",
        "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/100.png",
    ]

    /** 
     * Preloads the bar images, fixes its HUD position and shows the initial fill level.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.x = 30;
        this.y = 80;
        this.width = 140;
        this.height = 50;
        this.setPercentage(this.percentage);
    }
}