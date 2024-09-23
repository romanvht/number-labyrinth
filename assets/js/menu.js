class Menu {
    constructor(game, storage, sound) {
        this.game = game;
        this.storage = storage;
        this.sound = sound;

        this.initMenu();
        this.initHandlers();
        this.initSound();
    }

    initMenu() {
        this.overlay = document.getElementById('overlay');
        this.levelName = document.getElementById('level-container');
        this.mainMenu = document.getElementById('main-menu');
        this.levelsMenu = document.getElementById('levels-menu');
        this.levelCompleteMenu = document.getElementById('level-complete-menu');
        this.startButton = document.getElementById('start-button');
        this.levelsButton = document.getElementById('levels-button');
        this.soundButton = document.getElementById('sound-toggle');
        this.backButton = document.getElementById('back-button');
        this.nextLevelButton = document.getElementById('next-level-button');
        this.openMenuButton = document.getElementById('open-menu-button');
        this.timeLevel = document.getElementById('time-spent');
    }

    initHandlers() {
        this.startButton.addEventListener('click', () => this.toggleGame());
        this.levelsButton.addEventListener('click', () => this.showLevels());
        this.soundButton.addEventListener('click', () => this.toggleSound());
        this.backButton.addEventListener('click', () => this.showMainMenu());
        this.nextLevelButton.addEventListener('click', () => this.nextLevel());
        this.openMenuButton.addEventListener('click', () => this.pauseGame());
    }

    initSound() {
        if(this.storage.getSoundStatus() == 'disable'){
            this.toggleSound();
        }
    }

    toggleGame() {
        if (!this.game.gameStart) {
            this.startGame();
        } else if (this.game.isPaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }

    startGame(level = null) {
        level = level || (this.storage.getCurrentLevel() <= this.game.levels.length ? this.storage.getCurrentLevel() : 1);

        this.game.gameStart = true;
        this.sound.playAmbient();
        this.game.startLevel(level);
        this.hideOverlay();
    }

    pauseGame() {
        if (this.game.gameStart && !this.game.isPaused) {
            this.game.isPaused = true;
            this.startButton.textContent = 'Продолжить';
            this.mainMenu.classList.remove('hidden');
            this.showOverlay();
        }
    }

    resumeGame() {
        this.hideOverlay();
        this.game.isPaused = false;
        this.game.draw();
    }

    showOverlay() {
        this.overlay.classList.remove('hidden');
    }

    hideOverlay() {
        this.hideMenus();
        this.overlay.classList.add('hidden');
    }

    showMainMenu() {
        this.hideMenus();
        this.mainMenu.classList.remove('hidden');
    }

    showLevels() {
        this.hideMenus();
        this.createLevelsList();
        this.levelsMenu.classList.remove('hidden');
    }

    showLevelComplete() {
        this.game.isPaused = true;
        this.levelCompleteMenu.classList.remove('hidden');
        this.showOverlay();
    }

    hideMenus() {
        this.mainMenu.classList.add('hidden');
        this.levelsMenu.classList.add('hidden');
        this.levelCompleteMenu.classList.add('hidden');
    }

    createLevelsList() {
        const levelsList = document.getElementById('levels-list');
        levelsList.innerHTML = '';

        const levelsCompleted = this.storage.getLevelsCompleted();
        for (let i = 1; i <= this.game.levels.length; i++) {
            const levelButton = document.createElement('button');
            levelButton.textContent = `${i}`;
            levelButton.classList.add('level-button');
            if (i > levelsCompleted + 1) {
                levelButton.classList.add('locked');
                levelButton.disabled = true;
            } else {
                levelButton.addEventListener('click', () => this.startGame(i));
            }
            levelsList.appendChild(levelButton);
        }
    }

    nextLevel() {
        this.hideOverlay();
        const nextLevel = this.game.currentLevel + 1;
        if (nextLevel <= this.game.levels.length) {
            this.game.startLevel(nextLevel);
        } else {
            this.game.gameStart = false;
            this.showLevels();
            this.showOverlay();
        }
    }

    toggleSound() {
        this.sound.toggleSound();
        this.soundButton.textContent = `Звук: ${this.sound.muted ? 'Выкл' : 'Вкл'}`;
        this.storage.setSoundStatus(this.sound.muted ? 'disable' : 'enable');
        this.soundButton.classList.toggle('mute');
    }

    setLevelTime(time) {
        this.timeLevel.textContent = time;
    }

    setLevelNumber(level) {
        this.levelName.textContent = `Уровень ${level}`;
    }
}
