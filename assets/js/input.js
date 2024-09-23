class Input {
    constructor(game, sound) {
        this.game = game;
        this.sound = sound;
        this.isDrawing = false;
        this.initEventListeners();
    }

    initEventListeners() {
        this.game.canvas.addEventListener('mousedown', (e) => this.onPointerDown(e));
        this.game.canvas.addEventListener('mousemove', (e) => this.onPointerMove(e));
        this.game.canvas.addEventListener('mouseup', () => this.resetDrawingState());

        this.game.canvas.addEventListener('touchstart', (e) => this.onPointerDown(e));
        this.game.canvas.addEventListener('touchmove', (e) => this.onPointerMove(e));
        this.game.canvas.addEventListener('touchend', () => this.resetDrawingState());

        window.addEventListener('resize', () => this.game.resizeCanvas());
        window.addEventListener("visibilitychange", this.sound.onFocus.bind(this.sound));
    }

    getPointerPosition(e) {
        const rect = this.game.canvas.getBoundingClientRect();
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    onPointerDown(e) {
        e.preventDefault();
        this.isDrawing = true;
        const pos = this.getPointerPosition(e);
        this.game.handleInput(pos.x, pos.y);
    }

    onPointerMove(e) {
        if (!this.isDrawing) return;
        const pos = this.getPointerPosition(e);
        this.game.handleInput(pos.x, pos.y);
    }

    resetDrawingState() {
        this.isDrawing = false;
    }
}
