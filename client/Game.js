class Game {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.levelNumber = 1;
        this.levelAmount = 0;
        this.tileSize = 50;
        this.stepsAmount = 0;
        this.gameOver = false;
        this.highscore = "?";
        this.serverAddress = 'http://localhost:5000/';

        this.levelJSON = null;
        this.theseus = null;
        this.minotaur = null;
        this.maxTile = null;
        this.exitTile = null;
        this.tileArray = null;
    }


    async loadLevel(number) {
        const response = await this.fetchLevel(number);
        if (response === null) {
            this.levelJSON = null;
            return;
        }
        this.levelJSON = response.game;

        if (response.highscore !== -1) {
            this.highscore = response.highscore;
        } else {
            this.highscore = "?";
        }

        this.maxTile = this.levelJSON.tiles.reduce((max, tile) => {
            return {
                x: Math.max(max.x, tile.x),
                y: Math.max(max.y, tile.y)
            };
        }, { x: 0, y: 0 });

        const emptyTile = {"bottom":false,"left":false,"right":false,"top":false};
        // We maken een 2D array voorstelling van het level
        this.tileArray = Array(this.maxTile.y + 1).fill().map(() => new Array(this.maxTile.x + 1).fill(emptyTile));
        this.levelJSON.tiles.forEach(tile => {
            this.tileArray[tile.y][tile.x] = tile;
            if (tile.x === this.levelJSON.exit.x && tile.y === this.levelJSON.exit.y) {
                this.exitTile = tile;
            }
        });
        await this.resetPositions();
        document.getElementById("highscore").innerHTML = this.highscore.toString();
        document.getElementById("score").innerHTML = this.stepsAmount.toString();
        document.getElementById("level").innerHTML = this.levelNumber.toString();
    }
    async init() {
        await new InputManager(this);
        await this.loadLevel(1);
    }

    async resetPositions() {
        if (this.levelJSON === null) {
            await this.loadLevel(this.levelNumber);
            return;
        }
        this.theseus = new GameObject({
            x: this.levelJSON.theseus.x,
            y: this.levelJSON.theseus.y
        });
        this.minotaur = new GameObject({
            x: this.levelJSON.minotaur.x,
            y: this.levelJSON.minotaur.y
        });
        this.gameOver = false;
        this.stepsAmount = 0;
        this.redraw();
    }

    async fetchLevel(num) {
        try {
            const response = await fetch(this.serverAddress + 'level/' + num);
            const levels = await fetch(this.serverAddress + 'levels');
            const levelsJSON = await levels.json();
            this.levelAmount = levelsJSON["aantal_levels"];
            return await response.json();
        } catch (error) {
            this.drawMessage("Something went wrong while loading the next level.", "red");
            return null;
        }
    }

    async nextLevel() {
        if (this.levelNumber === this.levelAmount) {
            return;
        }
        this.levelNumber += 1;
        await this.loadLevel(this.levelNumber);
        this.redraw();
    }

    async previousLevel() {
        if (this.levelNumber === 1) {
            return;
        }
        this.levelNumber -= 1;
        await this.loadLevel(this.levelNumber);
        this.redraw();
    }

    // Het level wordt in het midden van het canvas getekend
    redraw() {
        const canvas = this.canvas;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const level = this.levelJSON;

        const tileSize = this.tileSize;
        const wallThickness = 3;

        const levelWidth = level.tiles.reduce((max, tile) => Math.max(max, tile.x + 1), 0) * tileSize;
        const levelHeight = level.tiles.reduce((max, tile) => Math.max(max, tile.y + 1), 0) * tileSize;

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const offsetX = (canvasWidth - levelWidth) / 2;
        const offsetY = (canvasHeight - levelHeight) / 2;

        for (let i = 0; i < this.tileArray.length; i++) {
            for (let j = 0; j < this.tileArray[i].length; j++) {
                let tile = this.tileArray[i][j];

                const x = tile.x * tileSize + offsetX;
                const y = tile.y * tileSize + offsetY;

                if (tile.left) {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x, y + tileSize);
                    ctx.lineWidth = wallThickness;
                    ctx.stroke();
                }

                if (tile.right) {
                    ctx.beginPath();
                    ctx.moveTo(x + tileSize, y);
                    ctx.lineTo(x + tileSize, y + tileSize);
                    ctx.lineWidth = wallThickness;
                    ctx.stroke();
                }

                if (tile.top) {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + tileSize, y);
                    ctx.lineWidth = wallThickness;
                    ctx.stroke();
                }

                if (tile.bottom) {
                    ctx.beginPath();
                    ctx.moveTo(x, y + tileSize);
                    ctx.lineTo(x + tileSize, y + tileSize);
                    ctx.lineWidth = wallThickness;
                    ctx.stroke();
                }

                if (tile.x === level.exit.x && tile.y === level.exit.y) {
                    ctx.font = "bold 18px 'Courier New', monospace";
                    ctx.fillStyle = 'red';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('EXIT', x + tileSize / 2, y + tileSize / 2);
                }

                if (tile.x === this.theseus.x && tile.y === this.theseus.y) {
                    ctx.beginPath();
                    ctx.arc(x + tileSize / 2, y + tileSize / 2, tileSize / 4, 0, 2 * Math.PI);
                    ctx.fillStyle = 'blue';
                    ctx.fill();
                }

                if (tile.x === this.minotaur.x && tile.y === this.minotaur.y) {
                    ctx.beginPath();
                    ctx.arc(x + tileSize / 2, y + tileSize / 2, tileSize / 4, 0, 2 * Math.PI);
                    ctx.fillStyle = 'red';
                    ctx.fill();
                }
            }
        }
    }

    moveMinotaur() {
        let possibleMoves = [[1,0], [-1, 0], [0, -1], [0, 1]];
        const directions = {'1,0': 'right', '-1,0': 'left', '0,-1': 'up', '0,1': 'down'};

        for (let move = 0; move < 2; move++) {
            let distanceToTheseus = Math.sqrt((this.minotaur.x - this.theseus.x) ** 2 + (this.minotaur.y - this.theseus.y) ** 2);
            for (let i = 0; i < possibleMoves.length; i++) {
                const newMinotaurX = this.minotaur.x + possibleMoves[i][0];
                const newMinotaurY = this.minotaur.y + possibleMoves[i][1];

                const newDistanceToTheseus = Math.sqrt((newMinotaurX - this.theseus.x) ** 2 + (newMinotaurY - this.theseus.y) ** 2);

                if (newDistanceToTheseus < distanceToTheseus && this.isMoveValid(this.minotaur, directions[`${possibleMoves[i][0]},${possibleMoves[i][1]}`])) {
                    this.minotaur.move(possibleMoves[i][0], possibleMoves[i][1]);
                    break;
                }
            }
        }
    }

    isMoveValid(object, dir) {
        switch(dir) {
            case 'left':
                return (object.x > 0 && !this.tileArray[object.y][object.x - 1].right && !this.tileArray[object.y][object.x].left);
            case 'right':
                return (object.x < this.maxTile.x && !this.tileArray[object.y][object.x].right && !this.tileArray[object.y][object.x + 1].left);
            case 'up':
                return (object.y > 0 && !this.tileArray[object.y - 1][object.x].bottom && !this.tileArray[object.y][object.x].top);
            case 'down':
                return (object.y < this.maxTile.y && !this.tileArray[object.y][object.x].bottom && !this.tileArray[object.y + 1][object.x].top);
        }
    }

    async checkConditions() {
        if (this.theseus.x === this.exitTile.x && this.theseus.y === this.exitTile.y) {
            try {
                await fetch(this.serverAddress + `highscore/${this.levelNumber}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ highscore: this.stepsAmount })
            });
            } catch (error) {
                this.drawMessage("Something went wrong while loading the next level.", "red");
                return;
            }

            if (this.levelNumber === this.levelAmount) {
                this.drawMessage("Theseus escaped!", "black");
                this.gameOver = true;
                return;
            }

            await this.nextLevel();
        } else if (this.theseus.x === this.minotaur.x && this.theseus.y === this.minotaur.y) {
            this.gameOver = true;
            this.drawMessage("Theseus got caught!", "black");
        }
    }

    drawMessage(text, color) {
        this.ctx.fillStyle = color;
            this.ctx.font = "16px 'Courier New', monospace";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            const x = canvas.width / 2;
            const y = this.canvas.height - 30;

            this.ctx.fillText(text, x, y);
    }
}