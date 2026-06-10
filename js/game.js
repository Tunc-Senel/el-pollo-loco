/**
 * The game canvas element the world renders into.
 */
let canvas = document.getElementById("canvas");

/**
 * Shared keyboard state, read by the character each frame.
 */
let keyboard = new Keyboard();

/**
 * Global game state (e.g. whether the game has started).
 */
let gameState = new GameState();

/**
 * The active World instance; recreated on each (re)start.
 */
let world;

/**
 * Single audio controller shared across the game.
 */
let audioManager = new AudioManager();

/**
 * Entry point (called on window load): wires up all UI controls.
 */
function init() {
    initGameButtons();
    initSoundControls();
    initSettingsControls();
    bindTouchControls();
}

/**
 * Wires the start, restart, pause and fullscreen buttons.
 */
function initGameButtons() {
    document.querySelector(".start-button").addEventListener("click", () => {
        showLoadingAndStartGame(false);
        document.getElementById("gameControls").classList.remove("d-none");
    });
    document.getElementById("restartButton").addEventListener("click", () => {
        showLoadingAndStartGame(true);
        document.getElementById("gameControls").classList.remove("d-none");
    });
    document.getElementById("pauseButton").addEventListener("click", handlePauseButton);
    document.getElementById("fullscreenButton").addEventListener("click", () => {
        toggleFullscreen(document.getElementById("game-container"));
    });
}

/**
 * Pause button: starts the game if not running, otherwise toggles pause and swaps the icon.
 */
function handlePauseButton() {
    if (!gameState.isGameStarted) {
        showLoadingAndStartGame(false);
    } else {
        togglePause();
        document.getElementById("pause-btn").classList.toggle("d-none");
        document.getElementById("play-btn").classList.toggle("d-none");
    }
}

/**
 * Wires the sound on/off button and the SFX/music toggle groups.
 */
function initSoundControls() {
    document.getElementById("soundButton").addEventListener("click", applySoundButtonToggle);
    bindMuteToggles(".sfx-toggle-option", "sound effects", "toggleSfxButton");
    bindMuteToggles(".music-toggle-option", "music", "toggleMusicButton");
    syncSoundToggleButtons();
    syncSoundIcon();
}

/**
 * Binds a group of mute toggle buttons; on click applies the mute state for the given group.
 * @param {string} selector CSS selector for the toggle buttons in the group.
 * @param {string} group The mute group to control ("sound effects" or "music").
 * @param {string} datasetKey The data attribute holding the button's on/off value.
 */
function bindMuteToggles(selector, group, datasetKey) {
    document.querySelectorAll(selector).forEach((button) => {
        button.addEventListener("click", () => {
            applyMuteToggle(group, button.dataset[datasetKey] === "off");
        });
    });
}

/**
 * Applies a mute state for one group and syncs the toggle buttons and the sound icon.
 * @param {string} group The mute group to set ("sound effects" or "music").
 * @param {boolean} shouldMute Whether that group should be muted.
 */
function applyMuteToggle(group, shouldMute) {
    audioManager.setMuteState(group, shouldMute);
    syncSoundToggleButtons();
    syncSoundIcon();
}

/**
 * Wires opening/closing the settings overlay, outside-click closing and the tab switching.
 */
function initSettingsControls() {
    document.getElementById("settingsButton").addEventListener("click", () => {
        document.getElementById("settingsOverlay").classList.remove("d-none");
    });
    document.getElementById("closeSettingsButton").addEventListener("click", () => {
        document.getElementById("settingsOverlay").classList.add("d-none");
    });
    document.addEventListener("click", handleOutsideSettingsClick);
    document.querySelectorAll(".settings-tab").forEach((tabButtonClicked) => {
        tabButtonClicked.addEventListener("click", () => selectSettingsTab(tabButtonClicked));
    });
}

/**
 * Closes the settings overlay when a click lands outside it (and outside the settings button).
 * @param {MouseEvent} event The click event on the document.
 */
function handleOutsideSettingsClick(event) {
    const overlay = document.getElementById("settingsOverlay");
    if (overlay.classList.contains("d-none")) {
        return;
    }
    if (event.target === overlay) {
        overlay.classList.add("d-none");
        return;
    }
    if (!overlay.contains(event.target) && !document.getElementById("settingsButton").contains(event.target)) {
        overlay.classList.add("d-none");
    }
}

/**
 * Activates the clicked settings tab and shows its matching panel.
 * @param {HTMLElement} tabButtonClicked The tab button that was clicked.
 */
function selectSettingsTab(tabButtonClicked) {
    document.querySelectorAll(".settings-tab").forEach((tabButton) => {
        tabButton.classList.remove("active");
    });
    document.querySelectorAll(".settings-panel").forEach((panel) => {
        panel.classList.remove("active");
    });
    tabButtonClicked.classList.add("active");
    const selectedTab = tabButtonClicked.dataset.settingsTab;
    document.querySelector(`[data-settings-panel="${selectedTab}"]`).classList.add("active");
}

/**
 * Hides start/end screens, shows the loading screen, starts the game and runs the loading bar.
 * @param {boolean} [isRestart=false] Whether this start is a restart (repositions the character).
 */
function showLoadingAndStartGame(isRestart = false) {
    const loadingScreen = document.getElementById("loadingScreen");
    const loadingText = document.getElementById("loadingText");

    document.getElementById("startScreen").style.display = "none";
    document.getElementById("endScreenOverlay").classList.add("d-none");

    loadingScreen.classList.remove("d-none");
    loadingText.innerText = "Loading... 0%";

    startGame(isRestart);
    runLoadingBar(loadingScreen, loadingText);
}

/**
 * Animates the loading percentage to 100%, then hides the loading screen.
 * @param {HTMLElement} loadingScreen The loading screen overlay element.
 * @param {HTMLElement} loadingText The element showing the loading percentage.
 */
function runLoadingBar(loadingScreen, loadingText) {
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += 4;
        loadingText.innerText = `Loading... ${progress}%`;
        if (progress >= 100) {
            clearInterval(loadingInterval);
            setTimeout(() => {
                loadingScreen.classList.add("d-none");
            }, 200);
        }
    }, 20);
}

/**
 * (Re)creates the world: stops any current world, resets audio and, on restart, repositions the character.
 * @param {boolean} [isRestart = false] Whether the game is being restarted.
 */
function startGame(isRestart = false) {
    stopCurrentWorld();
    audioManager.stopAllSounds();
    world = new World(canvas, keyboard, gameState, audioManager);
    if (isRestart) {
        setTimeout(() => {
            world.character.y = 220;
            world.character.speedY = 0;
        }, 710);
    }
    gameState.isGameStarted = true;
    isPaused = false;
}

/**
 * Stops the current world and its loops before a new one is created.
 */
function stopCurrentWorld() {
    if (world) {
        world.stopped = true;
        world.stopIntervalls();
    }
}

/**
 * Binds the on-screen touch buttons to the movement/throw keys.
 */
function bindTouchControls() {
    bindTouchButton("touchLeft", "LEFT");
    bindTouchButton("touchRight", "RIGHT");
    bindTouchButton("touchJump", "UP");
    bindTouchButton("touchThrow", "F");
}

/**
 * Maps one touch button to a keyboard flag, setting it on touchstart and clearing it on touchend.
 * @param {string} buttonId The id of the touch button element.
 * @param {string} key The Keyboard flag to set ("LEFT", "RIGHT", "UP", "F").
 */
function bindTouchButton(buttonId, key) {
    const button = document.getElementById(buttonId);

    button.addEventListener("touchstart", (event) => {
        event.preventDefault();
        keyboard[key] = true;
    });

    button.addEventListener("touchend", (event) => {
        event.preventDefault();
        keyboard[key] = false;
    });
}

/**
 * Toggles the sound button: flips mute, swaps the on/off icon and syncs the toggle buttons.
 */
function applySoundButtonToggle() {
    audioManager.toggleMute();
    document.getElementById("sound-on-btn").classList.toggle("d-none");
    document.getElementById("sound-off-btn").classList.toggle("d-none");
    syncSoundToggleButtons();
}

/**
 * Toggles the paused state: stops/starts the world loops and mutes on pause. On resume it
 * unmutes again, unless the user re-enabled a sound while paused (then their choice is kept).
 */
function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        world.stopIntervalls();
        if (audioManager.soundEffectsIsMuted && audioManager.musicIsMuted) {
            return;
        } else {
            applySoundButtonToggle();
        }
    } else {
        world.startIntervalls();
        if (audioManager.soundEffectsIsMuted && audioManager.musicIsMuted) {
            applySoundButtonToggle();
        }
    }
}

/**
 * Highlights the SFX and music toggle buttons to match the current mute state.
 */
function syncSoundToggleButtons() {
    updateToggleGroup(".sfx-toggle-option", audioManager.soundEffectsIsMuted);
    updateToggleGroup(".music-toggle-option", audioManager.musicIsMuted);
}

/**
 * Marks the on/off button in a toggle group as active based on whether that group is muted.
 * @param {string} selector CSS selector for the toggle buttons in the group.
 * @param {boolean} isMuted Whether that group is currently muted.
 */
function updateToggleGroup(selector, isMuted) {
    const activeState = isMuted ? "off" : "on";

    document.querySelectorAll(selector).forEach((button) => {
        const isActive = button.dataset.toggleSfxButton === activeState
            || button.dataset.toggleMusicButton === activeState;

        button.classList.toggle("active", isActive);
    });
}

/**
 * Shows the muted icon only when both groups are muted, otherwise the unmuted icon.
 */
function syncSoundIcon() {
    const allMuted = audioManager.soundEffectsIsMuted && audioManager.musicIsMuted;
    document.getElementById("sound-on-btn").classList.toggle("d-none", allMuted);
    document.getElementById("sound-off-btn").classList.toggle("d-none", !allMuted);
}

/**
 * Enters fullscreen for the given element, or exits if already in fullscreen.
 * @param {HTMLElement} elem The element to display in fullscreen.
 */
function toggleFullscreen(elem) {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        openFullscreen(elem);
    } else {
        closeFullscreen();
    }
}

/**
 * Requests fullscreen using the available vendor-prefixed API.
 * @param {HTMLElement} elem The element to request fullscreen for.
 */
function openFullscreen(elem) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
}

/**
 * Exits fullscreen using the available vendor-prefixed API.
 */
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

/**
 * Sets the matching keyboard flags to true while a control key is held down.
 */
document.addEventListener("keydown", (event) => {
    if (!keyboard) return;

    if (event.key == "ArrowUp") {
        keyboard.UP = true;
    } 
    if (event.key == "ArrowRight") {
         keyboard.RIGHT = true;
    } 
    if (event.key == "ArrowLeft") {
         keyboard.LEFT = true;
    } 
    if (event.key == " "){
        keyboard.SPACE = true;
    }
    if (event.key == "f"){
        keyboard.F = true;
    }
})

/**
 * Clears the matching keyboard flags when a control key is released.
 */
document.addEventListener("keyup", (event) => {
    if (!keyboard) return;
    
    if (event.key == "ArrowUp") {
        keyboard.UP = false;
    }
    if (event.key == "ArrowRight") {
        keyboard.RIGHT = false;
    }
    if (event.key == "ArrowLeft") {
        keyboard.LEFT = false;
    }
    if (event.key == " ") {
        keyboard.SPACE = false;
    }
    if (event.key == "f"){
        keyboard.F = false;
    }
})

/**
 * Runs init once the page has fully loaded.
 */
window.onload = init;