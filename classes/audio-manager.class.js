class AudioManager {

    AUDIOS = {
        collectCoinSound: new Audio("assets/audio/collect-coin.mp3"),
        jumpSound:  new Audio("assets/audio/jump-sound.mp3"),
        stompSound: new Audio("assets/audio/stomp-enemy.mp3"),
        characterHurtSound: new Audio("assets/audio/character-hurt.mp3"),
        chickenDeadSound: new Audio("assets/audio/chicken-dead.mp3"),
        smallChickenDeadSound: new Audio("assets/audio/small-chicken-dead.mp3")

    }

    playSound(sound) {
        this.AUDIOS[sound].currentTime = 0;
        this.AUDIOS[sound].play();
    }
}