// ===================================================================
// CONTROLADOR GENERAL DE INTERFAZ Y NAVEGACIÓN (GYMTRACK PRO)
// ===================================================================

const App = {
    currentTab: 'routines',
    exerciseSelectorCallback: null,

    init() {
        this.cacheDOMElements();
        this.bindEvents();

        // Inicializar submódulos
        if (window.RestTimer) window.RestTimer.init();
        if (window.WorkoutTracker) window.WorkoutTracker.init();
        if (window.AnalyticsCharts) window.AnalyticsCharts.init();

        this.renderRoutinesView();
        this.renderExercisesCatalog();
        this.renderHistoryView();
        this.loadSettingsForm();
        this.checkWelcomeScreen();

        // Soporte de navegación por URL hash (#exercises, #analytics, etc.)
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '');
            if (['workout', 'routines', 'exercises', 'analytics', 'history', 'settings'].includes(hash)) {
                this.switchView(hash, false);
            }
        });

        const initialHash = window.location.hash.replace('#', '');
        if (['workout', 'routines', 'exercises', 'analytics', 'history', 'settings'].includes(initialHash)) {
            this.switchView(initialHash, false);
        } else if (initialHash === 'testmodal') {
            this.switchView('analytics', false);
            setTimeout(() => { if (window.RankingService) window.RankingService.openMuscleModal('pecho'); }, 200);
        } else if (initialHash === 'testback') {
            this.switchView('analytics', false);
            setTimeout(() => { if (window.RankingService) window.RankingService.toggleSilhouetteView(); }, 200);
        } else if (window.WorkoutTracker && window.WorkoutTracker.activeSession) {
            this.switchView('workout', false);
        } else {
            this.switchView('routines', false);
        }
    },

    cacheDOMElements() {
        this.navButtons = document.querySelectorAll('.nav-tab-btn');
        this.views = document.querySelectorAll('.app-view');
        this.toast = document.getElementById('app-toast');
        this.welcomeOverlay = document.getElementById('welcome-screen-overlay');
        this.welcomeInput = document.getElementById('welcome-input-name');
        this.headerAthleteName = document.getElementById('header-athlete-name');
    },

    // Menú de entrada permanente y citas motivacionales de culturistas
    checkWelcomeScreen() {
        if (sessionStorage.getItem('stetics_test_skip_welcome') === 'true') {
            sessionStorage.removeItem('stetics_test_skip_welcome');
            if (this.welcomeOverlay) this.welcomeOverlay.classList.add('hidden');
            if (window.RankingService) window.RankingService.updateHeaderBadge();
            this.switchView('analytics');
            if (window.location.hash === '#testback') {
                if (window.RankingService) window.RankingService.toggleSilhouetteView();
            } else if (window.location.hash === '#testmodal') {
                if (window.RankingService) window.RankingService.openMuscleModal('pecho');
            }
            return;
        }

        if (window.location.search.includes('nowelcome')) {
            if (this.welcomeOverlay) this.welcomeOverlay.classList.add('hidden');
            if (window.RankingService) window.RankingService.updateHeaderBadge();
            return;
        }

        const savedName = window.StorageService ? window.StorageService.getUserName() : '';
        const promptLabel = document.getElementById('welcome-label-prompt');
        const quoteTextEl = document.getElementById('welcome-quote-text');
        const quoteAuthorEl = document.getElementById('welcome-quote-author');
        const quoteTitleEl = document.getElementById('welcome-quote-title');

        // Cargar cita motivacional célebre en español
        if (window.QuotesService) {
            window.QuotesService.renderQuoteInElement(quoteTextEl, quoteAuthorEl, quoteTitleEl);
        }

        // Configurar saludo y campo de nombre
        if (savedName) {
            if (this.headerAthleteName) this.headerAthleteName.textContent = savedName;
            if (this.welcomeInput) this.welcomeInput.value = savedName;
            if (promptLabel) {
                promptLabel.innerHTML = `¡Hola de nuevo, <strong style="color: var(--primary);">${savedName}</strong>! Listo para romper récords:`;
            }
        } else {
            if (promptLabel) {
                promptLabel.textContent = 'Introduce tu nombre o alias:';
            }
        }

        // Siempre mostrar el menú principal al inicio de la sesión
        if (this.welcomeOverlay) {
            this.welcomeOverlay.classList.remove('hidden');
            this.welcomeOverlay.style.opacity = '1';
            this.welcomeOverlay.style.transform = 'scale(1)';
        }

        // Actualizar rango en el header si existe
        if (window.RankingService) {
            window.RankingService.updateHeaderBadge();
        }
    },

    refreshWelcomeQuote() {
        if (window.QuotesService) {
            const quoteTextEl = document.getElementById('welcome-quote-text');
            const quoteAuthorEl = document.getElementById('welcome-quote-author');
            const quoteTitleEl = document.getElementById('welcome-quote-title');
            window.QuotesService.renderQuoteInElement(quoteTextEl, quoteAuthorEl, quoteTitleEl);
            
            // Sonido de clic sutil
            if (window.RestTimer) {
                window.RestTimer.playTone(700, 0.05, 'sine');
            }
        }
    },

    submitWelcomeName() {
        const nameInput = document.getElementById('welcome-input-name');
        const name = nameInput ? nameInput.value.trim() : '';
        if (!name) {
            alert('Por favor, introduce tu nombre o alias para comenzar.');
            return;
        }

        if (window.StorageService) {
            window.StorageService.saveUserName(name);
        }

        if (this.headerAthleteName) {
            this.headerAthleteName.textContent = name;
        }

        if (window.RankingService) {
            window.RankingService.updateHeaderBadge();
        }

        if (this.welcomeOverlay) {
            this.welcomeOverlay.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            this.welcomeOverlay.style.opacity = '0';
            this.welcomeOverlay.style.transform = 'scale(1.04)';
            setTimeout(() => {
                this.welcomeOverlay.classList.add('hidden');
                this.welcomeOverlay.style.opacity = '1';
                this.welcomeOverlay.style.transform = 'scale(1)';
            }, 400);
        }

        // Tono y felicitación de entrada
        if (window.RestTimer) {
            window.RestTimer.playTone(659.25, 0.15, 'sine'); // Mi5
            setTimeout(() => window.RestTimer.playTone(880, 0.3, 'sine'), 160); // La5
        }

        this.showToast(`¡Bienvenido a STETICS, ${name}! We're all gonna make it 🔥`);
    },

    openEditNamePrompt() {
        const currentName = window.StorageService ? window.StorageService.getUserName() : '';
        const newName = prompt('Introduce tu nombre o alias de atleta para Stetics:', currentName || 'Atleta');
        if (newName !== null && newName.trim()) {
            window.StorageService.saveUserName(newName.trim());
            if (this.headerAthleteName) this.headerAthleteName.textContent = newName.trim();
            if (window.RankingService) window.RankingService.updateHeaderBadge();
            this.showToast(`Nombre actualizado: ${newName.trim()} ⚡`);
        }
    },

    handleWeightChange(val) {
        if (window.StorageService) {
            const num = window.StorageService.saveUserWeight(val);
            if (window.RankingService) {
                window.RankingService.renderSilhouetteSection();
            }
            this.showToast(`Peso calibrado a ${num} kg para cálculo de rangos de fuerza ⚡`);
        }
    },

    bindEvents() {
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetView = e.currentTarget.dataset.view;
                this.switchView(targetView);
            });
        });

        // Buscador y filtros de ejercicios
        const searchInput = document.getElementById('exercise-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterExercises(e.target.value);
            });
        }

        const categoryPills = document.querySelectorAll('.category-pill');
        categoryPills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                categoryPills.forEach(p => p.classList.remove('active'));
                const target = e.currentTarget;
                target.classList.add('active');
                this.filterExercises(searchInput ? searchInput.value : '', target.dataset.category);
            });
        });

        // Botón crear rutina desde cero
        const btnCreateRoutine = document.getElementById('btn-open-create-routine');
        if (btnCreateRoutine) {
            btnCreateRoutine.addEventListener('click', () => this.openCreateRoutineModal());
        }

        // Calculadora de 1RM
        const calcWeight = document.getElementById('calc-weight');
        const calcReps = document.getElementById('calc-reps');
        if (calcWeight && calcReps) {
            const calculateAndShow = () => {
                const w = parseFloat(calcWeight.value) || 0;
                const r = parseInt(calcReps.value, 10) || 0;
                const resultBox = document.getElementById('calc-1rm-result');
                const percentTable = document.getElementById('calc-percentages-tbody');

                if (w > 0 && r > 0 && window.StorageService) {
                    const oneRM = window.StorageService.calculate1RM(w, r);
                    if (resultBox) resultBox.textContent = `${oneRM} kg`;

                    if (percentTable) {
                        const percents = [95, 90, 85, 80, 75, 70, 65, 60, 50];
                        percentTable.innerHTML = percents.map(p => `
                            <tr>
                                <td>${p}%</td>
                                <td><strong>${Math.round((oneRM * (p / 100)) * 10) / 10} kg</strong></td>
                                <td>${p >= 90 ? '1 - 3' : (p >= 80 ? '4 - 6' : (p >= 70 ? '8 - 10' : '12+'))}</td>
                            </tr>
                        `).join('');
                    }
                }
            };
            calcWeight.addEventListener('input', calculateAndShow);
            calcReps.addEventListener('input', calculateAndShow);
        }

        // Respaldo de datos (Export / Import)
        const btnExport = document.getElementById('btn-export-backup');
        if (btnExport) {
            btnExport.addEventListener('click', () => this.exportBackup());
        }

        const inputImport = document.getElementById('input-import-backup');
        if (inputImport) {
            inputImport.addEventListener('change', (e) => this.importBackup(e));
        }

        const btnLoadDemo = document.getElementById('btn-settings-load-demo');
        if (btnLoadDemo) {
            btnLoadDemo.addEventListener('click', () => {
                if (confirm('¿Cargar 4 semanas de datos de entrenamiento de demostración para ver gráficos y evolución?')) {
                    window.StorageService.loadDemoData();
                    this.renderHistoryView();
                    if (window.RankingService) {
                        window.RankingService.renderSilhouetteSection();
                    }
                    if (window.AnalyticsCharts) {
                        window.AnalyticsCharts.populateExerciseSelect();
                        window.AnalyticsCharts.render();
                    }
                    this.showToast('¡Datos de demostración cargados con éxito!');
                    this.switchView('analytics');
                }
            });
        }
    },

    switchView(viewName, updateHash = true) {
        this.currentTab = viewName;
        if (updateHash && window.location.hash !== `#${viewName}`) {
            window.location.hash = viewName;
        }

        this.views.forEach(v => {
            if (v.id === `view-${viewName}`) {
                v.classList.remove('hidden');
            } else {
                v.classList.add('hidden');
            }
        });

        this.navButtons.forEach(btn => {
            if (btn.dataset.view === viewName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (viewName === 'analytics') {
            if (window.RankingService) {
                window.RankingService.renderSilhouetteSection();
            }
            if (window.AnalyticsCharts) {
                window.AnalyticsCharts.render();
            }
        } else if (viewName === 'routines') {
            this.renderRoutinesView();
        } else if (viewName === 'history') {
            this.renderHistoryView();
        }
    },

    showToast(message, duration = 3000) {
        if (!this.toast) return;
        this.toast.textContent = message;
        this.toast.classList.remove('hidden');
        this.toast.classList.add('show');
        setTimeout(() => {
            this.toast.classList.remove('show');
            setTimeout(() => this.toast.classList.add('hidden'), 300);
        }, duration);
    },

    // ===================================================================
    // VISTA DE RUTINAS (PRECARGADAS Y DESDE CERO)
    // ===================================================================
    renderRoutinesView() {
        const container = document.getElementById('routines-list-container');
        if (!container || !window.StorageService) return;

        const allRoutines = window.StorageService.getAllRoutines();

        container.innerHTML = allRoutines.map(routine => {
            const isCustom = routine.id.startsWith('custom_');
            const exerciseCount = routine.exercises ? routine.exercises.length : 0;

            const exercisesListHtml = (routine.exercises || []).map(item => {
                const ex = window.StorageService.getExerciseById(item.exerciseId);
                return `<li>${ex ? ex.name : item.exerciseId} <span class="routine-ex-sets">(${item.sets} × ${item.targetReps || '10'})</span></li>`;
            }).join('');

            return `
                <div class="routine-card">
                    <div class="routine-card-header">
                        <div>
                            <span class="routine-badge level-${(routine.level || 'Principiante').toLowerCase()}">${routine.badge || routine.level}</span>
                            <h3 class="routine-title">${routine.name}</h3>
                        </div>
                        ${isCustom ? `
                            <button class="btn-icon text-danger" title="Eliminar rutina" onclick="App.deleteCustomRoutine('${routine.id}')">
                                🗑️
                            </button>
                        ` : ''}
                    </div>

                    <p class="routine-desc">${routine.description || ''}</p>

                    ${routine.guidelines && routine.guidelines.length > 0 ? `
                        <div class="routine-guidelines">
                            <strong>💡 Guía para empezar:</strong>
                            <ul>
                                ${routine.guidelines.map(g => `<li>${g}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    <div class="routine-exercises-preview">
                        <strong>Ejercicios incluidos (${exerciseCount}):</strong>
                        <ul class="routine-exercises-list">
                            ${exercisesListHtml}
                        </ul>
                    </div>

                    <div class="routine-card-actions">
                        <button class="btn btn-primary btn-block" onclick="WorkoutTracker.startWorkout(StorageService.getRoutineById('${routine.id}'))">
                            ▶️ Iniciar Esta Rutina
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    // ===================================================================
    // VISTA DE CATÁLOGO DE EJERCICIOS CON GUÍA Y DETALLES TÉCNICOS
    // ===================================================================
    renderExercisesCatalog(filterCategory = 'all', searchQuery = '') {
        const container = document.getElementById('exercises-catalog-container');
        if (!container || !window.StorageService) return;

        let list = window.StorageService.getAllExercises();

        if (filterCategory !== 'all') {
            list = list.filter(e => e.category === filterCategory);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            list = list.filter(e => 
                e.name.toLowerCase().includes(query) || 
                (e.primaryMuscles && e.primaryMuscles.some(m => m.toLowerCase().includes(query)))
            );
        }

        if (list.length === 0) {
            container.innerHTML = `
                <div class="no-exercises-found" style="grid-column: 1 / -1; text-align: center; padding: 36px 20px; background: var(--bg-card); border: 1px dashed var(--border-color); border-radius: var(--radius-lg);">
                    <div style="font-size: 2.4rem; margin-bottom: 8px;">🔍</div>
                    <h3 style="margin-bottom: 6px;">No se encontró "${searchQuery}"</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 16px;">
                        ¿Es un ejercicio específico de tu gimnasio o una variante propia? ¡Créalo en 10 segundos!
                    </p>
                    <button class="btn btn-primary" onclick="App.openCreateCustomExerciseModal('${searchQuery.replace(/'/g, "\\'")}')">
                        + Crear "${searchQuery}" Ahora
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = list.map(ex => {
            const svg = window.getExerciseSvg ? window.getExerciseSvg(ex.category, ex.id) : '';
            const isCustom = ex.id.startsWith('custom_') || ex.isCustom;
            return `
                <div class="catalog-exercise-card" onclick="App.showExerciseGuide('${ex.id}')">
                    <div class="catalog-exercise-svg">
                        ${svg}
                    </div>
                    <div class="catalog-exercise-body">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <span class="exercise-cat-tag cat-${ex.category}">${ex.category.toUpperCase()}</span>
                                ${isCustom ? '<span class="routine-badge level-principiante" style="font-size: 0.65rem; margin-left: 4px;">⭐ Personalizado</span>' : ''}
                            </div>
                            ${isCustom ? `
                                <button class="btn-icon text-danger" title="Eliminar ejercicio personalizado" onclick="event.stopPropagation(); App.deleteCustomExercise('${ex.id}')">
                                    🗑️
                                </button>
                            ` : ''}
                        </div>
                        <h4 class="catalog-exercise-title">${ex.name}</h4>
                        <div class="catalog-muscles-chips">
                            ${(ex.primaryMuscles || []).map(m => `<span class="muscle-chip primary">${m}</span>`).join('')}
                        </div>
                        <div class="catalog-meta">
                            <span>🏋️ ${ex.equipment || 'Gimnasio'}</span>
                            <span>🎯 ${ex.repRangeRecommended || '8-12 reps'}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    filterExercises(query = '', category = null) {
        const activeCategory = category || document.querySelector('.category-pill.active')?.dataset.category || 'all';
        this.renderExercisesCatalog(activeCategory, query);
    },

    // Modal de guía técnica completa para principiantes
    showExerciseGuide(exerciseId) {
        const ex = window.StorageService.getExerciseById(exerciseId);
        if (!ex) return;

        const modal = document.getElementById('exercise-guide-modal');
        const modalBody = document.getElementById('exercise-guide-content');
        if (!modal || !modalBody) return;

        const svg = window.getExerciseSvg ? window.getExerciseSvg(ex.category, ex.id) : '';
        const lastPerf = window.StorageService.getLastPerformance(ex.id);

        modalBody.innerHTML = `
            <div class="guide-modal-header">
                <span class="exercise-cat-tag cat-${ex.category}">${ex.category.toUpperCase()}</span>
                <h2>${ex.name}</h2>
                <div class="guide-meta-pills">
                    <span class="cue-pill">Equipamiento: ${ex.equipment || 'Libre'}</span>
                    <span class="cue-pill">Nivel: ${ex.difficulty || 'Principiante'}</span>
                    <span class="cue-pill">Rango óptimo: ${ex.repRangeRecommended || '8 - 12 reps'}</span>
                </div>
            </div>

            <div class="guide-visual-container">
                ${svg}
            </div>

            <div class="guide-section">
                <h4>🎯 Músculos involucrados</h4>
                <div class="guide-muscles-grid">
                    <div>
                        <strong class="text-primary">Músculos Principales:</strong>
                        <p>${(ex.primaryMuscles || []).join(', ')}</p>
                    </div>
                    <div>
                        <strong class="text-secondary">Músculos Secundarios / Estabilizadores:</strong>
                        <p>${(ex.secondaryMuscles || []).join(', ') || 'Core y estabilizadores generales'}</p>
                    </div>
                </div>
            </div>

            <div class="guide-section">
                <h4>📌 Consejos de Técnica y Seguridad (Cues para amigos)</h4>
                <ul class="guide-tips-list">
                    ${(ex.tips || ['Controla el movimiento en todo momento y no uses pesos que alteren tu postura.']).map(t => `<li>${t}</li>`).join('')}
                </ul>
            </div>

            ${lastPerf ? `
                <div class="guide-section guide-last-perf-box">
                    <h4>📈 Tu Último Rendimiento</h4>
                    <p>Fecha: ${new Date(lastPerf.date).toLocaleDateString()}</p>
                    <div class="last-sets-preview">
                        ${lastPerf.sets.map((s, idx) => `<span>Serie ${idx + 1}: <strong>${s.weight} kg × ${s.reps} reps</strong></span>`).join(' | ')}
                    </div>
                </div>
            ` : ''}

            <div class="guide-actions">
                <button class="btn btn-primary btn-block" onclick="App.addExerciseToWorkoutAndCloseModal('${ex.id}')">
                    + Añadir a mi Entrenamiento Activo
                </button>
            </div>
        `;

        modal.classList.remove('hidden');
    },

    closeExerciseGuide() {
        const modal = document.getElementById('exercise-guide-modal');
        if (modal) modal.classList.add('hidden');
    },

    addExerciseToWorkoutAndCloseModal(exerciseId) {
        this.closeExerciseGuide();
        if (window.WorkoutTracker) {
            window.WorkoutTracker.addExerciseToWorkout(exerciseId);
            this.switchView('workout');
        }
    },

    // Modal selector de ejercicio para añadir
    openExerciseSelectorModal(callback) {
        this.exerciseSelectorCallback = callback;
        const modal = document.getElementById('exercise-selector-modal');
        const listContainer = document.getElementById('exercise-selector-list');
        const searchInput = document.getElementById('modal-exercise-search');
        if (!modal || !listContainer) return;

        const allExercises = window.StorageService.getAllExercises();

        const renderList = (filter = '') => {
            const query = filter.trim().toLowerCase();
            const filtered = allExercises.filter(e => e.name.toLowerCase().includes(query) || e.category.toLowerCase().includes(query));

            let html = '';

            // Si el usuario escribe algo en el buscador, mostrar siempre arriba la opción de crearlo o usarlo al vuelo
            if (query.length > 0) {
                const exactMatch = allExercises.some(e => e.name.toLowerCase() === query);
                if (!exactMatch) {
                    html += `
                        <div class="custom-exercise-banner" onclick="App.openCreateCustomExerciseModal('${filter.trim().replace(/'/g, "\\'")}')">
                            <div class="custom-banner-text">
                                <span class="custom-banner-tag">⚡ EJERCICIO PERSONALIZADO</span>
                                <strong>+ Crear o usar "${filter.trim()}"</strong>
                                <small>Toca aquí para definir músculo, descansos y añadirlo</small>
                            </div>
                            <button class="btn btn-primary btn-sm">+ Crear</button>
                        </div>
                    `;
                }
            }

            if (filtered.length === 0) {
                html += `
                    <div class="no-exercises-found-box">
                        <div style="font-size: 2rem; margin-bottom: 8px;">🏋️</div>
                        <p style="color: var(--text-muted); margin-bottom: 12px;">
                            No encontramos <strong>"${filter}"</strong> en la biblioteca predeterminada.
                        </p>
                        <button class="btn btn-primary" onclick="App.openCreateCustomExerciseModal('${filter.trim().replace(/'/g, "\\'")}')">
                            + Crear "${filter.trim()}" y Añadirlo
                        </button>
                    </div>
                `;
            } else {
                html += filtered.map(e => `
                    <div class="selector-exercise-item" onclick="App.selectExerciseFromModal('${e.id}')">
                        <div class="selector-icon">
                            ${window.getExerciseSvg ? window.getExerciseSvg(e.category, e.id) : ''}
                        </div>
                        <div class="selector-text">
                            <strong>${e.name} ${e.id.startsWith('custom_') ? '<span class="routine-badge level-principiante" style="font-size: 0.65rem; margin-left: 4px;">⭐ Personalizado</span>' : ''}</strong>
                            <span>${e.category.toUpperCase()} • ${(e.primaryMuscles || []).slice(0, 2).join(', ')}</span>
                        </div>
                        <button class="btn btn-secondary btn-sm">+ Seleccionar</button>
                    </div>
                `).join('');
            }

            listContainer.innerHTML = html;
        };

        if (searchInput) {
            searchInput.value = '';
            searchInput.oninput = (e) => renderList(e.target.value);
            setTimeout(() => searchInput.focus(), 250);
        }

        renderList();
        modal.classList.remove('hidden');
    },

    selectExerciseFromModal(exerciseId) {
        const modal = document.getElementById('exercise-selector-modal');
        if (modal) modal.classList.add('hidden');
        if (this.exerciseSelectorCallback) {
            this.exerciseSelectorCallback(exerciseId);
            this.exerciseSelectorCallback = null;
        }
    },

    closeExerciseSelectorModal() {
        const modal = document.getElementById('exercise-selector-modal');
        if (modal) modal.classList.add('hidden');
        this.exerciseSelectorCallback = null;
    },

    // ===================================================================
    // CREADOR DE EJERCICIOS PERSONALIZADOS
    // ===================================================================
    openCreateCustomExerciseModal(prefillName = '') {
        const modal = document.getElementById('create-exercise-modal');
        const nameInput = document.getElementById('new-custom-exercise-name');
        const restInput = document.getElementById('new-custom-exercise-rest');
        if (nameInput) {
            nameInput.value = prefillName || '';
        }
        if (restInput) {
            restInput.value = 90;
        }
        if (modal) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                if (nameInput) nameInput.focus();
            }, 250);
        }
    },

    closeCreateCustomExerciseModal() {
        const modal = document.getElementById('create-exercise-modal');
        if (modal) modal.classList.add('hidden');
    },

    saveCustomExerciseFromModal() {
        const nameInput = document.getElementById('new-custom-exercise-name');
        const categorySelect = document.getElementById('new-custom-exercise-category');
        const equipmentSelect = document.getElementById('new-custom-exercise-equipment');
        const restInput = document.getElementById('new-custom-exercise-rest');

        const name = nameInput ? nameInput.value.trim() : '';
        if (!name) {
            alert('Por favor, escribe un nombre para el ejercicio.');
            return;
        }

        const category = categorySelect ? categorySelect.value : 'pecho';
        const equipment = equipmentSelect ? equipmentSelect.value : 'Mancuernas';
        const restSeconds = restInput ? parseInt(restInput.value, 10) || 90 : 90;

        const newExercise = {
            id: 'custom_ex_' + Date.now(),
            name: name,
            category: category,
            equipment: equipment,
            difficulty: 'Personalizado',
            isCustom: true,
            primaryMuscles: [window.MUSCLE_GROUPS[category]?.name || category],
            secondaryMuscles: ['Músculos estabilizadores'],
            repRangeRecommended: '8 - 12 reps',
            restTimeSeconds: restSeconds,
            tips: [
                'Ejercicio personalizado creado por ti.',
                'Anota tus sensaciones y ajusta el peso serie a serie para lograr sobrecarga progresiva.'
            ]
        };

        window.StorageService.saveCustomExercise(newExercise);
        this.closeCreateCustomExerciseModal();
        this.renderExercisesCatalog();

        // Actualizar selector en analíticas
        if (window.AnalyticsCharts) {
            window.AnalyticsCharts.populateExerciseSelect();
        }

        // Si venía de seleccionar un ejercicio para un entrenamiento o rutina
        if (this.exerciseSelectorCallback) {
            const callback = this.exerciseSelectorCallback;
            this.exerciseSelectorCallback = null;
            const selectorModal = document.getElementById('exercise-selector-modal');
            if (selectorModal) selectorModal.classList.add('hidden');
            callback(newExercise.id);
            this.showToast(`¡Ejercicio "${name}" creado y añadido a tu sesión! 🔥`);
        } else {
            this.showToast(`¡Ejercicio "${name}" guardado en tu biblioteca! 🔥`);
        }
    },

    deleteCustomExercise(exerciseId) {
        const ex = window.StorageService.getExerciseById(exerciseId);
        const name = ex ? ex.name : 'este ejercicio';
        if (confirm(`¿Eliminar el ejercicio personalizado "${name}" de tu biblioteca?`)) {
            window.StorageService.deleteCustomExercise(exerciseId);
            this.renderExercisesCatalog();
            if (window.AnalyticsCharts) {
                window.AnalyticsCharts.populateExerciseSelect();
            }
            this.showToast(`Ejercicio "${name}" eliminado.`);
        }
    },

    // ===================================================================
    // CREADOR DE RUTINAS DESDE CERO
    // ===================================================================
    tempNewRoutineExercises: [],

    openCreateRoutineModal() {
        this.tempNewRoutineExercises = [];
        const modal = document.getElementById('create-routine-modal');
        const nameInput = document.getElementById('new-routine-name');
        const descInput = document.getElementById('new-routine-desc');
        if (nameInput) nameInput.value = '';
        if (descInput) descInput.value = '';
        this.renderNewRoutineExercisesList();
        if (modal) modal.classList.remove('hidden');
    },

    closeCreateRoutineModal() {
        const modal = document.getElementById('create-routine-modal');
        if (modal) modal.classList.add('hidden');
    },

    addNewExerciseToRoutineBuilder() {
        this.openExerciseSelectorModal((exerciseId) => {
            const ex = window.StorageService.getExerciseById(exerciseId);
            if (ex) {
                this.tempNewRoutineExercises.push({
                    exerciseId: ex.id,
                    name: ex.name,
                    sets: 3,
                    targetReps: '8 - 10',
                    targetWeightKg: 20,
                    restSeconds: ex.restTimeSeconds || 90
                });
                this.renderNewRoutineExercisesList();
            }
        });
    },

    renderNewRoutineExercisesList() {
        const container = document.getElementById('new-routine-exercises-list');
        if (!container) return;

        if (this.tempNewRoutineExercises.length === 0) {
            container.innerHTML = `
                <div class="empty-routine-builder">
                    <p>Aún no has añadido ejercicios a esta rutina.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.tempNewRoutineExercises.map((item, idx) => `
            <div class="routine-builder-item">
                <div class="item-title">
                    <strong>${idx + 1}. ${item.name}</strong>
                    <button class="btn-icon text-danger" onclick="App.removeExerciseFromRoutineBuilder(${idx})">×</button>
                </div>
                <div class="item-controls">
                    <label>Series: <input type="number" min="1" max="10" value="${item.sets}" onchange="App.tempNewRoutineExercises[${idx}].sets = parseInt(this.value, 10)" /></label>
                    <label>Reps: <input type="text" value="${item.targetReps}" onchange="App.tempNewRoutineExercises[${idx}].targetReps = this.value" /></label>
                    <label>Peso (kg): <input type="number" step="0.5" value="${item.targetWeightKg}" onchange="App.tempNewRoutineExercises[${idx}].targetWeightKg = parseFloat(this.value)" /></label>
                </div>
            </div>
        `).join('');
    },

    removeExerciseFromRoutineBuilder(index) {
        this.tempNewRoutineExercises.splice(index, 1);
        this.renderNewRoutineExercisesList();
    },

    saveNewRoutineFromBuilder() {
        const nameInput = document.getElementById('new-routine-name');
        const descInput = document.getElementById('new-routine-desc');
        const name = nameInput ? nameInput.value.trim() : '';

        if (!name) {
            alert('Por favor, introduce un nombre para la rutina.');
            return;
        }

        if (this.tempNewRoutineExercises.length === 0) {
            alert('Añade al menos un ejercicio a la rutina.');
            return;
        }

        const newRoutine = {
            id: 'custom_' + Date.now(),
            name: name,
            badge: 'Personalizada',
            level: 'A tu medida',
            description: descInput ? descInput.value.trim() : 'Rutina personalizada creada desde cero.',
            guidelines: ['Ajusta las cargas según tu progreso semanal.'],
            exercises: this.tempNewRoutineExercises
        };

        window.StorageService.saveCustomRoutine(newRoutine);
        this.closeCreateRoutineModal();
        this.renderRoutinesView();
        this.showToast('¡Rutina creada con éxito!');
    },

    deleteCustomRoutine(id) {
        if (confirm('¿Eliminar esta rutina personalizada?')) {
            window.StorageService.deleteCustomRoutine(id);
            this.renderRoutinesView();
            this.showToast('Rutina eliminada.');
        }
    },

    // ===================================================================
    // VISTA DE HISTORIAL
    // ===================================================================
    renderHistoryView() {
        const container = document.getElementById('history-list-container');
        if (!container || !window.StorageService) return;

        const history = window.StorageService.getWorkoutHistory();

        if (history.length === 0) {
            container.innerHTML = `
                <div class="empty-history-state">
                    <div class="empty-icon">📅</div>
                    <h3>Aún no tienes entrenamientos registrados</h3>
                    <p>Cuando finalices una sesión, aquí podrás consultar la fecha, el volumen levantado y los récords conseguidos.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = history.map(session => {
            const date = new Date(session.date);
            const dateFormatted = date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
            const mins = Math.floor((session.durationSeconds || 0) / 60);

            const exercisesSummary = (session.exercises || []).map(ex => {
                const completedSets = (ex.sets || []).filter(s => s.completed);
                const bestSet = completedSets.reduce((best, cur) => cur.weight > (best?.weight || 0) ? cur : best, null);
                return `
                    <div class="history-ex-item">
                        <span>${ex.name}</span>
                        <span class="history-ex-sets">${completedSets.length} series ${bestSet ? `(Mejor: ${bestSet.weight} kg × ${bestSet.reps})` : ''}</span>
                    </div>
                `;
            }).join('');

            return `
                <div class="history-card">
                    <div class="history-card-header">
                        <div>
                            <span class="history-date">${dateFormatted}</span>
                            <h3 class="history-title">${session.title}</h3>
                        </div>
                        <button class="btn-icon text-danger" title="Borrar sesión" onclick="App.deleteHistorySession('${session.id}')">
                            🗑️
                        </button>
                    </div>

                    <div class="history-stats-bar">
                        <span>⏱️ ${mins} min</span>
                        <span>🏋️ ${(session.totalVolume || 0).toLocaleString()} kg volumen</span>
                        <span>✅ ${session.completedSets || 0} series</span>
                    </div>

                    ${session.personalRecords && session.personalRecords.length > 0 ? `
                        <div class="history-prs-pill">
                            🏆 ${session.personalRecords.length} Récord(s) batido(s) en esta sesión
                        </div>
                    ` : ''}

                    <div class="history-exercises-box">
                        ${exercisesSummary}
                    </div>
                </div>
            `;
        }).join('');
    },

    deleteHistorySession(sessionId) {
        if (confirm('¿Deseas eliminar este registro de entrenamiento del historial?')) {
            window.StorageService.deleteWorkoutSession(sessionId);
            this.renderHistoryView();
            if (window.AnalyticsCharts) window.AnalyticsCharts.render();
            this.showToast('Entrenamiento eliminado del historial.');
        }
    },

    // ===================================================================
    // AJUSTES Y COPIAS DE SEGURIDAD
    // ===================================================================
    loadSettingsForm() {
        if (!window.StorageService) return;
        const settings = window.StorageService.getSettings();

        const autoTimer = document.getElementById('setting-auto-timer');
        const sound = document.getElementById('setting-sound');

        if (autoTimer) {
            autoTimer.checked = settings.autoStartTimer !== false;
            autoTimer.onchange = () => {
                settings.autoStartTimer = autoTimer.checked;
                window.StorageService.saveSettings(settings);
            };
        }

        if (sound) {
            sound.checked = settings.soundEnabled !== false;
            sound.onchange = () => {
                settings.soundEnabled = sound.checked;
                window.StorageService.saveSettings(settings);
            };
        }

        const weightInput = document.getElementById('setting-athlete-weight');
        if (weightInput && window.StorageService) {
            weightInput.value = window.StorageService.getUserWeight();
        }

        const currentNameEl = document.getElementById('settings-current-name');
        if (currentNameEl && window.StorageService) {
            currentNameEl.textContent = window.StorageService.getUserName() || 'Atleta Stetics';
        }
    },

    exportBackup() {
        const json = window.StorageService.exportBackupJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateStr = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `GymTrack_Backup_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('Copia de seguridad descargada.');
    },

    importBackup(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = window.StorageService.importBackupJSON(e.target.result);
            if (result.success) {
                this.renderRoutinesView();
                this.renderHistoryView();
                if (window.AnalyticsCharts) {
                    window.AnalyticsCharts.populateExerciseSelect();
                    window.AnalyticsCharts.render();
                }
                this.showToast('¡Copia de seguridad restaurada con éxito!');
            } else {
                alert('Error al restaurar el archivo: ' + result.error);
            }
        };
        reader.readAsText(file);
    }
};

window.App = App;
window.addEventListener('DOMContentLoaded', () => {
    App.init();
});
