class BottleBar extends StatusBar {
    percentage = 0;
    IMAGES = [
        "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/0.png",
        "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/20.png",
        "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/40.png",
        "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/60.png",
        "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/80.png",
        "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/100.png",
    ]

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