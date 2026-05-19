class Coin extends DrawableObject {

    IMAGE = "assets/img/8_coin/coin_1.png"

    constructor(x, y) {
        super().loadImage(this.IMAGE);
        this.collectableObjectPlacement(x, y); 
    }

}