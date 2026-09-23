// ===================================================================
// TEMPORIZADOR DE DESCANSO CON WEB AUDIO API (GYMTRACK PRO)
// ===================================================================

const RestTimer = {
    totalSeconds: 90,
    remainingSeconds: 90,
    intervalId: null,
    isRunning: false,
    isMinimized: false,
    audioCtx: null,

    init() {
        this.cacheDOMElements();
        this.bindEvents();
        this.updateDisplay();
    },

    cacheDOMElements() {
        this.widget = document.getElementById('floating-timer-widget');
        this.display = document.getElementById('timer-display');
        this.statusText = document.getElementById('timer-status');
        this.startPauseBtn = document.getElementById('timer-toggle-btn');
        this.resetBtn = document.getElementById('timer-reset-btn');
        this.minimizeBtn = document.getElementById('timer-minimize-btn');
        this.presetsContainer = document.getElementById('timer-presets');
        this.progressBar = document.getElementById('timer-progress-circle');
        this.miniBody = document.querySelector('.timer-mini-body');
        this.isMinimized = true; // Empieza minimizado por defecto
    },

    bindEvents() {
        if (this.startPauseBtn) {
            this.startPauseBtn.addEventListener('click', () => this.toggle());
        }
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.reset());
        }
        if (this.minimizeBtn) {
            this.minimizeBtn.addEventListener('click', () => this.toggleMinimize());
        }
        if (this.miniBody) {
            this.miniBody.addEventListener('click', () => this.toggleMinimize());
            this.miniBody.style.cursor = 'pointer';
        }

        // Presets rápidos
        const presetBtns = document.querySelectorAll('.timer-preset-btn');
        presetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const seconds = parseInt(e.currentTarget.dataset.seconds, 10);
                this.setAndStart(seconds);
            });
        });

        // Botones de ajuste (+15s, +30s)
        const add15 = document.getElementById('timer-add-15');
        const add30 = document.getElementById('timer-add-30');
        if (add15) add15.addEventListener('click', () => this.addTime(15));
        if (add30) add30.addEventListener('click', () => this.addTime(30));
    },

    // Sintetizador de tonos con Web Audio API (100% offline, sin dependencias)
    playTone(frequency, duration, type = 'sine') {
        const settings = window.StorageService ? window.StorageService.getSettings() : { soundEnabled: true };
        if (!settings.soundEnabled) return;

        try {
            if (!this.audioCtx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                this.audioCtx = new AudioContextClass();
            }
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }

            const osc = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

            // Envolvente suave para evitar chasquidos
            gainNode.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.3, this.audioCtx.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

            osc.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);

            osc.start();
            osc.stop(this.audioCtx.currentTime + duration);
        } catch (e) {
            console.warn('Audio no disponible en este dispositivo:', e);
        }
    },

    playCountdownWarning() {
        this.playTone(587.33, 0.12, 'triangle'); // Nota Re5
    },

    playFinishSound() {
        // Doble pitido agudo triunfal
        this.playTone(880, 0.2, 'sine'); // La5
        setTimeout(() => {
            this.playTone(1174.66, 0.35, 'sine'); // Re6
        }, 220);
    },

    setAndStart(seconds) {
        this.totalSeconds = seconds;
        this.remainingSeconds = seconds;
        this.updateDisplay();
        this.start();
        this.showWidget();
    },

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.updateControls();

        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000);
    },

    pause() {
        if (!this.isRunning) return;
        this.isRunning = false;
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.updateControls();
    },

    toggle() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    },

    reset() {
        this.pause();
        this.remainingSeconds = this.totalSeconds;
        this.updateDisplay();
    },

    addTime(seconds) {
        this.remainingSeconds += seconds;
        this.totalSeconds += seconds;
        this.updateDisplay();
        if (!this.isRunning) {
            this.start();
        }
    },

    tick() {
        if (this.remainingSeconds > 0) {
            this.remainingSeconds--;
            this.updateDisplay();

            // Pitidos de aviso a falta de 3, 2 y 1 segundos
            if (this.remainingSeconds === 3 || this.remainingSeconds === 2 || this.remainingSeconds === 1) {
                this.playCountdownWarning();
            }

            if (this.remainingSeconds === 0) {
                this.pause();
                this.playFinishSound();
                this.onTimerComplete();
            }
        }
    },

    onTimerComplete() {
        if (this.statusText) {
            this.statusText.textContent = '¡A por la siguiente serie!';
            this.statusText.classList.add('text-success', 'pulse-animation');
            setTimeout(() => {
                if (this.statusText) {
                    this.statusText.textContent = 'Descanso';
                    this.statusText.classList.remove('text-success', 'pulse-animation');
                }
            }, 5000);
        }

        // Si la pantalla soporta vibración (móvil)
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 300]);
        }
    },

    updateDisplay() {
        const mins = Math.floor(this.remainingSeconds / 60);
        const secs = this.remainingSeconds % 60;
        const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        if (this.display) {
            this.display.textContent = timeFormatted;
        }

        // Anillo de progreso SVG (circunferencia aprox 2 * PI * 42 = 263.89)
        if (this.progressBar) {
            const circumference = 263.89;
            const progress = this.totalSeconds > 0 ? (this.remainingSeconds / this.totalSeconds) : 0;
            const dashoffset = circumference * (1 - progress);
            this.progressBar.style.strokeDashoffset = dashoffset;
        }

        // Actualizar mini contador si está minimizado
        const miniDisplay = document.getElementById('mini-timer-text');
        if (miniDisplay) {
            miniDisplay.textContent = timeFormatted;
        }
    },

    updateControls() {
        if (!this.startPauseBtn) return;
        if (this.isRunning) {
            this.startPauseBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
                <span>Pausar</span>
            `;
            this.startPauseBtn.classList.remove('btn-primary');
            this.startPauseBtn.classList.add('btn-warning');
        } else {
            this.startPauseBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <span>Reanudar</span>
            `;
            this.startPauseBtn.classList.remove('btn-warning');
            this.startPauseBtn.classList.add('btn-primary');
        }
    },

    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        if (this.widget) {
            this.widget.classList.toggle('timer-minimized', this.isMinimized);
        }
    },

    showWidget() {
        if (this.widget) {
            this.widget.classList.remove('hidden');
        }
    },

    hideWidget() {
        if (this.widget) {
            this.widget.classList.add('hidden');
        }
    }
};

window.RestTimer = RestTimer;
