class EndbossHealthBar extends StatusBar {
    percentage = 100;
    otherDirection = true;
    endbossAppeared = false;
    IMAGES = [
            "assets/img/7_statusbars/2_statusbar_endboss/orange/orange0.png",
            "assets/img/7_statusbars/2_statusbar_endboss/orange/orange20.png",
            "assets/img/7_statusbars/2_statusbar_endboss/orange/orange40.png",
            "assets/img/7_statusbars/2_statusbar_endboss/orange/orange60.png",
            "assets/img/7_statusbars/2_statusbar_endboss/orange/orange80.png",
            "assets/img/7_statusbars/2_statusbar_endboss/orange/orange100.png",
            ]

    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.x = 460;
        this.y = 3;
        this.width = 200;
        this.height = 50;
        this.setPercentage(this.percentage);
    }

}