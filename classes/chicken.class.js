class Chicken extends MovableObject {
    x = 500;
    y = 250;
    img;
    width = 100;
    height = 150;

    constructor() {
        super().loadImage("assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png");
    }

}