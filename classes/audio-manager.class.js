class AudioManager {

    AUDIOS = {
        collectCoinSound: new Audio("assets/audio/collect-coin.mp3"),
        jumpSound:  new Audio("assets/audio/jump-sound.mp3"),
        stompSound: new Audio("assets/audio/stomp-enemy.mp3")
    }
    

    playSound(sound) {
        this.AUDIOS[sound].currentTime = 0;
        this.AUDIOS[sound].play();
    }
}