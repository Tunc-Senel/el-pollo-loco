class Coin extends DrawableObject {
    width = 100;
    height = 100;  
    IMAGE = "assets/img/8_coin/coin_1.png"

    constructor(x, y) {
        super().loadImage(this.IMAGE);
        this.collectableObjectPlacement(x, y); 
    }

}