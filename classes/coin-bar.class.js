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

    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.x = 60;
        this.y = 40;
        this.width = 200;
        this.height = 50;
        this.setPercentage(this.percentage);
    }

}