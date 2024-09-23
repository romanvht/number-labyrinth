class Levels {
    constructor() {
        this.levels = [];
        this.loadLevels();
    }

    loadLevels() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'assets/json/levels.json', false);
        try {
            xhr.send();
            if (xhr.status === 200) {
                this.levels = JSON.parse(xhr.responseText);
            } else {
                console.error('Ошибка при загрузке уровней:', xhr.status);
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    }
    
    getLevels() {
        return this.levels;
    }
}