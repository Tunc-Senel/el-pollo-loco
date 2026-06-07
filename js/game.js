let canvas = document.getElementById("canvas");
let keyboard = new Keyboard();
let gameState = new GameState();
let world;
let audioManager = new AudioManager();

function init() {
    document.querySelector(".start-button").addEventListener("click", () => {
        showLoadingAndStartGame(false);
    });

    document.getElementById("restartButton").addEventListener("click", () => {
        showLoadingAndStartGame(true);
        document.getElementById("gameControls").classList.remove("d-none");
    });

    document.getElementById("soundButton").addEventListener("click", () => {
        audioManager.toggleMute("both");

        document.getElementById("sound-on-btn").classList.toggle("d-none");
        document.getElementById("sound-off-btn").classList.toggle("d-none");

        syncSoundToggleButtons();
    })

    document.getElementById("settingsButton").addEventListener("click", () => {
        document.getElementById("settingsOverlay").classList.remove("d-none")
    })

    document.getElementById("closeSettingsButton").addEventListener("click", () => {
        document.getElementById("settingsOverlay").classList.add("d-none")
    })

    document.addEventListener("click", function (event) {
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
    });

    document.querySelectorAll(".settings-tab").forEach((tabButtonClicked) => {
        tabButtonClicked.addEventListener("click", () => {
            document.querySelectorAll(".settings-tab").forEach((tabButton) => {
                tabButton.classList.remove("active");
            })

            document.querySelectorAll(".settings-panel").forEach((panel) => {
                panel.classList.remove("active");
            });

            tabButtonClicked.classList.add("active");

            const selectedTab = tabButtonClicked.dataset.settingsTab;

            document
                .querySelector(`[data-settings-panel="${selectedTab}"]`)
                .classList.add("active");     
        });
    });

    document.querySelectorAll(".sfx-toggle-option").forEach((sfxButtonClicked) => {
        sfxButtonClicked.addEventListener("click", () => {
            const shouldMute = sfxButtonClicked.dataset.toggleSfxButton === "off";
            audioManager.setMuteState("sound effects", shouldMute);
            syncSoundToggleButtons();
            syncSoundIcon();
        });
    });

    document.querySelectorAll(".music-toggle-option").forEach((musicButtonClicked) => {
        musicButtonClicked.addEventListener("click", () => {
            const shouldMute = musicButtonClicked.dataset.toggleMusicButton === "off";
            audioManager.setMuteState("music", shouldMute);
            syncSoundToggleButtons();
            syncSoundIcon();
        });
    });

    document.getElementById("pauseButton").addEventListener("click", () => {
        if (!gameState.isGameStarted) {
            showLoadingAndStartGame(false);
        } else if (gameState.isGameStarted) {
            togglePause();
            document.getElementById("pause-btn").classList.toggle("d-none");
            document.getElementById("play-btn").classList.toggle("d-none");
        }
    });

    document.getElementById("fullscreenButton").addEventListener("click", () => {
        toggleFullscreen(document.getElementById("game-container"));
    });

    bindTouchControls();
}

function showLoadingAndStartGame(isRestart = false) {
    const loadingScreen = document.getElementById("loadingScreen");
    const loadingText = document.getElementById("loadingText");

    document.getElementById("startScreen").style.display = "none";
    document.getElementById("endScreenOverlay").classList.add("d-none");

    loadingScreen.classList.remove("d-none");
    loadingText.innerText = "Loading... 0%";

    startGame(isRestart);

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

function startGame(isRestart = false) {

    if (world) {
        world.stopped = true;
        world.stopIntervalls();
    }
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

function bindTouchControls() {
    bindTouchButton("touchLeft", "LEFT");
    bindTouchButton("touchRight", "RIGHT");
    bindTouchButton("touchJump", "UP");
    bindTouchButton("touchThrow", "F");
}

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

function togglePause() {
    isPaused = !isPaused;

    if (isPaused) {
        world.stopIntervalls();
    } else {
        world.startIntervalls();
    }
}

function syncSoundToggleButtons() {
    updateToggleGroup(".sfx-toggle-option", audioManager.soundEffectsIsMuted);
    updateToggleGroup(".music-toggle-option", audioManager.musicIsMuted);
}

function updateToggleGroup(selector, isMuted) {
    const activeState = isMuted ? "off" : "on";

    document.querySelectorAll(selector).forEach((button) => {
        const isActive = button.dataset.toggleSfxButton === activeState
            || button.dataset.toggleMusicButton === activeState;

        button.classList.toggle("active", isActive);
    });
}

function syncSoundIcon() {
    const allMuted = audioManager.soundEffectsIsMuted && audioManager.musicIsMuted;
    document.getElementById("sound-on-btn").classList.toggle("d-none", allMuted);
    document.getElementById("sound-off-btn").classList.toggle("d-none", !allMuted);
}

function toggleFullscreen(elem) {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        openFullscreen(elem);
    } else {
        closeFullscreen();
    }
}

/* View in fullscreen */
function openFullscreen(elem) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
}

/* Close fullscreen */
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

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

window.onload = init;
