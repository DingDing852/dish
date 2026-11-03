import { dictionary, I18nManager } from './i18n.js';
import { StorageManager, defaultState } from './storage.js';
import { GameEngine } from './engine.js';
import { PlateEntity, ParticleSystem } from './entities.js';

class GameApp {
    constructor() {
        this.state = StorageManager.load() || JSON.parse(JSON.stringify(defaultState));
        this.i18n = new I18nManager(this.state.lang);
        
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.plate = new PlateEntity(this.canvas.width, this.canvas.height);
        this.particles = new ParticleSystem();
        
        this.vipTimer = 0;
        this.frenzyTimer = 0;
        
        this.initDOM();
        this.initEvents();
        this.resizeCanvas();
        
        this.engine = new GameEngine(
            (dt) => this.update(dt),
            () => this.render()
        );

        this.processOfflineEarnings();
        this.engine.start();
        
        // Auto save loop
        setInterval(() => StorageManager.save(this.state), 5000);
    }

    initDOM() {
        this.i18n.updateDOM();
        document.getElementById('lang-btn').textContent = this.state.lang === 'tc' ? 'ENG' : '繁體中文';
        this.renderShop();
    }

    processOfflineEarnings() {
        const cps = this.calculateCPS();
        const { timePassed, earned } = GameEngine.calculateOfflineEarnings(this.state.lastTimestamp, cps);
        if (earned > 0 && timePassed > 10) {
            this.state.coins += earned;
            this.showToast(`Welcome back! Offline earnings: $${earned.toFixed(2)}`);
        }
    }

    calculateCost(baseCost, count) {
        return Math.floor(baseCost * Math.pow(1.15, count));
    }

    calculateCPS() {
        let baseCPS = 0;
        Object.keys(this.state.helpers).forEach(key => {
            const h = this.state.helpers[key];
            baseCPS += h.count * h.baseCPS;
        });

        const venueMult = this.state.venues[this.state.currentVenue].mult;
        const spongeMult = 1 + (this.state.sponges * 0.1);
        const frenzyMult = this.frenzyTimer > 0 ? 3 : 1;
        const vipMult = this.vipTimer > 0 ? 2 : 1;

        return baseCPS * venueMult * spongeMult * frenzyMult * vipMult;
    }

    update(dt) {
        // CPS Earnings Tick
        const cps = this.calculateCPS();
        this.state.coins += cps * dt;

        // Timers
        if (this.frenzyTimer > 0) {
            this.frenzyTimer -= dt;
            if (this.frenzyTimer <= 0) {
                document.getElementById('frenzy-banner').classList.add('hidden');
            }
        }

        if (this.vipTimer > 0) {
            this.vipTimer -= dt;
        }

        // Heat decay
        if (this.frenzyTimer <= 0 && this.state.heat > 0) {
            this.state.heat = Math.max(0, this.state.heat - dt * 8);
        }

        // Random VIP event
        if (Math.random() < 0.0003 && this.vipTimer <= 0) {
            this.vipTimer = 20;
            this.showToast(this.i18n.t('toastVip'));
        }

        this.particles.update(dt, this.canvas.width, this.canvas.height);
        this.updateUI();
    }

    updateUI() {
        document.getElementById('plates-display').textContent = Math.floor(this.state.plates);
        document.getElementById('coins-display').textContent = `$${this.state.coins.toFixed(2)}`;
        document.getElementById('cps-display').textContent = this.calculateCPS().toFixed(1);

        const heatPct = Math.min(100, Math.floor(this.state.heat));
        document.getElementById('heat-fill').style.width = `${heatPct}%`;
        document.getElementById('heat-status').textContent = `${heatPct}%`;

        // Update prestige pending sponges
        const pending = Math.floor(Math.sqrt(this.state.coins / 10000));
        document.getElementById('pending-sponges').textContent = pending;
        document.getElementById('sponges-count').textContent = this.state.sponges;

        // Upgrade button availability states
        document.querySelectorAll('.upgrade-card').forEach(card => {
            const cost = parseFloat(card.dataset.cost);
            if (this.state.coins < cost) {
                card.classList.add('disabled');
            } else {
                card.classList.remove('disabled');
            }
        });
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.plate.render(this.ctx);
        this.particles.render(this.ctx);
    }

    scrubDish(x, y) {
        const isClean = this.plate.cleanRandomSpot();
        const baseEarn = 1 * this.state.venues[this.state.currentVenue].mult;
        const earn = baseEarn * (1 + this.state.sponges * 0.1);
        
        this.state.coins += earn;
        this.state.plates += 1;

        // Add heat
        if (this.frenzyTimer <= 0) {
            this.state.heat += 4;
            if (this.state.heat >= 100) {
                this.state.heat = 100;
                this.frenzyTimer = 10;
                document.getElementById('frenzy-banner').classList.remove('hidden');
            }
        }

        this.particles.spawnScrubSplash(x, y, `+$${earn.toFixed(1)}`);
        this.renderShop();
    }

    renderShop() {
        // Render Helpers Tab
        const helpersList = document.getElementById('helpers-list');
        helpersList.innerHTML = '';
        Object.keys(this.state.helpers).forEach(key => {
            const h = this.state.helpers[key];
            const cost = this.calculateCost(h.baseCost, h.count);
            const card = document.createElement('div');
            card.className = `upgrade-card ${this.state.coins < cost ? 'disabled' : ''}`;
            card.dataset.cost = cost;
            card.innerHTML = `
                <div class="u-info">
                    <div class="u-title">${this.i18n.t(key + '_name')} <span class="u-count">x${h.count}</span></div>
                    <div class="u-desc">${this.i18n.t(key + '_desc')}</div>
                </div>
                <div class="u-cost">$${cost}</div>
            `;
            card.addEventListener('click', () => this.buyHelper(key));
            helpersList.appendChild(card);
        });

        // Render Venues Tab
        const venuesList = document.getElementById('venues-list');
        venuesList.innerHTML = '';
        Object.keys(this.state.venues).forEach(key => {
            const v = this.state.venues[key];
            const card = document.createElement('div');
            const isCurrent = this.state.currentVenue === key;
            card.className = `upgrade-card ${v.unlocked ? '' : (this.state.coins < v.cost ? 'disabled' : '')}`;
            card.dataset.cost = v.cost;
            card.innerHTML = `
                <div class="u-info">
                    <div class="u-title">${this.i18n.t(key + '_name')} ${isCurrent ? ' (Active)' : ''}</div>
                    <div class="u-desc">${this.i18n.t(key + '_desc')}</div>
                </div>
                <div class="u-cost">${v.unlocked ? 'Unlocked' : '$' + v.cost}</div>
            `;
            card.addEventListener('click', () => this.selectVenue(key));
            venuesList.appendChild(card);
        });
    }

    buyHelper(key) {
        const h = this.state.helpers[key];
        const cost = this.calculateCost(h.baseCost, h.count);
        if (this.state.coins >= cost) {
            this.state.coins -= cost;
            h.count += 1;
            this.renderShop();
        }
    }

    selectVenue(key) {
        const v = this.state.venues[key];
        if (v.unlocked) {
            this.state.currentVenue = key;
            this.renderShop();
        } else if (this.state.coins >= v.cost) {
            this.state.coins -= v.cost;
            v.unlocked = true;
            this.state.currentVenue = key;
            this.renderShop();
        }
    }

    triggerPrestige() {
        const pending = Math.floor(Math.sqrt(this.state.coins / 10000));
        if (pending <= 0) return;

        this.state.sponges += pending;
        this.state.coins = 0;
        this.state.plates = 0;
        this.state.heat = 0;
        Object.keys(this.state.helpers).forEach(k => this.state.helpers[k].count = 0);
        
        this.showToast(this.i18n.t('toastPrestige'));
        this.renderShop();
    }

    showToast(msg) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }

    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.plate.resize(rect.width, rect.height);
    }

    initEvents() {
        window.addEventListener('resize', () => this.resizeCanvas());

        // Scrubbing action
        let isScrubbing = false;
        const handleScrub = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;
            this.scrubDish(x, y);
        };

        this.canvas.addEventListener('mousedown', (e) => {
            isScrubbing = true;
            handleScrub(e);
        });
        this.canvas.addEventListener('mousemove', (e) => {
            if (isScrubbing) handleScrub(e);
        });
        window.addEventListener('mouseup', () => isScrubbing = false);

        // Language toggle
        document.getElementById('lang-btn').addEventListener('click', () => {
            this.state.lang = this.state.lang === 'tc' ? 'eng' : 'tc';
            this.i18n.setLanguage(this.state.lang);
            document.getElementById('lang-btn').textContent = this.state.lang === 'tc' ? 'ENG' : '繁體中文';
            this.renderShop();
        });

        // Stealth toggle
        const toggleStealth = () => {
            document.getElementById('stealth-view').classList.toggle('hidden');
        };
        document.getElementById('stealth-btn').addEventListener('click', toggleStealth);

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' || e.key === '`') {
                e.preventDefault();
                toggleStealth();
            } else if (e.code === 'Space') {
                e.preventDefault();
                this.scrubDish(this.plate.x, this.plate.y);
            } else if (e.key >= '1' && e.key <= '9') {
                const keys = Object.keys(this.state.helpers);
                const idx = parseInt(e.key) - 1;
                if (keys[idx]) this.buyHelper(keys[idx]);
            }
        });

        // Tabs switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
            });
        });

        // Prestige button
        document.getElementById('prestige-btn').addEventListener('click', () => this.triggerPrestige());
    }
}

// Instantiate on DOM ready
window.addEventListener('DOMContentLoaded', () => {
    new GameApp();
});