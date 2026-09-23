// ===================================================================
// MOTOR DE GRÁFICOS Y EVOLUCIÓN DE CARGAS (GYMTRACK PRO)
// ===================================================================

const AnalyticsCharts = {
    currentExerciseId: 'sentadilla_trasera',
    currentMetric: 'maxWeight', // 'maxWeight', 'best1RM', 'totalVolume'
    chartInstance: null,

    init() {
        this.cacheDOMElements();
        this.populateExerciseSelect();
        this.bindEvents();
        this.render();
    },

    cacheDOMElements() {
        this.exerciseSelect = document.getElementById('analytics-exercise-select');
        this.metricTabs = document.querySelectorAll('.metric-tab-btn');
        this.chartContainer = document.getElementById('analytics-chart-container');
        this.statsContainer = document.getElementById('analytics-stats-summary');
    },

    bindEvents() {
        if (this.exerciseSelect) {
            this.exerciseSelect.addEventListener('change', (e) => {
                this.currentExerciseId = e.target.value;
                this.render();
            });
        }

        this.metricTabs.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.metricTabs.forEach(b => b.classList.remove('active'));
                const target = e.currentTarget;
                target.classList.add('active');
                this.currentMetric = target.dataset.metric;
                this.render();
            });
        });
    },

    populateExerciseSelect() {
        if (!this.exerciseSelect) return;
        const allExercises = window.StorageService ? window.StorageService.getAllExercises() : [];
        const history = window.StorageService ? window.StorageService.getWorkoutHistory() : [];

        // Identificar ejercicios con datos registrados
        const usedExerciseIds = new Set();
        history.forEach(session => {
            if (session.exercises) {
                session.exercises.forEach(ex => usedExerciseIds.add(ex.exerciseId));
            }
        });

        this.exerciseSelect.innerHTML = '';

        // Priorizar los ejercicios con datos
        const grouped = {
            conDatos: [],
            resto: []
        };

        allExercises.forEach(ex => {
            if (usedExerciseIds.has(ex.id)) {
                grouped.conDatos.push(ex);
            } else {
                grouped.resto.push(ex);
            }
        });

        if (grouped.conDatos.length > 0) {
            const optGroup = document.createElement('optgroup');
            optGroup.label = '📈 Ejercicios con historial';
            grouped.conDatos.forEach(ex => {
                const opt = document.createElement('option');
                opt.value = ex.id;
                opt.textContent = `${ex.name} (${ex.category.toUpperCase()})`;
                optGroup.appendChild(opt);
            });
            this.exerciseSelect.appendChild(optGroup);
        }

        const optGroupRest = document.createElement('optgroup');
        optGroupRest.label = 'Todos los ejercicios';
        grouped.resto.forEach(ex => {
            const opt = document.createElement('option');
            opt.value = ex.id;
            opt.textContent = `${ex.name} (${ex.category.toUpperCase()})`;
            optGroupRest.appendChild(opt);
        });
        this.exerciseSelect.appendChild(optGroupRest);

        // Seleccionar el primero con datos o el predeterminado
        if (grouped.conDatos.length > 0) {
            this.currentExerciseId = grouped.conDatos[0].id;
            this.exerciseSelect.value = this.currentExerciseId;
        } else if (allExercises.length > 0) {
            this.currentExerciseId = allExercises[0].id;
            this.exerciseSelect.value = this.currentExerciseId;
        }
    },

    render() {
        if (!window.StorageService) return;
        const timeline = window.StorageService.getExerciseEvolution(this.currentExerciseId);
        const exercise = window.StorageService.getExerciseById(this.currentExerciseId);

        this.renderStatsSummary(timeline, exercise);

        if (!timeline || timeline.length === 0) {
            this.renderEmptyState(exercise);
            return;
        }

        // Si Chart.js está cargado desde CDN o ventana
        if (typeof Chart !== 'undefined') {
            this.renderWithChartJs(timeline, exercise);
        } else {
            // Motor SVG autónomo de alta fidelidad (funciona sin conexión a internet)
            this.renderWithNativeSvg(timeline, exercise);
        }
    },

    renderStatsSummary(timeline, exercise) {
        if (!this.statsContainer) return;

        if (!timeline || timeline.length === 0) {
            this.statsContainer.innerHTML = `
                <div class="stat-card">
                    <span class="stat-label">Sesiones</span>
                    <span class="stat-value">0</span>
                    <span class="stat-sub">Sin registros</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Mejor Carga</span>
                    <span class="stat-value">-- kg</span>
                    <span class="stat-sub">Regístrala hoy</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">1RM Estimado</span>
                    <span class="stat-value">-- kg</span>
                    <span class="stat-sub">Fórmula Epley</span>
                </div>
            `;
            return;
        }

        const maxWeight = Math.max(...timeline.map(t => t.maxWeight));
        const max1RM = Math.max(...timeline.map(t => t.best1RM));
        const firstSession = timeline[0];
        const lastSession = timeline[timeline.length - 1];

        let evolutionText = 'Inicio';
        let evolutionClass = 'text-primary';
        if (timeline.length > 1) {
            const diff = lastSession.maxWeight - firstSession.maxWeight;
            if (firstSession.maxWeight > 0) {
                const percent = Math.round((diff / firstSession.maxWeight) * 100);
                if (percent > 0) {
                    evolutionText = `+${percent}% (${diff >= 0 ? '+' : ''}${diff} kg)`;
                    evolutionClass = 'text-success';
                } else if (percent < 0) {
                    evolutionText = `${percent}% (${diff} kg)`;
                    evolutionClass = 'text-warning';
                } else {
                    evolutionText = '= Manteniendo marca';
                }
            }
        }

        this.statsContainer.innerHTML = `
            <div class="stat-card">
                <span class="stat-label">Sesiones</span>
                <span class="stat-value">${timeline.length}</span>
                <span class="stat-sub">Entrenamientos</span>
            </div>
            <div class="stat-card highlight-card">
                <span class="stat-label">🏆 Récord (PR)</span>
                <span class="stat-value">${maxWeight} <span class="unit">kg</span></span>
                <span class="stat-sub">Carga máxima</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">1RM Estimado</span>
                <span class="stat-value">${max1RM} <span class="unit">kg</span></span>
                <span class="stat-sub">Fuerza a 1 repetición</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Progreso</span>
                <span class="stat-value ${evolutionClass}" style="font-size: 1.25rem;">${evolutionText}</span>
                <span class="stat-sub">Desde la 1ª sesión</span>
            </div>
        `;
    },

    renderEmptyState(exercise) {
        if (!this.chartContainer) return;
        const name = exercise ? exercise.name : 'este ejercicio';
        this.chartContainer.innerHTML = `
            <div class="chart-empty-state">
                <div class="empty-icon">📊</div>
                <h3>Aún no hay registros de ${name}</h3>
                <p>Completa una sesión que incluya este ejercicio para visualizar la gráfica de progresión de cargas y volumen.</p>
                <button class="btn btn-secondary btn-sm" id="btn-load-demo-data">
                    Cargar datos de demostración
                </button>
            </div>
        `;

        const btnDemo = document.getElementById('btn-load-demo-data');
        if (btnDemo) {
            btnDemo.addEventListener('click', () => {
                if (window.StorageService) {
                    window.StorageService.loadDemoData();
                    this.populateExerciseSelect();
                    this.currentExerciseId = 'press_banca_plano';
                    if (this.exerciseSelect) this.exerciseSelect.value = 'press_banca_plano';
                    this.render();
                }
            });
        }
    },

    renderWithChartJs(timeline, exercise) {
        this.chartContainer.innerHTML = '<canvas id="evolutionChartCanvas"></canvas>';
        const canvas = document.getElementById('evolutionChartCanvas');
        const ctx = canvas.getContext('2d');

        const labels = timeline.map(t => {
            const d = new Date(t.date);
            return `${d.getDate()}/${d.getMonth() + 1}`;
        });

        let dataValues = [];
        let labelName = '';
        let lineColor = '#ff6b00';
        let gradientColor = 'rgba(255, 107, 0, 0.25)';

        if (this.currentMetric === 'maxWeight') {
            dataValues = timeline.map(t => t.maxWeight);
            labelName = 'Carga Máxima (kg)';
            lineColor = '#ff6b00';
            gradientColor = 'rgba(255, 107, 0, 0.3)';
        } else if (this.currentMetric === 'best1RM') {
            dataValues = timeline.map(t => t.best1RM);
            labelName = '1RM Estimado (kg)';
            lineColor = '#ff8533';
            gradientColor = 'rgba(255, 133, 51, 0.25)';
        } else {
            dataValues = timeline.map(t => t.totalVolume);
            labelName = 'Volumen Total (kg levantados)';
            lineColor = '#ffa000';
            gradientColor = 'rgba(255, 160, 0, 0.25)';
        }

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: labelName,
                    data: dataValues,
                    borderColor: lineColor,
                    backgroundColor: gradientColor,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: lineColor,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: { color: '#a3a8b8', font: { family: 'inherit', weight: '700' } }
                    },
                    tooltip: {
                        backgroundColor: '#12141c',
                        titleColor: '#ffffff',
                        bodyColor: '#ff8533',
                        borderColor: '#ff6b00',
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            label: (context) => ` ${context.parsed.y} ${this.currentMetric === 'totalVolume' ? 'kg volumen' : 'kg'}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(38, 41, 51, 0.6)' },
                        ticks: { color: '#a3a8b8' }
                    },
                    y: {
                        grid: { color: 'rgba(38, 41, 51, 0.6)' },
                        ticks: { color: '#a3a8b8' },
                        beginAtZero: false
                    }
                }
            }
        });
    },

    // Motor SVG interactivo autónomo (fallback de alta fidelidad sin requerir conexión a internet)
    renderWithNativeSvg(timeline, exercise) {
        let dataValues = [];
        let labelName = 'Carga Máxima (kg)';
        let lineColor = '#ff6b00';

        if (this.currentMetric === 'maxWeight') {
            dataValues = timeline.map(t => t.maxWeight);
            labelName = 'Carga Máxima (kg)';
            lineColor = '#ff6b00';
        } else if (this.currentMetric === 'best1RM') {
            dataValues = timeline.map(t => t.best1RM);
            labelName = '1RM Estimado (kg)';
            lineColor = '#ff8533';
        } else {
            dataValues = timeline.map(t => t.totalVolume);
            labelName = 'Volumen Total (kg)';
            lineColor = '#ffa000';
        }

        const width = 600;
        const height = 260;
        const padding = { top: 30, right: 30, bottom: 40, left: 50 };

        const minVal = Math.min(...dataValues) * 0.9;
        const maxVal = Math.max(...dataValues) * 1.1 || 10;
        const range = maxVal - minVal;

        const points = dataValues.map((val, idx) => {
            const x = padding.left + (idx / Math.max(dataValues.length - 1, 1)) * (width - padding.left - padding.right);
            const y = height - padding.bottom - ((val - minVal) / range) * (height - padding.top - padding.bottom);
            return { x, y, val, date: timeline[idx].date };
        });

        const pathD = points.reduce((acc, pt, idx) => {
            return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
        }, '');

        const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;

        const svgMarkup = `
            <div class="native-svg-chart-wrapper">
                <div class="chart-header-label" style="color: ${lineColor}">
                    <span>${labelName}</span>
                </div>
                <svg viewBox="0 0 ${width} ${height}" class="native-evolution-svg">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="${lineColor}" stop-opacity="0.3"/>
                            <stop offset="100%" stop-color="${lineColor}" stop-opacity="0.0"/>
                        </linearGradient>
                    </defs>

                    <!-- Eje X y líneas de cuadrícula -->
                    <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="#334155" stroke-width="1.5"/>
                    <line x1="${padding.left}" y1="${padding.top}" x2="${width - padding.right}" y2="${padding.top}" stroke="#334155" stroke-dasharray="4" stroke-opacity="0.5"/>

                    <!-- Área con degradado -->
                    <path d="${areaD}" fill="url(#chartGradient)" />
                    <!-- Línea principal -->
                    <path d="${pathD}" fill="none" stroke="${lineColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

                    <!-- Puntos y valores -->
                    ${points.map(pt => {
                        const d = new Date(pt.date);
                        const dateFormatted = `${d.getDate()}/${d.getMonth() + 1}`;
                        return `
                            <g class="chart-point-group">
                                <circle cx="${pt.x}" cy="${pt.y}" r="6" fill="${lineColor}" stroke="#ffffff" stroke-width="2"/>
                                <text x="${pt.x}" y="${pt.y - 12}" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">${pt.val}</text>
                                <text x="${pt.x}" y="${height - padding.bottom + 18}" fill="#94a3b8" font-size="11" text-anchor="middle">${dateFormatted}</text>
                            </g>
                        `;
                    }).join('')}
                </svg>
            </div>
        `;

        this.chartContainer.innerHTML = svgMarkup;
    }
};

window.AnalyticsCharts = AnalyticsCharts;
