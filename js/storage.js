const SAVE_KEY = 'dish_washer_idle_v1';

export const defaultState = {
    plates: 0,
    coins: 0,
    heat: 0,
    sponges: 0,
    lang: 'tc',
    lastTimestamp: Date.now(),
    helpers: {
        h1: { count: 0, baseCost: 15, baseCPS: 0.5 },
        h2: { count: 0, baseCost: 100, baseCPS: 4.0 },
        h3: { count: 0, baseCost: 1100, baseCPS: 32.0 },
        h4: { count: 0, baseCost: 12000, baseCPS: 260.0 }
    },
    venues: {
        v1: { unlocked: true, cost: 0, mult: 1.0 },
        v2: { unlocked: false, cost: 5000, mult: 2.5 },
        v3: { unlocked: false, cost: 100000, mult: 8.0 }
    },
    currentVenue: 'v1'
};

export class StorageManager {
    static save(state) {
        try {
            state.lastTimestamp = Date.now();
            localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save state to LocalStorage", e);
        }
    }

    static load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return StorageManager.validate(parsed);
        } catch (e) {
            console.error("Failed to load state from LocalStorage", e);
            return null;
        }
    }

    static validate(loadedState) {
        const merged = JSON.parse(JSON.stringify(defaultState));
        Object.assign(merged, loadedState);
        merged.helpers = { ...defaultState.helpers, ...(loadedState.helpers || {}) };
        merged.venues = { ...defaultState.venues, ...(loadedState.venues || {}) };
        return merged;
    }
}