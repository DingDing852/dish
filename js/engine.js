export class GameEngine {
    constructor(updateCallback, renderCallback) {
        this.update = updateCallback;
        this.render = renderCallback;
        this.lastTime = 0;
        this.accumulatedTime = 0;
        this.step = 1 / 60; // Fixed 60 FPS update tick
        this.isRunning = false;
    }

    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop.bind(this));
    }

    stop() {
        this.isRunning = false;
    }

    loop(currentTime) {
        if (!this.isRunning) return;

        const delta = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        this.accumulatedTime += Math.min(delta, 0.25); // Cap to prevent spiral of death

        while (this.accumulatedTime >= this.step) {
            this.update(this.step);
            this.accumulatedTime -= this.step;
        }

        this.render();
        requestAnimationFrame(this.loop.bind(this));
    }

    static calculateOfflineEarnings(lastTimestamp, totalCPS) {
        if (!lastTimestamp) return { timePassed: 0, earned: 0 };
        const now = Date.now();
        const timePassed = Math.max(0, (now - lastTimestamp) / 1000);
        // Cap offline earnings to 8 hours max
        const cappedTime = Math.min(timePassed, 28800);
        const earned = cappedTime * totalCPS * 0.5; // 50% rate offline
        return { timePassed: cappedTime, earned };
    }
}