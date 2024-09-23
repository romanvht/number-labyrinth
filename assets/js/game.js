class Game {
    constructor() {
        this.levelsData = new Levels();
        this.storage = new Storage();

        this.colors = {
            block: '#e0e0e0',
            blockDisable: '#FFB5B5',
            blockVisited: '#1976d2', 
            number: '#666666',
            numberVisited: '#ffffff',
            dot: '#82888C',
            dotVisited: '#115293'
        }

        this.canvas = document.getElementById('gameCanvas');
        this.context = this.canvas.getContext('2d');
        this.initGameState();

        this.sound = new Sound(this);
        this.input = new Input(this, this.sound);
        this.menu = new Menu(this, this.storage, this.sound);
    }

    initGameState () {
        this.gameStart = false;
        this.levels = this.levelsData.getLevels();
        this.currentLevel = 1;
        this.grid = [];
        this.path = [];
        this.cellSize = 50;
        this.startTime = 0;
        this.timeLevel = 0;
        this.isLevelComplete = false;
        this.isPaused = false;
        this.gridSize = 0;
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.matchMedia("(orientation: landscape)").matches ? window.innerHeight * 0.7 : window.innerHeight;
    
        this.context.scale(dpr, dpr);

        if (this.gridSize) {
            this.cellSize = Math.floor(Math.min(
                (this.canvas.width - 40) / this.gridSize,
                (this.canvas.height) / this.gridSize
            ));

            this.draw();
        }
    }    

    startLevel(levelNumber) {
        this.input.resetDrawingState();
        
        this.currentLevel = levelNumber;
        this.isLevelComplete = false;
        this.startTime = Date.now();
        this.path = [];
        this.createGrid();
        this.isPaused = false;

        const levelData = this.levels[this.currentLevel - 1];
        this.gridSize = levelData.size;
        this.resizeCanvas();

        this.menu.setLevelNumber(levelNumber);
        this.draw();
    }

    createGrid() {
        const levelData = this.levels[this.currentLevel - 1];
        const size = levelData.size;

        this.grid = Array.from({ length: size }, (_, y) =>
            Array.from({ length: size }, (_, x) => ({
                x,
                y,
                visited: false,
                number: null,
                block: false
            }))
        );

        levelData.numbers.forEach(num => {
            this.grid[num.y][num.x].number = num.value;
        });

        levelData.blocks.forEach(block => {
            this.grid[block.y][block.x].block = true;
        });
    }

    drawRoundedRect(x, y, width, height, radius) {
        this.context.beginPath();
        this.context.moveTo(x + radius, y);
        this.context.lineTo(x + width - radius, y);
        this.context.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.context.lineTo(x + width, y + height - radius);
        this.context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.context.lineTo(x + radius, y + height);
        this.context.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.context.lineTo(x, y + radius);
        this.context.quadraticCurveTo(x, y, x + radius, y);
        this.context.closePath();
    }

    draw() {
        if (this.isPaused) return;

        const levelData = this.levels[this.currentLevel - 1];
        const gridSize = levelData.size;
        const gridWidth = gridSize * this.cellSize;
        const gridHeight = gridSize * this.cellSize;
        const offsetX = (this.canvas.width - gridWidth) / 2;
        const offsetY = (this.canvas.height - gridHeight) / 2;

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawPath(offsetX, offsetY);

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const cell = this.grid[y][x];
                const posX = offsetX + x * this.cellSize;
                const posY = offsetY + y * this.cellSize;

                this.drawCell(cell, posX, posY);
            }
        }

        if (!this.isLevelComplete) {
            requestAnimationFrame(() => this.draw());
        }
    }

    drawPath(offsetX, offsetY) {
        if (this.path.length > 1) {
            this.context.strokeStyle = this.colors.blockVisited;
            this.context.lineWidth = this.cellSize / 4;
            this.context.lineJoin = 'round';
            this.context.lineCap = 'round';
            this.context.beginPath();

            const getPosition = (cell) => ({
                x: offsetX + cell.x * this.cellSize + this.cellSize / 2,
                y: offsetY + cell.y * this.cellSize + this.cellSize / 2,
            });

            const startPos = getPosition(this.path[0]);
            this.context.moveTo(startPos.x, startPos.y);

            for (let i = 1; i < this.path.length; i++) {
                const pos = getPosition(this.path[i]);
                this.context.lineTo(pos.x, pos.y);
            }

            this.context.stroke();
        }
    }

    drawCell(cell, posX, posY) {
        const cellSpacing = this.cellSize * 0.2;
        const adjustedSize = this.cellSize - cellSpacing;
        const adjustedX = posX + cellSpacing / 2;
        const adjustedY = posY + cellSpacing / 2;
    
        if (cell.block) {
            this.context.fillStyle = this.colors.blockDisable;
            this.drawRoundedRect(
                adjustedX,
                adjustedY,
                adjustedSize,
                adjustedSize,
                adjustedSize * 0.2
            );
            this.context.fill();
        } else if (cell.number !== null) {
            this.context.fillStyle = cell.visited || cell.number == 1 ? this.colors.blockVisited : this.colors.block;
            this.drawRoundedRect(
                adjustedX,
                adjustedY,
                adjustedSize,
                adjustedSize,
                adjustedSize * 0.2
            );
            this.context.fill();
    
            this.context.fillStyle = cell.visited || cell.number == 1 ? this.colors.numberVisited : this.colors.number;
            this.context.font = `${adjustedSize / 2}px Arial`;
            this.context.textAlign = 'center';
            this.context.textBaseline = 'middle';
            this.context.fillText(
                cell.number,
                adjustedX + adjustedSize / 2,
                adjustedY + adjustedSize / 2
            );
        } else {
            this.context.fillStyle = cell.visited ? this.colors.dotVisited : this.colors.dot;
            this.context.beginPath();
            this.context.arc(
                adjustedX + adjustedSize / 2,
                adjustedY + adjustedSize / 2,
                adjustedSize / 4,
                0,
                Math.PI * 2
            );
            this.context.fill();
        }
    }    

    cellAtPosition(x, y) {
        const levelData = this.levels[this.currentLevel - 1];
        const gridSize = levelData.size;
        const gridWidth = gridSize * this.cellSize;
        const gridHeight = gridSize * this.cellSize;
        const offsetX = (this.canvas.width - gridWidth) / 2;
        const offsetY = (this.canvas.height - gridHeight) / 2;

        const gridX = Math.floor((x - offsetX) / this.cellSize);
        const gridY = Math.floor((y - offsetY) / this.cellSize);

        if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
            return this.grid[gridY][gridX];
        }
        return null;
    }

    handleInput(x, y) {
        if (this.isPaused || this.isLevelComplete) return;

        const cell = this.cellAtPosition(x, y);
        if (cell && !cell.block) {
            if (cell.number === 1 && (this.path.length === 0 || this.path[0] === cell)) {
                this.resetPath();
                this.addToPath(cell);
            } else if (this.path.length > 0) {
                const lastCell = this.path[this.path.length - 1];

                if (cell === lastCell) {
                    return;
                }

                if (this.isAdjacent(cell, lastCell)) {
                    if (this.path.length > 1 && cell === this.path[this.path.length - 2]) {
                        this.backToPath();
                        this.sound.playSound('tick');
                    } else if (!cell.visited) {
                        this.addToPath(cell);
                        this.sound.playSound('tick');
                    }
                }
            }

            if (this.checkCompletion()) {
                this.levelComplete();
            }
        }
    }

    resetPath() {
        this.path.forEach(cell => {
            cell.visited = false;
        });
        this.path = [];
    }

    backToPath() {
        const removedCell = this.path.pop();
        removedCell.visited = false;
    }

    addToPath(cell) {
        cell.visited = true;
        this.path.push(cell);
    }

    isAdjacent(cell1, cell2) {
        const dx = Math.abs(cell1.x - cell2.x);
        const dy = Math.abs(cell1.y - cell2.y);
        return dx + dy === 1;
    }

    checkCompletion() {
        const levelData = this.levels[this.currentLevel - 1];
        const totalCells = levelData.size * levelData.size - levelData.blocks.length;
        const allVisited = this.path.length === totalCells;

        let numbersInOrder = true;
        let expectedNumber = 1;

        for (const cell of this.path) {
            if (cell.number !== null) {
                if (cell.number !== expectedNumber) {
                    numbersInOrder = false;
                    break;
                }
                expectedNumber++;
            }
        }

        return allVisited && numbersInOrder;
    }

    levelComplete() {
        this.isLevelComplete = true;

        setTimeout(() => {
            this.sound.playSound('complete');
            this.timeLevel = Math.floor((Date.now() - this.startTime) / 1000);
            this.storage.saveProgress(this.currentLevel);
            this.menu.setLevelTime(this.timeLevel);
            this.menu.showLevelComplete();
        }, 500);
    }
}
