// ===================================================================
// MOTOR DE PERSISTENCIA Y ANÁLISIS DE DATOS (GYMTRACK PRO)
// ===================================================================

const STORAGE_KEYS = {
    USER_NAME: 'stetics_athlete_name_v1',
    CUSTOM_EXERCISES: 'stetics_custom_exercises_v1',
    CUSTOM_ROUTINES: 'stetics_custom_routines_v1',
    WORKOUT_HISTORY: 'stetics_history_v1',
    ACTIVE_WORKOUT: 'stetics_active_workout_v1',
    SETTINGS: 'stetics_settings_v1',
    USER_WEIGHT: 'stetics_athlete_weight_v1'
};

const StorageService = {
    // Nombre del atleta
    getUserName() {
        return localStorage.getItem(STORAGE_KEYS.USER_NAME) || '';
    },

    saveUserName(name) {
        if (!name || !name.trim()) {
            localStorage.removeItem(STORAGE_KEYS.USER_NAME);
        } else {
            localStorage.setItem(STORAGE_KEYS.USER_NAME, name.trim());
        }
    },

    // Peso corporal del atleta (kg)
    getUserWeight() {
        const val = localStorage.getItem(STORAGE_KEYS.USER_WEIGHT);
        return val ? parseFloat(val) : 75;
    },

    saveUserWeight(weight) {
        const num = Math.max(35, Math.min(250, parseFloat(weight) || 75));
        localStorage.setItem(STORAGE_KEYS.USER_WEIGHT, num.toString());
        return num;
    },

    // Ajustes
    getSettings() {
        const defaultSettings = {
            weightUnit: 'kg',
            autoStartTimer: true,
            soundEnabled: true,
            defaultRestTime: 90
        };
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (e) {
            console.error('Error al leer ajustes:', e);
            return defaultSettings;
        }
    },

    saveSettings(settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    },

    // Ejercicios
    getCustomExercises() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    },

    getAllExercises() {
        const custom = this.getCustomExercises();
        return [...window.EXERCISES_DATABASE, ...custom];
    },

    getExerciseById(id) {
        return this.getAllExercises().find(ex => ex.id === id);
    },

    saveCustomExercise(exercise) {
        const custom = this.getCustomExercises();
        const existingIndex = custom.findIndex(e => e.id === exercise.id);
        if (existingIndex >= 0) {
            custom[existingIndex] = exercise;
        } else {
            custom.push(exercise);
        }
        localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(custom));
    },

    deleteCustomExercise(id) {
        let custom = this.getCustomExercises();
        custom = custom.filter(e => e.id !== id);
        localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(custom));
    },

    // Rutinas
    getCustomRoutines() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_ROUTINES);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    },

    getAllRoutines() {
        const custom = this.getCustomRoutines();
        return [...window.PRELOADED_ROUTINES, ...custom];
    },

    getRoutineById(id) {
        return this.getAllRoutines().find(r => r.id === id);
    },

    saveCustomRoutine(routine) {
        const custom = this.getCustomRoutines();
        const existingIndex = custom.findIndex(r => r.id === routine.id);
        if (existingIndex >= 0) {
            custom[existingIndex] = routine;
        } else {
            custom.push(routine);
        }
        localStorage.setItem(STORAGE_KEYS.CUSTOM_ROUTINES, JSON.stringify(custom));
    },

    deleteCustomRoutine(id) {
        let custom = this.getCustomRoutines();
        custom = custom.filter(r => r.id !== id);
        localStorage.setItem(STORAGE_KEYS.CUSTOM_ROUTINES, JSON.stringify(custom));
    },

    // Sesión de entrenamiento activa (para no perder datos si se refresca la página)
    getActiveWorkout() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    },

    saveActiveWorkout(workout) {
        if (!workout) {
            localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
        } else {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(workout));
        }
    },

    // Historial de entrenamientos completados
    getWorkoutHistory() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
            const history = saved ? JSON.parse(saved) : [];
            // Ordenar de más reciente a más antiguo
            return history.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (e) {
            return [];
        }
    },

    saveWorkoutSession(session) {
        const history = this.getWorkoutHistory();
        // Asignar ID si no lo tiene
        if (!session.id) {
            session.id = 'session_' + Date.now();
        }
        if (!session.date) {
            session.date = new Date().toISOString();
        }

        // Analizar y marcar PRs obtenidos en esta sesión
        session.personalRecords = this.detectSessionPRs(session);

        history.unshift(session);
        localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(history));
        this.saveActiveWorkout(null); // Limpiar sesión activa
        return session;
    },

    deleteWorkoutSession(sessionId) {
        let history = this.getWorkoutHistory();
        history = history.filter(s => s.id !== sessionId);
        localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(history));
    },

    // Detección de Récords Personales (PRs)
    detectSessionPRs(session) {
        const prList = [];
        const history = this.getWorkoutHistory().filter(s => s.id !== session.id);

        session.exercises.forEach(ex => {
            const exerciseId = ex.exerciseId;
            let currentBestWeight = 0;
            let currentBest1RM = 0;

            // Revisar marcas históricas anteriores
            history.forEach(pastSession => {
                const pastEx = pastSession.exercises.find(e => e.exerciseId === exerciseId);
                if (pastEx && pastEx.sets) {
                    pastEx.sets.forEach(s => {
                        if (s.completed && s.weight > 0 && s.reps > 0) {
                            if (s.weight > currentBestWeight) currentBestWeight = s.weight;
                            const oneRM = this.calculate1RM(s.weight, s.reps);
                            if (oneRM > currentBest1RM) currentBest1RM = oneRM;
                        }
                    });
                }
            });

            // Comprobar si en la sesión actual superó algo
            if (ex.sets) {
                ex.sets.forEach(s => {
                    if (s.completed && s.weight > 0 && s.reps > 0) {
                        const oneRM = this.calculate1RM(s.weight, s.reps);
                        if (currentBestWeight > 0 && s.weight > currentBestWeight) {
                            prList.push({
                                exerciseId,
                                exerciseName: ex.name,
                                type: 'Carga Máxima',
                                value: s.weight,
                                reps: s.reps,
                                previous: currentBestWeight
                            });
                            currentBestWeight = s.weight; // Actualizar para evitar duplicados en misma sesión
                        } else if (currentBest1RM > 0 && oneRM > currentBest1RM) {
                            prList.push({
                                exerciseId,
                                exerciseName: ex.name,
                                type: '1RM Estimado',
                                value: oneRM,
                                reps: s.reps,
                                previous: currentBest1RM
                            });
                            currentBest1RM = oneRM;
                        }
                    }
                });
            }
        });

        return prList;
    },

    // Cálculo de 1RM Estimado (Fórmula de Epley)
    // 1RM = Peso * (1 + Reps / 30)
    calculate1RM(weight, reps) {
        if (!weight || !reps || reps <= 0) return 0;
        if (reps === 1) return Math.round(weight * 10) / 10;
        const epley = weight * (1 + reps / 30);
        return Math.round(epley * 10) / 10;
    },

    // Obtener el historial completo de un ejercicio específico para gráficos de evolución
    getExerciseEvolution(exerciseId) {
        const history = this.getWorkoutHistory();
        // Filtrar y ordenar cronológicamente (más antiguo al más nuevo para la gráfica)
        const timeline = [];

        history.slice().reverse().forEach(session => {
            const exData = session.exercises.find(e => e.exerciseId === exerciseId);
            if (exData && exData.sets && exData.sets.length > 0) {
                const completedSets = exData.sets.filter(s => s.completed && s.reps > 0);
                if (completedSets.length > 0) {
                    let maxWeight = 0;
                    let best1RM = 0;
                    let totalVolume = 0;
                    let bestSet = null;

                    completedSets.forEach(s => {
                        const weight = parseFloat(s.weight) || 0;
                        const reps = parseInt(s.reps, 10) || 0;
                        const vol = weight * reps;
                        totalVolume += vol;

                        if (weight > maxWeight) {
                            maxWeight = weight;
                        }

                        const oneRM = this.calculate1RM(weight, reps);
                        if (oneRM > best1RM) {
                            best1RM = oneRM;
                            bestSet = { weight, reps };
                        }
                    });

                    timeline.push({
                        date: session.date,
                        sessionTitle: session.title || 'Entrenamiento',
                        maxWeight,
                        best1RM,
                        totalVolume,
                        setsCount: completedSets.length,
                        bestSet
                    });
                }
            }
        });

        return timeline;
    },

    // Obtener la última vez que se hizo un ejercicio (para sobrecarga progresiva)
    getLastPerformance(exerciseId) {
        const history = this.getWorkoutHistory();
        for (const session of history) {
            const exData = session.exercises.find(e => e.exerciseId === exerciseId);
            if (exData && exData.sets && exData.sets.some(s => s.completed)) {
                return {
                    date: session.date,
                    sets: exData.sets.filter(s => s.completed)
                };
            }
        }
        return null;
    },

    // Exportación e Importación de datos (Backup JSON)
    exportBackupJSON() {
        const data = {
            version: 1,
            exportDate: new Date().toISOString(),
            settings: this.getSettings(),
            customExercises: this.getCustomExercises(),
            customRoutines: this.getCustomRoutines(),
            workoutHistory: this.getWorkoutHistory()
        };
        return JSON.stringify(data, null, 2);
    },

    importBackupJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
            if (data.customExercises) localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(data.customExercises));
            if (data.customRoutines) localStorage.setItem(STORAGE_KEYS.CUSTOM_ROUTINES, JSON.stringify(data.customRoutines));
            if (data.workoutHistory) localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(data.workoutHistory));
            return { success: true };
        } catch (e) {
            console.error('Error al importar backup:', e);
            return { success: false, error: e.message };
        }
    },

    // Cargar datos de demostración para ver gráficos y evolución al instante
    loadDemoData() {
        const now = new Date();
        const demoSessions = [
            {
                id: 'demo_1',
                title: 'Full Body Principiantes - Semana 1',
                date: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString(),
                durationSeconds: 3120,
                exercises: [
                    {
                        exerciseId: 'sentadilla_trasera',
                        name: 'Sentadilla con Barra (Back Squat)',
                        category: 'piernas',
                        sets: [
                            { type: 'normal', weight: 40, reps: 10, completed: true },
                            { type: 'normal', weight: 40, reps: 10, completed: true },
                            { type: 'normal', weight: 40, reps: 9, completed: true }
                        ]
                    },
                    {
                        exerciseId: 'press_banca_plano',
                        name: 'Press de Banca Plano con Barra',
                        category: 'pecho',
                        sets: [
                            { type: 'normal', weight: 45, reps: 8, completed: true },
                            { type: 'normal', weight: 45, reps: 8, completed: true },
                            { type: 'normal', weight: 45, reps: 7, completed: true }
                        ]
                    },
                    {
                        exerciseId: 'jalon_al_pecho',
                        name: 'Jalón al Pecho en Polea (Lat Pulldown)',
                        category: 'espalda',
                        sets: [
                            { type: 'normal', weight: 40, reps: 10, completed: true },
                            { type: 'normal', weight: 40, reps: 10, completed: true }
                        ]
                    }
                ]
            },
            {
                id: 'demo_2',
                title: 'Full Body Principiantes - Semana 2',
                date: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString(),
                durationSeconds: 3240,
                exercises: [
                    {
                        exerciseId: 'sentadilla_trasera',
                        name: 'Sentadilla con Barra (Back Squat)',
                        category: 'piernas',
                        sets: [
                            { type: 'normal', weight: 45, reps: 10, completed: true },
                            { type: 'normal', weight: 45, reps: 10, completed: true },
                            { type: 'normal', weight: 45, reps: 10, completed: true }
                        ]
                    },
                    {
                        exerciseId: 'press_banca_plano',
                        name: 'Press de Banca Plano con Barra',
                        category: 'pecho',
                        sets: [
                            { type: 'normal', weight: 50, reps: 8, completed: true },
                            { type: 'normal', weight: 50, reps: 8, completed: true },
                            { type: 'normal', weight: 50, reps: 8, completed: true }
                        ]
                    },
                    {
                        exerciseId: 'jalon_al_pecho',
                        name: 'Jalón al Pecho en Polea (Lat Pulldown)',
                        category: 'espalda',
                        sets: [
                            { type: 'normal', weight: 45, reps: 10, completed: true },
                            { type: 'normal', weight: 45, reps: 10, completed: true }
                        ]
                    }
                ]
            },
            {
                id: 'demo_3',
                title: 'Full Body Principiantes - Semana 3',
                date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                durationSeconds: 3400,
                exercises: [
                    {
                        exerciseId: 'sentadilla_trasera',
                        name: 'Sentadilla con Barra (Back Squat)',
                        category: 'piernas',
                        sets: [
                            { type: 'normal', weight: 50, reps: 8, completed: true },
                            { type: 'normal', weight: 50, reps: 8, completed: true },
                            { type: 'normal', weight: 50, reps: 8, completed: true }
                        ]
                    },
                    {
                        exerciseId: 'press_banca_plano',
                        name: 'Press de Banca Plano con Barra',
                        category: 'pecho',
                        sets: [
                            { type: 'normal', weight: 55, reps: 7, completed: true },
                            { type: 'normal', weight: 55, reps: 7, completed: true },
                            { type: 'normal', weight: 55, reps: 6, completed: true }
                        ]
                    },
                    {
                        exerciseId: 'jalon_al_pecho',
                        name: 'Jalón al Pecho en Polea (Lat Pulldown)',
                        category: 'espalda',
                        sets: [
                            { type: 'normal', weight: 50, reps: 10, completed: true },
                            { type: 'normal', weight: 50, reps: 9, completed: true }
                        ]
                    }
                ]
            },
            {
                id: 'demo_4',
                title: 'Full Body Principiantes - Semana 4 (¡Sobrecarga Progresiva!)',
                date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                durationSeconds: 3500,
                exercises: [
                    {
                        exerciseId: 'sentadilla_trasera',
                        name: 'Sentadilla con Barra (Back Squat)',
                        category: 'piernas',
                        sets: [
                            { type: 'normal', weight: 55, reps: 8, completed: true },
                            { type: 'normal', weight: 55, reps: 8, completed: true },
                            { type: 'normal', weight: 55, reps: 8, completed: true }
                        ]
                    },
                    {
                        exerciseId: 'press_banca_plano',
                        name: 'Press de Banca Plano con Barra',
                        category: 'pecho',
                        sets: [
                            { type: 'normal', weight: 60, reps: 6, completed: true },
                            { type: 'normal', weight: 60, reps: 6, completed: true },
                            { type: 'normal', weight: 60, reps: 6, completed: true }
                        ]
                    },
                    {
                        exerciseId: 'jalon_al_pecho',
                        name: 'Jalón al Pecho en Polea (Lat Pulldown)',
                        category: 'espalda',
                        sets: [
                            { type: 'normal', weight: 55, reps: 8, completed: true },
                            { type: 'normal', weight: 55, reps: 8, completed: true }
                        ]
                    }
                ]
            }
        ];

        localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(demoSessions));
    }
};

window.StorageService = StorageService;
