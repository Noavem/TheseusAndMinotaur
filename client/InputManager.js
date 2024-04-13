class InputManager {
    constructor(game) {
        document.addEventListener('keydown', async (event) => {

            if (event.code === 'KeyR') {
                await game.resetPositions();
            } else if (event.code === 'KeyP') {
                await game.previousLevel();
            } else if (event.code === 'KeyN') {
                await game.nextLevel();
            }

            if (game.gameOver) {
                return;
            }

            let moveSuccessful = false;

            if (event.code === 'ArrowLeft') {
                if (game.isMoveValid(game.theseus, 'left')) {
                    game.theseus.move(-1, 0);
                    moveSuccessful = true;
                }
            } else if (event.code === 'ArrowRight') {
                if (game.isMoveValid(game.theseus, 'right')) {
                    game.theseus.move(1, 0);
                    moveSuccessful = true;
                }
            } else if (event.code === 'ArrowUp') {
                if (game.isMoveValid(game.theseus, 'up')) {
                    game.theseus.move(0, -1);
                    moveSuccessful = true;
                }
            } else if (event.code === 'ArrowDown') {
                if (game.isMoveValid(game.theseus, 'down')) {
                    game.theseus.move(0, 1);
                    moveSuccessful = true;
                }
            } else if (event.code === "Space") {
                moveSuccessful = true;
            }
            if (moveSuccessful) {
                game.stepsAmount += 1;
                document.getElementById("score").innerHTML = "" + game.stepsAmount;
                game.moveMinotaur();
                game.redraw();
                await game.checkConditions();
            }
        });
    }
}

document.addEventListener('keydown', (ev) => {
    const key = ev.key;
    const element = document.querySelector(
        '[data-keyboard-key="' + key + '"]'
    );
    if (element) {
        element.classList.add('active');
    }
});

document.addEventListener('keyup', (ev) => {
    const key = ev.key;
    const element = document.querySelector(
        '[data-keyboard-key="' + key + '"]'
    );
    if (element) {
        element.classList.remove('active');
    }
});