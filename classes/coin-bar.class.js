/** 
 * Coin bar shown between health and bottle bars; starts empty and fills as coins are collected. 
 */
class CoinBar extends StatusBar {
    percentage = 0;
    IMAGES = [
        "assets/img/7_statusbars/1_statusbar/1_statusbar_coin/blue/0.png",
        "assets/img/7_statusbars/1_statusbar/1_statusbar_coin/blue/20.png",
        "assets/img/7_statusbars/1_statusbar/1_statusbar_coin/blue/40.png",
        "assets/img/7_statusbars/1_statusbar/1_statusbar_coin/blue/60.png",
        "assets/img/7_statusbars/1_statusbar/1_statusbar_coin/blue/80.png",
        "assets/img/7_statusbars/1_statusbar/1_statusbar_coin/blue/100.png"
    ]

    /** 
     * Preloads the bar images, fixes its HUD position and shows the initial fill level. 
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.x = 30;
        this.y = 40;
        this.width = 140;
        this.height = 50;
        this.setPercentage(this.percentage);
    }

}