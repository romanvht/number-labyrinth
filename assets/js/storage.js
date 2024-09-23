class Storage {
    constructor() {
        this.progressKey = 'gameProgress';
        this.soundKey = 'sound';
        this.progress = this.loadProgress();
    }

    loadProgress() {
        const progress = localStorage.getItem(this.progressKey);
        return progress ? JSON.parse(progress) : { levelsCompleted: 0 };
    }

    saveProgress(level) {
        if (level > this.progress.levelsCompleted) {
            this.progress.levelsCompleted = level;
            localStorage.setItem(this.progressKey, JSON.stringify(this.progress));
        }
    }

    getLevelsCompleted() {
        return this.progress.levelsCompleted;
    }

    getCurrentLevel() {
        return this.progress.levelsCompleted ? this.progress.levelsCompleted + 1 : 1;
    }

    setSoundStatus(status) {
        localStorage.setItem(this.soundKey, status)
    }

    getSoundStatus() {
        return localStorage.getItem(this.soundKey) ? localStorage.getItem(this.soundKey) : 'enable';
    }
}
