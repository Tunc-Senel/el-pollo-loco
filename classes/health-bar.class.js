class HealthBar extends StatusBar {
    percentage = 100;
    IMAGES = [
            "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/0.png",
            "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/20.png",
            "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/40.png",
            "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png",
            "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/80.png",
            "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/100.png"
            ]

    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.x = 60;
        this.y = 0;
        this.width = 200;
        this.height = 50;
        this.setPercentage(this.percentage);
    }

}