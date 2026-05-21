const level1 = new Level(
    [
        new Chicken(),
        new Chicken(),
        new Chicken(),
        new Chicken(),
        new Chicken()
    ],
    [
    new BackgroundObject("assets/img/5_background/layers/air.png", -720, 80),
    new BackgroundObject("assets/img/5_background/layers/3_third_layer/2.png", -720, 80),
    new BackgroundObject("assets/img/5_background/layers/2_second_layer/2.png", -720, 80),
    new BackgroundObject("assets/img/5_background/layers/1_first_layer/2.png", -720, 80),

    new BackgroundObject("assets/img/5_background/layers/air.png", 0, 80),
    new BackgroundObject("assets/img/5_background/layers/3_third_layer/1.png", 0, 80),
    new BackgroundObject("assets/img/5_background/layers/2_second_layer/1.png", 0, 80),
    new BackgroundObject("assets/img/5_background/layers/1_first_layer/1.png", 0, 80),

    new BackgroundObject("assets/img/5_background/layers/air.png", 720, 80),
    new BackgroundObject("assets/img/5_background/layers/3_third_layer/2.png", 720, 80),
    new BackgroundObject("assets/img/5_background/layers/2_second_layer/2.png", 720, 80),
    new BackgroundObject("assets/img/5_background/layers/1_first_layer/2.png", 720, 80),

    new BackgroundObject("assets/img/5_background/layers/air.png", 720*2, 80),
    new BackgroundObject("assets/img/5_background/layers/3_third_layer/1.png", 720*2, 80),
    new BackgroundObject("assets/img/5_background/layers/2_second_layer/1.png", 720*2, 80),
    new BackgroundObject("assets/img/5_background/layers/1_first_layer/1.png", 720*2, 80),

    new BackgroundObject("assets/img/5_background/layers/air.png", 720*3, 80),
    new BackgroundObject("assets/img/5_background/layers/3_third_layer/2.png", 720*3, 80),
    new BackgroundObject("assets/img/5_background/layers/2_second_layer/2.png", 720*3, 80),
    new BackgroundObject("assets/img/5_background/layers/1_first_layer/2.png", 720*3, 80),

    new BackgroundObject("assets/img/5_background/layers/air.png", 720*4, 80),
    new BackgroundObject("assets/img/5_background/layers/3_third_layer/1.png", 720*4, 80),
    new BackgroundObject("assets/img/5_background/layers/2_second_layer/1.png", 720*4, 80),
    new BackgroundObject("assets/img/5_background/layers/1_first_layer/1.png", 720*4, 80),

    new BackgroundObject("assets/img/5_background/layers/air.png", 720*5, 80),
    new BackgroundObject("assets/img/5_background/layers/3_third_layer/2.png", 720*5, 80),
    new BackgroundObject("assets/img/5_background/layers/2_second_layer/2.png", 720*5, 80),
    new BackgroundObject("assets/img/5_background/layers/1_first_layer/2.png", 720*5, 80),

    new BackgroundObject("assets/img/5_background/layers/air.png", 720*6, 80),
    new BackgroundObject("assets/img/5_background/layers/3_third_layer/1.png", 720*6, 80),
    new BackgroundObject("assets/img/5_background/layers/2_second_layer/1.png", 720*6, 80),
    new BackgroundObject("assets/img/5_background/layers/1_first_layer/1.png", 720*6, 80),

    ],
    [
        new Cloud()
    ],
    [
        new Coin(300, 100),
        new Coin(350, 150),
        new Coin(500, 50),
    ],
    [
        new Bottle(50, 50),
        new Bottle(325, 335),
        new Bottle(550, 375)
    ]  
);