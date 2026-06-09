/**
 * Central audio controller. Holds every game sound as a preloaded Audio object and
 * provides play/stop helpers plus mute handling. Sound effects and music can be muted
 * independently; backgroundMusicSound is the only entry treated as "music", everything
 * else counts as a sound effect.
 */
class AudioManager {
    /**
     * True only when both sound effects and music are muted (drives the sound on/off icon).
     */
    isMuted = false;
    soundEffectsIsMuted = false;
    musicIsMuted = false;

    /**
     * All game sounds, keyed by name; preloaded once so playback has no startup delay.
     */
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
        backgroundMusicSound: new Audio("assets/audio/mexican-background-music.mp3"),
        lostGameSound: new Audio("assets/audio/lost-game.mp3"),
        wonGameSound: new Audio("assets/audio/won-game.mp3"),
        characterDieSound: new Audio("assets/audio/character-die.mp3"),
        earthquakeSound: new Audio("assets/audio/earthquake-sound.mp3"),
        endbossAlertSound: new Audio("assets/audio/endboss-alert-sound.mp3"),
        endbossHurtSound: new Audio("assets/audio/endboss-hurt-sound.mp3"),
        endbossDieSound: new Audio("assets/audio/endboss-die-sound.mp3")
    }

    /**
     * Starts a looping sound (e.g. music, walking) only if it is not already playing.
     * @param {string} sound The key of the sound in AUDIOS.
     */
    playLoopSound(sound) {
        const audio = this.AUDIOS[sound];

        if (audio.paused) {
            audio.loop = true;
            audio.play().catch(() => {});
        }
    }

    /**
     * Plays a one-shot sound from the start, restarting it if it was already playing.
     * @param {string} sound The key of the sound in AUDIOS.
     */
    playSound(sound) {
        const audio = this.AUDIOS[sound];

        audio.currentTime = 0;
        audio.play().catch(() => {});
    }

    /**
     * Stops a sound and rewinds it to the start.
     * @param {string} sound The key of the sound in AUDIOS.
     */
    stopSound(sound) {
        const audio = this.AUDIOS[sound];

        audio.pause();
        audio.currentTime = 0;
    }

    /**
     * Stops every sound; used when the game restarts or ends.
     */
    stopAllSounds() {
        Object.keys(this.AUDIOS).forEach((sound) => {
            this.stopSound(sound);
        });
    }

    /**
     * Sets the mute state for one group ("sound effects" or "music") to an explicit value,
     * recomputes the combined isMuted flag and applies it. Used by the settings toggles.
     * @param {string} sounds The group to set ("sound effects" or "music").
     * @param {boolean} shouldMute Whether that group should be muted.
     */
    setMuteState(sounds, shouldMute) {
        if (sounds == "sound effects") {
            this.soundEffectsIsMuted = shouldMute;
        } else if (sounds == "music") {
            this.musicIsMuted = shouldMute;
        }
        this.isMuted = this.soundEffectsIsMuted && this.musicIsMuted;
        this.applyMuteState();
    }

    /**
     * Applies the current mute flags to every Audio: music uses musicIsMuted, the rest soundEffectsIsMuted.
     */
    applyMuteState() {
        for (const [key, value] of Object.entries(this.AUDIOS)) {
            if (key === "backgroundMusicSound") {
                value.muted = this.musicIsMuted;
            } else {
                value.muted = this.soundEffectsIsMuted;
            }
        }
    }

    /**
     * Toggles mute for the whole game at once (the sound button). Flips the combined
     * state, mirrors it onto both groups and pushes it to all sounds via applyMuteState.
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.soundEffectsIsMuted = this.isMuted;
        this.musicIsMuted = this.isMuted;
        this.applyMuteState();
    }
}