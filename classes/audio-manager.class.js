class AudioManager {

    AUDIOS = {
        collectCoinSound: new Audio("assets/audio/collect-coin.mp3"),
        jumpSound:  new Audio("assets/audio/jump-sound.mp3"),
        stompSound: new Audio("assets/audio/stomp-enemy.mp3"),
        characterHurtSound: new Audio("assets/audio/character-hurt.mp3"),
        chickenDeadSound: new Audio("assets/audio/chicken-dead.mp3"),
        smallChickenDeadSound: new Audio("assets/audio/small-chicken-dead.mp3"),
        collectBottleSound: new Audio("assets/audio/collect-bottle.mp3"),
        throwBottleSound: new Audio("assets/audio/bottle-whoosh.mp3"),
        smashBottleSound: new Audio("assets/audio/bottle-smash.mp3"),
        snoringSound: new Audio("assets/audio/snoring.mp3"),
        characterWalkingSound: new Audio("assets/audio/character-walking.mp3"),
        chickenBackgroundSound: new Audio("assets/audio/chicken-background-noises.mp3"),
        backgroundMusicSound: new Audio("assets/audio/mexican-background-music.mp3")
    }

    playLoopSound(sound) {
        const audio = this.AUDIOS[sound];

        if (audio.paused) {
            audio.loop = true;
            audio.play().catch(() => {});
        }
    }

    playSound(sound) {
        const audio = this.AUDIOS[sound];

        audio.currentTime = 0;
        audio.play().catch(() => {});
    }

    stopSound(sound) {
        const audio = this.AUDIOS[sound];

        audio.pause();
        audio.currentTime = 0;
    }
}