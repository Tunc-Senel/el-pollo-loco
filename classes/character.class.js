class Character extends MovableObject {
    x = 200;
    y = 200;
    img;
    width = 150;
    height = 250;

    constructor() {
        super().loadImage("assets/img/2_character_pepe/1_idle/idle/I-1.png");
    }

}