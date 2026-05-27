class AudioManager {
    collectCoinSound = new Audio("assets/audio/collect-coin.mp3");

    playSound(sound) {
        sound.currentTime = 0;
        sound.play();
    }

    playCollectCoinSound() {
        this.playSound(this.collectCoinSound);
    }
}