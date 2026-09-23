// ===================================================================
// MOTOR DE ENTRENAMIENTO ACTIVO Y SERIES (GYMTRACK PRO)
// ===================================================================

const WorkoutTracker = {
    activeSession: null,
    durationTimerId: null,

    init() {
        this.cacheDOMElements();
        this.bindEvents();
        this.restoreActiveSession();
    },

    cacheDOMElements() {
        this.workoutView = document.getElementById('view-workout');
        this.workoutTitle = document.getElementById('workout-session-title');
        this.workoutDuration = document.getElementById('workout-session-timer');
        this.exercisesContainer = document.getElementById('workout-exercises-list');
        this.finishWorkoutBtn = document.getElementById('btn-finish-workout');
        this.discardWorkoutBtn = document.getElementById('btn-discard-workout');
        this.addExerciseBtn = document.getElementById('btn-add-exercise-to-workout');
        this.totalVolumeBadge = document.getElementById('workout-total-volume');
        this.totalSetsBadge = document.getElementById('workout-total-sets');
    },

    bindEvents() {
        if (this.finishWorkoutBtn) {
            this.finishWorkoutBtn.addEventListener('click', () => this.finishWorkout());
        }
        if (this.discardWorkoutBtn) {
            this.discardWorkoutBtn.addEventListener('click', () => this.discardWorkout());
        }
        if (this.addExerciseBtn) {
            this.addExerciseBtn.addEventListener('click', () => {
                if (window.App) window.App.openExerciseSelectorModal((exerciseId) => {
                    this.addExerciseToWorkout(exerciseId);
                });
            });
        }
    },

    // Iniciar entrenamiento desde una rutina o en blanco
    startWorkout(routineOrNull = null) {
        if (this.activeSession) {
            if (!confirm('Ya tienes un entrenamiento en curso. ¿Deseas descartarlo y comenzar este nuevo?')) {
                return;
            }
            this.stopDurationTimer();
        }

        const now = new Date();
        if (routineOrNull) {
            this.activeSession = {
                id: 'session_' + Date.now(),
                title: routineOrNull.name.replace(/^[^\w\s]+/, '').trim(), // Limpiar emojis del título si se desea
                startTime: now.toISOString(),
                durationSeconds: 0,
                exercises: routineOrNull.exercises.map(item => {
                    const dbEx = window.StorageService.getExerciseById(item.exerciseId);
                    const lastPerf = window.StorageService.getLastPerformance(item.exerciseId);
                    
                    const sets = [];
                    const numSets = item.sets || 3;
                    for (let i = 0; i < numSets; i++) {
                        const previousSet = (lastPerf && lastPerf.sets && lastPerf.sets[i]) ? lastPerf.sets[i] : null;
                        sets.push({
                            id: 'set_' + Date.now() + '_' + i,
                            type: 'normal',
                            weight: (previousSet ? previousSet.weight : item.targetWeightKg) || 0,
                            reps: (previousSet ? previousSet.reps : parseInt(item.targetReps, 10)) || 10,
                            completed: false,
                            previous: previousSet ? `${previousSet.weight}kg × ${previousSet.reps}` : '-'
                        });
                    }

                    return {
                        exerciseId: item.exerciseId,
                        name: dbEx ? dbEx.name : 'Ejercicio',
                        category: dbEx ? dbEx.category : 'pecho',
                        restSeconds: item.restSeconds || (dbEx ? dbEx.restTimeSeconds : 90),
                        notes: '',
                        sets
                    };
                })
            };
        } else {
            // Entrenamiento Libre
            this.activeSession = {
                id: 'session_' + Date.now(),
                title: 'Entrenamiento Libre',
                startTime: now.toISOString(),
                durationSeconds: 0,
                exercises: []
            };
        }

        this.startDurationTimer();
        this.saveState();
        this.render();

        if (window.App) {
            window.App.switchView('workout');
            window.App.showToast('¡Entrenamiento iniciado! Dale con todo 💪');
        }
    },

    restoreActiveSession() {
        const saved = window.StorageService ? window.StorageService.getActiveWorkout() : null;
        if (saved) {
            this.activeSession = saved;
            // Calcular segundos transcurridos
            const start = new Date(saved.startTime).getTime();
            const now = Date.now();
            const elapsed = Math.floor((now - start) / 1000);
            this.activeSession.durationSeconds = Math.max(elapsed, saved.durationSeconds || 0);

            this.startDurationTimer();
            this.render();
        }
    },

    startDurationTimer() {
        this.stopDurationTimer();
        this.durationTimerId = setInterval(() => {
            if (this.activeSession) {
                this.activeSession.durationSeconds = (this.activeSession.durationSeconds || 0) + 1;
                this.updateDurationDisplay();
                // Guardar periódicamente cada 15 segundos
                if (this.activeSession.durationSeconds % 15 === 0) {
                    this.saveState();
                }
            }
        }, 1000);
    },

    stopDurationTimer() {
        if (this.durationTimerId) {
            clearInterval(this.durationTimerId);
            this.durationTimerId = null;
        }
    },

    updateDurationDisplay() {
        if (!this.workoutDuration || !this.activeSession) return;
        const total = this.activeSession.durationSeconds || 0;
        const mins = Math.floor(total / 60);
        const secs = total % 60;
        this.workoutDuration.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    saveState() {
        if (window.StorageService) {
            window.StorageService.saveActiveWorkout(this.activeSession);
        }
    },

    addExerciseToWorkout(exerciseId) {
        if (!this.activeSession) {
            this.startWorkout(null);
        }

        const dbEx = window.StorageService.getExerciseById(exerciseId);
        if (!dbEx) return;

        const lastPerf = window.StorageService.getLastPerformance(exerciseId);
        const sets = [];
        for (let i = 0; i < 3; i++) {
            const previousSet = (lastPerf && lastPerf.sets && lastPerf.sets[i]) ? lastPerf.sets[i] : null;
            sets.push({
                id: 'set_' + Date.now() + '_' + i,
                type: 'normal',
                weight: previousSet ? previousSet.weight : 20,
                reps: previousSet ? previousSet.reps : 10,
                completed: false,
                previous: previousSet ? `${previousSet.weight}kg × ${previousSet.reps}` : '-'
            });
        }

        this.activeSession.exercises.push({
            exerciseId,
            name: dbEx.name,
            category: dbEx.category,
            restSeconds: dbEx.restTimeSeconds || 90,
            notes: '',
            sets
        });

        this.saveState();
        this.render();
        if (window.App) {
            window.App.showToast(`Añadido: ${dbEx.name}`);
        }
    },

    removeExercise(exerciseIndex) {
        if (!confirm('¿Eliminar este ejercicio del entrenamiento?')) return;
        this.activeSession.exercises.splice(exerciseIndex, 1);
        this.saveState();
        this.render();
    },

    addSet(exerciseIndex) {
        const ex = this.activeSession.exercises[exerciseIndex];
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet = {
            id: 'set_' + Date.now(),
            type: 'normal',
            weight: lastSet ? lastSet.weight : 20,
            reps: lastSet ? lastSet.reps : 10,
            completed: false,
            previous: '-'
        };
        ex.sets.push(newSet);
        this.saveState();
        this.render();
    },

    removeSet(exerciseIndex, setIndex) {
        const ex = this.activeSession.exercises[exerciseIndex];
        if (ex.sets.length <= 1) {
            this.removeExercise(exerciseIndex);
            return;
        }
        ex.sets.splice(setIndex, 1);
        this.saveState();
        this.render();
    },

    toggleSetComplete(exerciseIndex, setIndex) {
        const ex = this.activeSession.exercises[exerciseIndex];
        const set = ex.sets[setIndex];
        set.completed = !set.completed;

        if (set.completed) {
            // Verificar si es PR
            const weight = parseFloat(set.weight) || 0;
            const reps = parseInt(set.reps, 10) || 0;

            // Iniciar temporizador automáticamente si está activado
            const settings = window.StorageService ? window.StorageService.getSettings() : { autoStartTimer: true };
            if (settings.autoStartTimer && window.RestTimer) {
                window.RestTimer.setAndStart(ex.restSeconds || 90);
            }

            // Reproducir sonido sutil de confirmación
            if (window.RestTimer) {
                window.RestTimer.playTone(523.25, 0.1, 'sine'); // Do5
            }
        }

        this.saveState();
        this.render();
    },

    updateSetField(exerciseIndex, setIndex, field, value) {
        const set = this.activeSession.exercises[exerciseIndex].sets[setIndex];
        if (field === 'weight') {
            set.weight = parseFloat(value) || 0;
        } else if (field === 'reps') {
            set.reps = parseInt(value, 10) || 0;
        } else if (field === 'type') {
            set.type = value;
        }
        this.saveState();
        this.updateSummaryBadges();
    },

    updateExerciseNotes(exerciseIndex, notes) {
        this.activeSession.exercises[exerciseIndex].notes = notes;
        this.saveState();
    },

    updateSummaryBadges() {
        if (!this.activeSession) return;
        let totalVol = 0;
        let completedSetsCount = 0;

        this.activeSession.exercises.forEach(ex => {
            ex.sets.forEach(s => {
                if (s.completed) {
                    completedSetsCount++;
                    totalVol += (parseFloat(s.weight) || 0) * (parseInt(s.reps, 10) || 0);
                }
            });
        });

        if (this.totalVolumeBadge) {
            this.totalVolumeBadge.textContent = `${totalVol.toLocaleString()} kg`;
        }
        if (this.totalSetsBadge) {
            this.totalSetsBadge.textContent = `${completedSetsCount} series completadas`;
        }
    },

    finishWorkout() {
        if (!this.activeSession) return;

        let totalSets = 0;
        let completedSets = 0;
        let totalVol = 0;

        this.activeSession.exercises.forEach(ex => {
            ex.sets.forEach(s => {
                totalSets++;
                if (s.completed) {
                    completedSets++;
                    totalVol += (parseFloat(s.weight) || 0) * (parseInt(s.reps, 10) || 0);
                }
            });
        });

        if (completedSets === 0) {
            if (!confirm('No has marcado ninguna serie como completada (✓). ¿Deseas finalizar el entrenamiento igualmente?')) {
                return;
            }
        }

        this.stopDurationTimer();
        this.activeSession.endTime = new Date().toISOString();
        this.activeSession.totalVolume = totalVol;
        this.activeSession.completedSets = completedSets;

        const oldOverallLevel = (window.RankingService && window.RankingService.getOverallRank) 
            ? window.RankingService.getOverallRank().overallRank.level 
            : 1;

        const savedSession = window.StorageService.saveWorkoutSession(this.activeSession);
        const unlockedPRs = savedSession.personalRecords || [];

        // Mostrar resumen modal de finalización
        this.showWorkoutSummaryModal(savedSession, unlockedPRs);

        this.activeSession = null;
        this.render();

        // Actualizar vistas de estadísticas, rangos y de historial
        if (window.RankingService) {
            window.RankingService.checkSessionRankUp(oldOverallLevel);
            window.RankingService.updateHeaderBadge();
        }
        if (window.AnalyticsCharts) window.AnalyticsCharts.render();
        if (window.App) window.App.renderHistoryView();
    },

    discardWorkout() {
        if (!this.activeSession) return;
        if (confirm('¿Estás seguro de que quieres descartar este entrenamiento? Todos los registros de la sesión se perderán.')) {
            this.stopDurationTimer();
            this.activeSession = null;
            if (window.StorageService) {
                window.StorageService.saveActiveWorkout(null);
            }
            this.render();
            if (window.App) {
                window.App.switchView('routines');
                window.App.showToast('Entrenamiento descartado.');
            }
        }
    },

    showWorkoutSummaryModal(session, prs) {
        const modal = document.getElementById('workout-summary-modal');
        const modalContent = document.getElementById('workout-summary-content');
        if (!modal || !modalContent) return;

        const mins = Math.floor((session.durationSeconds || 0) / 60);

        let prsHtml = '';
        if (prs && prs.length > 0) {
            prsHtml = `
                <div class="summary-prs-box">
                    <h4>🏆 ¡Nuevos Récords Personales Desbloqueados!</h4>
                    <div class="prs-list">
                        ${prs.map(pr => `
                            <div class="pr-badge-item">
                                <span class="pr-name">${pr.exerciseName}</span>
                                <span class="pr-val"><strong>${pr.value} kg</strong> (${pr.type})</span>
                                <span class="pr-prev">Superó los ${pr.previous} kg</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        modalContent.innerHTML = `
            <div class="summary-header-icon">🎉</div>
            <h2>¡Entrenamiento Completado!</h2>
            <p class="summary-sub">${session.title} - ${new Date(session.date).toLocaleDateString()}</p>
            
            <div class="summary-stats-grid">
                <div class="summary-stat">
                    <span class="icon">⏱️</span>
                    <span class="val">${mins} min</span>
                    <span class="lbl">Duración</span>
                </div>
                <div class="summary-stat">
                    <span class="icon">🏋️</span>
                    <span class="val">${(session.totalVolume || 0).toLocaleString()} kg</span>
                    <span class="lbl">Volumen Total</span>
                </div>
                <div class="summary-stat">
                    <span class="icon">✅</span>
                    <span class="val">${session.completedSets || 0}</span>
                    <span class="lbl">Series Hechas</span>
                </div>
            </div>

            ${prsHtml}

            <div class="summary-actions">
                <button class="btn btn-primary btn-block" id="btn-close-summary">
                    Continuar al Historial
                </button>
            </div>
        `;

        modal.classList.remove('hidden');

        const closeBtn = document.getElementById('btn-close-summary');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
                if (window.App) window.App.switchView('history');
            });
        }
    },

    render() {
        if (!this.exercisesContainer) return;

        if (!this.activeSession) {
            // Estado vacío: Sin entrenamiento activo
            if (this.workoutView) this.workoutView.classList.add('no-active-workout');
            this.exercisesContainer.innerHTML = `
                <div class="no-workout-state">
                    <div class="empty-icon">💪</div>
                    <h2>No hay ningún entrenamiento activo</h2>
                    <p>Elige una rutina recomendada para ti y tus amigos, o inicia una sesión libre desde cero.</p>
                    <div class="empty-actions">
                        <button class="btn btn-primary" onclick="App.switchView('routines')">
                            Ver Rutinas Disponibles
                        </button>
                        <button class="btn btn-secondary" onclick="WorkoutTracker.startWorkout(null)">
                            + Iniciar Entrenamiento Libre
                        </button>
                    </div>
                </div>
            `;
            if (this.workoutTitle) this.workoutTitle.textContent = 'Entrenamiento';
            if (this.workoutDuration) this.workoutDuration.textContent = '00:00';
            if (this.totalVolumeBadge) this.totalVolumeBadge.textContent = '0 kg';
            if (this.totalSetsBadge) this.totalSetsBadge.textContent = '0 series';
            return;
        }

        if (this.workoutView) this.workoutView.classList.remove('no-active-workout');
        if (this.workoutTitle) this.workoutTitle.textContent = this.activeSession.title;
        this.updateDurationDisplay();
        this.updateSummaryBadges();

        if (this.activeSession.exercises.length === 0) {
            this.exercisesContainer.innerHTML = `
                <div class="empty-exercise-box">
                    <p>Aún no has añadido ejercicios a este entrenamiento.</p>
                    <button class="btn btn-primary" onclick="App.openExerciseSelectorModal(id => WorkoutTracker.addExerciseToWorkout(id))">
                        + Añadir Ejercicio
                    </button>
                </div>
            `;
            return;
        }

        this.exercisesContainer.innerHTML = this.activeSession.exercises.map((ex, exIdx) => {
            const dbEx = window.StorageService.getExerciseById(ex.exerciseId);
            const category = dbEx ? dbEx.category : 'pecho';
            const svgIllustration = window.getExerciseSvg ? window.getExerciseSvg(category, ex.exerciseId) : '';
            const lastPerf = window.StorageService.getLastPerformance(ex.exerciseId);

            return `
                <div class="exercise-card-workout" data-exercise-index="${exIdx}">
                    <div class="exercise-card-header">
                        <div class="exercise-card-media">
                            ${svgIllustration}
                        </div>
                        <div class="exercise-card-info">
                            <span class="exercise-cat-tag cat-${category}">${(dbEx ? dbEx.category : '').toUpperCase()}</span>
                            <h3 class="exercise-card-title">${ex.name}</h3>
                            <div class="exercise-cues">
                                <span class="cue-pill">⏱️ ${ex.restSeconds || 90}s descanso</span>
                                ${lastPerf ? `<span class="cue-pill last-perf">Última vez: ${lastPerf.sets[0] ? `${lastPerf.sets[0].weight}kg × ${lastPerf.sets[0].reps}` : 'Registrada'}</span>` : '<span class="cue-pill">Nuevo ejercicio</span>'}
                            </div>
                        </div>
                        <div class="exercise-card-actions">
                            <button class="btn-icon" title="Ver guía de técnica" onclick="App.showExerciseGuide('${ex.exerciseId}')">
                                ℹ️
                            </button>
                            <button class="btn-icon text-danger" title="Eliminar ejercicio" onclick="WorkoutTracker.removeExercise(${exIdx})">
                                🗑️
                            </button>
                        </div>
                    </div>

                    <!-- Tabla de series -->
                    <div class="sets-table-container">
                        <table class="sets-table">
                            <thead>
                                <tr>
                                    <th style="width: 45px;">SERIE</th>
                                    <th>ANTERIOR</th>
                                    <th style="width: 85px;">KG</th>
                                    <th style="width: 80px;">REPS</th>
                                    <th style="width: 48px; text-align: center;">✓</th>
                                    <th style="width: 32px;"></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${ex.sets.map((set, sIdx) => {
                                    const oneRM = (set.weight > 0 && set.reps > 0) ? window.StorageService.calculate1RM(set.weight, set.reps) : null;
                                    return `
                                        <tr class="set-row ${set.completed ? 'set-completed' : ''}">
                                            <td class="set-index-cell">
                                                <select class="set-type-select" onchange="WorkoutTracker.updateSetField(${exIdx}, ${sIdx}, 'type', this.value)">
                                                    <option value="normal" ${set.type === 'normal' ? 'selected' : ''}>${sIdx + 1}</option>
                                                    <option value="warmup" ${set.type === 'warmup' ? 'selected' : ''}>W</option>
                                                    <option value="drop" ${set.type === 'drop' ? 'selected' : ''}>D</option>
                                                    <option value="failure" ${set.type === 'failure' ? 'selected' : ''}>F</option>
                                                </select>
                                            </td>
                                            <td class="set-prev-cell">${set.previous || '-'}</td>
                                            <td>
                                                <input type="number" step="0.5" class="set-input set-weight-input" value="${set.weight}" 
                                                    onchange="WorkoutTracker.updateSetField(${exIdx}, ${sIdx}, 'weight', this.value)"
                                                    onfocus="this.select()"
                                                />
                                            </td>
                                            <td>
                                                <input type="number" step="1" class="set-input set-reps-input" value="${set.reps}" 
                                                    onchange="WorkoutTracker.updateSetField(${exIdx}, ${sIdx}, 'reps', this.value)"
                                                    onfocus="this.select()"
                                                />
                                            </td>
                                            <td style="text-align: center;">
                                                <button class="btn-check-set ${set.completed ? 'completed' : ''}" 
                                                    onclick="WorkoutTracker.toggleSetComplete(${exIdx}, ${sIdx})"
                                                    title="${set.completed ? 'Marcar incompleta' : 'Marcar completada'}">
                                                    ✓
                                                </button>
                                            </td>
                                            <td>
                                                <button class="btn-delete-set" onclick="WorkoutTracker.removeSet(${exIdx}, ${sIdx})" title="Quitar serie">×</button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- Pie del ejercicio: Botón añadir serie y notas -->
                    <div class="exercise-card-footer">
                        <button class="btn btn-secondary btn-sm" onclick="WorkoutTracker.addSet(${exIdx})">
                            + Añadir Serie
                        </button>
                        <div class="exercise-1rm-hint">
                            ${ex.sets.some(s => s.completed) ? `1RM Estimado: <strong>${Math.max(...ex.sets.filter(s => s.completed).map(s => window.StorageService.calculate1RM(s.weight, s.reps)))} kg</strong>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
};

window.WorkoutTracker = WorkoutTracker;
