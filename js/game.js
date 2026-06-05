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
    });

    document.getElementById("soundButton").addEventListener("click", () => {
        audioManager.toggleMute();

        document.getElementById("sound-on-btn").classList.toggle("d-none");
        document.getElementById("sound-off-btn").classList.toggle("d-none");
    })

    document.getElementById("settingsButton").addEventListener("click", () => {
        document.getElementById("settingsOverlay").classList.remove("d-none")
    })

    document.getElementById("closeSettingsButton").addEventListener("click", () => {
        document.getElementById("settingsOverlay").classList.add("d-none")
    })

    document.querySelectorAll(".settings-tab").forEach((tabButtonClicked) => {
        tabButtonClicked.addEventListener("click", () => {
            document.querySelectorAll(".settings-tab").forEach((tabButton) => {
                tabButton.classList.remove("active");
            })
            tabButtonClicked.classList.add("active");
        })
    })

    document.getElementById("pauseButton").addEventListener("click", () => {
        if (!gameState.isGameStarted) {
            showLoadingAndStartGame(false);
        } else if (gameState.isGameStarted) {
            togglePause();
            document.getElementById("pause-btn").classList.toggle("d-none");
            document.getElementById("play-btn").classList.toggle("d-none");
        }
    });

    
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

function restartGame() {
    startGame();
}

function togglePause() {
    isPaused = !isPaused;

    if (isPaused) {
        world.stopIntervalls();
    } else {
        world.startIntervalls();
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
