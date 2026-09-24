// ===================================================================
// MOTOR DE RANGOS GAMIFICADOS Y SILUETA ANATÓMICA (STETICS ERA)
// ===================================================================

const RANKS_LADDER = [
    {
        id: 'iron',
        name: 'Hierro',
        icon: '⛓️',
        color: '#64748b',
        glow: 'rgba(100, 116, 139, 0.45)',
        level: 1,
        title: 'Iniciado en el Templo',
        desc: 'Aprendizaje de la barra vacía y primera disciplina.'
    },
    {
        id: 'bronze',
        name: 'Bronce',
        icon: '🥉',
        color: '#cd7f32',
        glow: 'rgba(205, 127, 50, 0.6)',
        level: 2,
        title: 'Guerrero de Bronce',
        desc: 'Primeras adaptaciones neuromusculares y consistencia.'
    },
    {
        id: 'silver',
        name: 'Plata',
        icon: '🥈',
        color: '#cbd5e1',
        glow: 'rgba(203, 213, 225, 0.7)',
        level: 3,
        title: 'Atleta de Plata',
        desc: 'Técnica pulida, sobrecarga real y estética visible.'
    },
    {
        id: 'gold',
        name: 'Oro',
        icon: '🥇',
        color: '#fbbf24',
        glow: 'rgba(251, 191, 36, 0.8)',
        level: 4,
        title: 'Campeón Dorado',
        desc: 'Físico atlético notable y marcas de fuerza respetables.'
    },
    {
        id: 'ruby',
        name: 'Rubí',
        icon: '🔴',
        color: '#f43f5e',
        glow: 'rgba(244, 63, 94, 0.85)',
        level: 5,
        title: 'Fuerza Rubí',
        desc: 'El gran salto estético: congestión, vascularidad y pesas serias.'
    },
    {
        id: 'platinum',
        name: 'Platino',
        icon: '💠',
        color: '#38bdf8',
        glow: 'rgba(56, 189, 248, 0.9)',
        level: 6,
        title: 'Titán de Platino',
        desc: 'Nivel avanzado superior con una densidad muscular sobresaliente.'
    },
    {
        id: 'diamond',
        name: 'Diamante',
        icon: '💎',
        color: '#a855f7',
        glow: 'rgba(168, 85, 247, 0.95)',
        level: 7,
        title: 'Élite Diamante',
        desc: 'Físico cercano al potencial genético natural máximo.'
    },
    {
        id: 'emerald',
        name: 'Esmeralda',
        icon: '❇️',
        color: '#10b981',
        glow: 'rgba(16, 185, 129, 1)',
        level: 8,
        title: 'Apex Aesthetic (David Laid Era)',
        desc: 'Rango mitológico supremo. Proporciones y fuerza sobrehumanas.'
    }
];

// Ratios de fuerza (1RM / Peso Corporal) para los 8 rangos
// [Hierro, Bronce, Plata, Oro, Rubí, Platino, Diamante, Esmeralda]
const MUSCLE_STANDARDS = {
    pecho: {
        name: 'Pecho / Pectorales',
        icon: '🛡️',
        exercisesRef: 'Press de Banca Plano, Inclinado, Fondos',
        ratios: [0, 0.55, 0.75, 1.0, 1.25, 1.45, 1.65, 1.85],
        tips: 'Para subir de rango, prioriza la retracción escapular y empujar con las piernas firmes (leg drive).'
    },
    espalda: {
        name: 'Espalda / Dorsales',
        icon: '🦅',
        exercisesRef: 'Dominadas, Jalón al Pecho, Remo con Barra',
        ratios: [0, 0.6, 0.8, 1.05, 1.3, 1.55, 1.75, 2.0],
        tips: 'Tira con los codos y aprieta las escápulas en cada repetición para ensanchar el V-Taper.'
    },
    piernas: {
        name: 'Piernas / Cuádriceps',
        icon: '⚡',
        exercisesRef: 'Sentadilla, Prensa, Peso Muerto Rumano',
        ratios: [0, 0.7, 0.95, 1.3, 1.65, 1.95, 2.25, 2.55],
        tips: 'Rompe el paralelo en sentadilla con control y pies bien atornillados al suelo.'
    },
    hombros: {
        name: 'Hombros / Deltoides',
        icon: '🎯',
        exercisesRef: 'Press Militar, Press con Mancuernas, Laterales',
        ratios: [0, 0.35, 0.5, 0.65, 0.8, 0.95, 1.1, 1.25],
        tips: 'Mantén el abdomen contraído en el press y busca tensión continua en las elevaciones laterales.'
    },
    biceps: {
        name: 'Bíceps',
        icon: '💪',
        exercisesRef: 'Curl con Barra, Curl Mancuernas, Curl Martillo',
        ratios: [0, 0.25, 0.35, 0.45, 0.58, 0.7, 0.82, 0.95],
        tips: 'Supina la muñeca al final del curl y no uses balanceo con la espalda lumbar.'
    },
    triceps: {
        name: 'Tríceps',
        icon: '🔱',
        exercisesRef: 'Fondos en Paralelas, Press Francés, Polea Tríceps',
        ratios: [0, 0.3, 0.42, 0.55, 0.7, 0.85, 1.0, 1.15],
        tips: 'Bloquea los codos al costado del cuerpo para aislar la cabeza lateral y larga del tríceps.'
    },
    core: {
        name: 'Abdomen / Core',
        icon: '⚓',
        exercisesRef: 'Elevaciones de Piernas, Crunch Polea, Planchas',
        ratios: [0, 0.3, 0.5, 0.7, 0.9, 1.1, 1.3, 1.5], // O volumen escalado
        tips: 'Exhala todo el aire en la contracción abdominal máxima para reclutar el transverso profundo.'
    }
};

const RankingService = {
    currentViewMode: 'front', // 'front' | 'back'

    // Obtener peso corporal del usuario (por defecto 75 kg)
    getAthleteWeight() {
        if (window.StorageService && typeof window.StorageService.getUserWeight === 'function') {
            return window.StorageService.getUserWeight();
        }
        const saved = localStorage.getItem('stetics_athlete_weight_v1');
        return saved ? parseFloat(saved) : 75;
    },

    saveAthleteWeight(weight) {
        const val = Math.max(35, Math.min(250, parseFloat(weight) || 75));
        localStorage.setItem('stetics_athlete_weight_v1', val.toString());
        return val;
    },

    // Buscar el mejor 1RM histórico de un grupo muscular
    getBestRecordForMuscle(muscleKey) {
        const history = window.StorageService ? window.StorageService.getWorkoutHistory() : [];
        const allExercises = window.StorageService ? window.StorageService.getAllExercises() : (window.EXERCISES_DATABASE || []);
        
        // Mapear categorías si es bíceps / tríceps
        const targetCategories = (muscleKey === 'biceps' || muscleKey === 'triceps')
            ? [muscleKey]
            : [muscleKey];

        let best1RM = 0;
        let bestExName = '';
        let bestWeight = 0;
        let bestReps = 0;

        history.forEach(session => {
            if (!session.exercises) return;
            session.exercises.forEach(exItem => {
                const exMeta = allExercises.find(e => e.id === exItem.exerciseId);
                const category = exMeta ? exMeta.category : '';

                let matches = targetCategories.includes(category);
                if (!matches && muscleKey === 'piernas' && (category === 'pierna' || category === 'piernas')) matches = true;

                if (matches && exItem.sets) {
                    exItem.sets.forEach(set => {
                        if (set.completed && set.weight > 0 && set.reps > 0) {
                            // Epley formula: 1RM = weight * (1 + reps/30)
                            const estimated1RM = set.reps === 1 ? set.weight : set.weight * (1 + set.reps / 30);
                            if (estimated1RM > best1RM) {
                                best1RM = estimated1RM;
                                bestExName = exItem.exerciseName || (exMeta ? exMeta.name : 'Ejercicio');
                                bestWeight = set.weight;
                                bestReps = set.reps;
                            }
                        }
                    });
                }
            });
        });

        return {
            best1RM: Math.round(best1RM * 10) / 10,
            bestExName: bestExName || 'Sin registros aún',
            bestWeight,
            bestReps
        };
    },

    // Calcular estadísticas y rango de un músculo específico
    getMuscleRankStats(muscleKey) {
        const standard = MUSCLE_STANDARDS[muscleKey] || MUSCLE_STANDARDS.pecho;
        const bw = this.getAthleteWeight();
        const record = this.getBestRecordForMuscle(muscleKey);
        const actual1RM = record.best1RM;

        // Calcular umbrales en kg para el peso actual del atleta
        const kgThresholds = standard.ratios.map(r => Math.round(r * bw * 10) / 10);

        let rankIndex = 0; // Por defecto Hierro (index 0)
        for (let i = RANKS_LADDER.length - 1; i >= 0; i--) {
            if (actual1RM >= kgThresholds[i]) {
                rankIndex = i;
                break;
            }
        }

        const currentRank = RANKS_LADDER[rankIndex];
        const nextRank = rankIndex < RANKS_LADDER.length - 1 ? RANKS_LADDER[rankIndex + 1] : null;

        let expPercentage = 100;
        let neededKg = 0;

        if (nextRank) {
            const currentFloor = kgThresholds[rankIndex];
            const nextGoal = kgThresholds[rankIndex + 1];
            const range = Math.max(1, nextGoal - currentFloor);
            const progress = Math.max(0, actual1RM - currentFloor);
            expPercentage = Math.min(99, Math.max(0, Math.round((progress / range) * 100)));
            neededKg = Math.max(0.5, Math.round((nextGoal - actual1RM) * 10) / 10);
        }

        return {
            muscleKey,
            muscleName: standard.name,
            icon: standard.icon,
            exercisesRef: standard.exercisesRef,
            tips: standard.tips,
            currentRank,
            nextRank,
            actual1RM,
            bestExName: record.bestExName,
            bestWeight: record.bestWeight,
            bestReps: record.bestReps,
            expPercentage,
            neededKg,
            bw
        };
    },

    // Calcular Rango Global Stetics del Atleta
    getOverallRank() {
        const keys = ['pecho', 'espalda', 'piernas', 'hombros', 'biceps', 'triceps', 'core'];
        let totalLevels = 0;
        const muscleStats = {};

        keys.forEach(k => {
            const stats = this.getMuscleRankStats(k);
            muscleStats[k] = stats;
            totalLevels += stats.currentRank.level;
        });

        const avgLevel = totalLevels / keys.length;
        const rankIndex = Math.min(RANKS_LADDER.length - 1, Math.max(0, Math.round(avgLevel) - 1));
        const overallRank = RANKS_LADDER[rankIndex];

        return {
            overallRank,
            avgLevel: Math.round(avgLevel * 10) / 10,
            muscleStats
        };
    },

    // Generar el SVG anatómico humano completo
    getSilhouetteSvgHtml(viewMode = 'front') {
        const isFront = viewMode === 'front';

        // SVGs vectoriales estilizados de física culturista (V-Taper, cintura estrecha, cuádriceps barridos)
        if (isFront) {
            return `
            <svg id="aesthetic-silhouette-svg" class="silhouette-svg-main" viewBox="0 0 280 440" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="glow-filter-generic" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#ff6b00" flood-opacity="0.6"/>
                    </filter>
                    <linearGradient id="body-contour-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#181822"/>
                        <stop offset="100%" stop-color="#0a0a0f"/>
                    </linearGradient>
                </defs>

                <!-- Silueta base de fondo / Contorno óseo -->
                <g class="body-base-skeleton" opacity="0.4">
                    <!-- Cabeza y cuello -->
                    <ellipse cx="140" cy="38" rx="16" ry="21" fill="#1e1e28" stroke="#333346" stroke-width="2"/>
                    <path d="M131 57 L131 75 L149 75 L149 57 Z" fill="#1e1e28"/>
                    <!-- Manos y pies -->
                    <circle cx="58" cy="245" r="7" fill="#1e1e28"/>
                    <circle cx="222" cy="245" r="7" fill="#1e1e28"/>
                    <path d="M106 422 L116 426 L96 426 Z" fill="#1e1e28"/>
                    <path d="M174 422 L164 426 L184 426 Z" fill="#1e1e28"/>
                </g>

                <!-- GRUPOS MUSCULARES FRONTALES INTERACTIVOS -->

                <!-- HOMBROS (DELTOIDES ANTERIOR Y LATERAL) -->
                <g id="muscle-part-hombros" class="muscle-group-node" data-muscle="hombros" title="Hombros">
                    <!-- Hombro Izquierdo -->
                    <path d="M108 76 C94 77, 78 88, 77 105 C76 116, 84 125, 94 121 C99 108, 104 96, 112 85 Z" class="muscle-mesh-path" />
                    <!-- Hombro Derecho -->
                    <path d="M172 76 C186 77, 202 88, 203 105 C204 116, 196 125, 186 121 C181 108, 176 96, 168 85 Z" class="muscle-mesh-path" />
                </g>

                <!-- PECHO (PECTORALES MAYORES Y MENORES) -->
                <g id="muscle-part-pecho" class="muscle-group-node" data-muscle="pecho" title="Pecho">
                    <!-- Pectoral Izquierdo -->
                    <path d="M138 88 C126 87, 110 88, 102 96 C98 106, 102 120, 112 125 C122 128, 134 125, 138 120 Z" class="muscle-mesh-path" />
                    <!-- Pectoral Derecho -->
                    <path d="M142 88 C154 87, 170 88, 178 96 C182 106, 178 120, 168 125 C158 128, 146 125, 142 120 Z" class="muscle-mesh-path" />
                </g>

                <!-- BÍCEPS (BRAZOS FRONTALES) -->
                <g id="muscle-part-biceps" class="muscle-group-node" data-muscle="biceps" title="Bíceps">
                    <!-- Bíceps Izquierdo -->
                    <path d="M88 123 C80 127, 73 138, 72 153 C71 164, 76 172, 83 172 C89 165, 93 150, 94 135 Z" class="muscle-mesh-path" />
                    <!-- Antebrazo Izquierdo -->
                    <path d="M81 176 C74 186, 64 207, 60 234 C64 235, 71 228, 77 205 C81 192, 85 182, 84 176 Z" class="muscle-mesh-path" opacity="0.85" />
                    <!-- Bíceps Derecho -->
                    <path d="M192 123 C200 127, 207 138, 208 153 C209 164, 204 172, 197 172 C191 165, 187 150, 186 135 Z" class="muscle-mesh-path" />
                    <!-- Antebrazo Derecho -->
                    <path d="M199 176 C206 186, 216 207, 220 234 C216 235, 209 228, 203 205 C199 192, 195 182, 196 176 Z" class="muscle-mesh-path" opacity="0.85" />
                </g>

                <!-- CORE (ABDOMINALES SIX-PACK Y OBLICUOS) -->
                <g id="muscle-part-core" class="muscle-group-node" data-muscle="core" title="Core / Abdomen">
                    <!-- Recto Abdominal Superior -->
                    <rect x="127" y="128" width="11" height="12" rx="3" class="muscle-mesh-path"/>
                    <rect x="142" y="128" width="11" height="12" rx="3" class="muscle-mesh-path"/>
                    <!-- Recto Abdominal Medio -->
                    <rect x="127" y="143" width="11" height="12" rx="3" class="muscle-mesh-path"/>
                    <rect x="142" y="143" width="11" height="12" rx="3" class="muscle-mesh-path"/>
                    <!-- Recto Abdominal Inferior -->
                    <rect x="128" y="158" width="10" height="13" rx="3" class="muscle-mesh-path"/>
                    <rect x="142" y="158" width="10" height="13" rx="3" class="muscle-mesh-path"/>
                    <!-- Oblicuos / Serratos -->
                    <path d="M116 133 C119 146, 120 162, 125 174 C121 172, 116 160, 113 145 Z" class="muscle-mesh-path" opacity="0.9"/>
                    <path d="M164 133 C161 146, 160 162, 155 174 C159 172, 164 160, 167 145 Z" class="muscle-mesh-path" opacity="0.9"/>
                </g>

                <!-- PIERNAS FRONTALES (CUÁDRICEPS Y GEMELOS) -->
                <g id="muscle-part-piernas" class="muscle-group-node" data-muscle="piernas" title="Piernas">
                    <!-- Cuádriceps Izquierdo (Vasto externo, recto, vasto interno) -->
                    <path d="M112 186 C102 205, 96 235, 102 270 C108 277, 116 278, 122 268 C126 242, 128 214, 128 188 Z" class="muscle-mesh-path" />
                    <!-- Cuádriceps Derecho -->
                    <path d="M168 186 C178 205, 184 235, 178 270 C172 277, 164 278, 158 268 C154 242, 152 214, 152 188 Z" class="muscle-mesh-path" />
                    <!-- Rodillas -->
                    <ellipse cx="112" cy="285" rx="7" ry="6" class="muscle-mesh-path" opacity="0.6"/>
                    <ellipse cx="168" cy="285" rx="7" ry="6" class="muscle-mesh-path" opacity="0.6"/>
                    <!-- Gemelos / Tibiales Frontales -->
                    <path d="M106 295 C98 316, 99 350, 104 388 C108 392, 114 390, 118 368 C121 345, 120 318, 116 295 Z" class="muscle-mesh-path" />
                    <path d="M174 295 C182 316, 181 350, 176 388 C172 392, 166 390, 162 368 C159 345, 160 318, 164 295 Z" class="muscle-mesh-path" />
                </g>

                <!-- VISTA TAG -->
                <text x="140" y="432" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="700" letter-spacing="2">VISTA FRONTAL</text>
            </svg>`;
        } else {
            // VISTA DORSAL (ESPALDA, TRÍCEPS, GLÚTEOS, FEMORALES)
            return `
            <svg id="aesthetic-silhouette-svg" class="silhouette-svg-main" viewBox="0 0 280 440" xmlns="http://www.w3.org/2000/svg">
                <g class="body-base-skeleton" opacity="0.4">
                    <ellipse cx="140" cy="38" rx="16" ry="21" fill="#1e1e28" stroke="#333346" stroke-width="2"/>
                    <circle cx="58" cy="245" r="7" fill="#1e1e28"/>
                    <circle cx="222" cy="245" r="7" fill="#1e1e28"/>
                    <path d="M106 422 L116 426 L96 426 Z" fill="#1e1e28"/>
                    <path d="M174 422 L164 426 L184 426 Z" fill="#1e1e28"/>
                </g>

                <!-- ESPALDA (TRAPECIOS Y DORSALES ANCHOS V-TAPER) -->
                <g id="muscle-part-espalda" class="muscle-group-node" data-muscle="espalda" title="Espalda">
                    <!-- Trapecio Superior y Medio -->
                    <path d="M140 58 L122 75 L112 85 L140 108 L168 85 L158 75 Z" class="muscle-mesh-path" />
                    <!-- Dorsal Ancho Izquierdo (V-Wing) -->
                    <path d="M120 90 C108 98, 98 116, 96 138 C104 148, 116 156, 126 160 C128 140, 132 118, 136 102 Z" class="muscle-mesh-path" />
                    <!-- Dorsal Ancho Derecho (V-Wing) -->
                    <path d="M160 90 C172 98, 182 116, 184 138 C176 148, 164 156, 154 160 C152 140, 148 118, 144 102 Z" class="muscle-mesh-path" />
                    <!-- Lumbares / Espina Inferior -->
                    <path d="M130 162 L140 160 L150 162 L146 178 L134 178 Z" class="muscle-mesh-path" opacity="0.8"/>
                </g>

                <!-- HOMBROS POSTERIORES (DELTOIDES POSTERIOR) -->
                <g id="muscle-part-hombros-back" class="muscle-group-node" data-muscle="hombros" title="Hombros">
                    <path d="M108 78 C94 82, 80 94, 78 110 C88 112, 98 104, 106 94 Z" class="muscle-mesh-path" />
                    <path d="M172 78 C186 82, 200 94, 202 110 C192 112, 182 104, 174 94 Z" class="muscle-mesh-path" />
                </g>

                <!-- TRÍCEPS (BRAZOS POSTERIORES) -->
                <g id="muscle-part-triceps" class="muscle-group-node" data-muscle="triceps" title="Tríceps">
                    <!-- Tríceps Izquierdo -->
                    <path d="M86 118 C78 126, 73 140, 72 155 C77 166, 84 168, 89 158 C92 145, 94 132, 94 122 Z" class="muscle-mesh-path" />
                    <!-- Tríceps Derecho -->
                    <path d="M194 118 C202 126, 207 140, 208 155 C203 166, 196 168, 191 158 C188 145, 186 132, 186 122 Z" class="muscle-mesh-path" />
                </g>

                <!-- GLÚTEOS Y PIERNAS POSTERIORES (FEMORALES Y GEMELOS) -->
                <g id="muscle-part-piernas-back" class="muscle-group-node" data-muscle="piernas" title="Piernas">
                    <!-- Glúteos -->
                    <ellipse cx="124" cy="192" rx="14" ry="14" class="muscle-mesh-path" />
                    <ellipse cx="156" cy="192" rx="14" ry="14" class="muscle-mesh-path" />
                    <!-- Isquiosurales / Femorales Izquierdos -->
                    <path d="M112 210 C104 228, 102 255, 107 274 C115 277, 123 273, 127 254 C130 236, 130 220, 128 210 Z" class="muscle-mesh-path" />
                    <!-- Isquiosurales / Femorales Derechos -->
                    <path d="M168 210 C176 228, 178 255, 173 274 C165 277, 157 273, 153 254 C150 236, 150 220, 152 210 Z" class="muscle-mesh-path" />
                    <!-- Gemelos Posteriores (Gastrocnemio lateral y medial) -->
                    <path d="M105 295 C96 315, 96 345, 102 384 C108 387, 116 384, 120 360 C124 338, 123 312, 116 295 Z" class="muscle-mesh-path" />
                    <path d="M175 295 C184 315, 184 345, 178 384 C172 387, 164 384, 160 360 C156 338, 157 312, 164 295 Z" class="muscle-mesh-path" />
                </g>

                <text x="140" y="432" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="700" letter-spacing="2">VISTA DORSAL / ESPALDA</text>
            </svg>`;
        }
    },

    // Inyectar colores de rangos en los trazados del SVG
    applyRankColorsToSvg() {
        const svgs = document.querySelectorAll('.silhouette-svg-main, #aesthetic-silhouette-svg');
        if (!svgs.length) return;

        svgs.forEach(svg => {
            const nodes = svg.querySelectorAll('.muscle-group-node');
            nodes.forEach(groupNode => {
                const muscleKey = groupNode.getAttribute('data-muscle');
                if (!muscleKey) return;

                const stats = this.getMuscleRankStats(muscleKey);
                const rank = stats.currentRank;

                // Asignar colores a todos los paths del grupo muscular
                const paths = groupNode.querySelectorAll('.muscle-mesh-path');
                paths.forEach(p => {
                    p.style.fill = rank.color;
                    p.style.filter = `drop-shadow(0 0 6px ${rank.glow})`;
                    p.style.transition = 'all 0.4s ease';

                    if (rank.id === 'emerald') {
                        p.classList.add('rank-pulse-emerald');
                    } else {
                        p.classList.remove('rank-pulse-emerald');
                    }
                });

                // Añadir atributos y eventos de clic
                groupNode.style.cursor = 'pointer';
                groupNode.onclick = (e) => {
                    e.stopPropagation();
                    RankingService.openMuscleModal(muscleKey);
                };
            });
        });
    },

    // Abrir modal con estadísticas RPG de un músculo
    openMuscleModal(muscleKey) {
        const stats = this.getMuscleRankStats(muscleKey);
        const modal = document.getElementById('muscle-rank-modal');
        const content = document.getElementById('muscle-rank-modal-content');
        if (!modal || !content) return;

        const rank = stats.currentRank;
        const next = stats.nextRank;

        content.innerHTML = `
            <div class="muscle-modal-header" style="border-left: 4px solid ${rank.color};">
                <div class="muscle-modal-title-row">
                    <span class="muscle-modal-icon">${stats.icon}</span>
                    <div>
                        <h3 style="margin: 0; color: #fff; font-size: 1.25rem;">${stats.muscleName}</h3>
                        <span class="badge-rank-pill" style="background: ${rank.color}22; color: ${rank.color}; border: 1px solid ${rank.color};">
                            ${rank.icon} Rango ${rank.name}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Nivel y Título -->
            <div class="rank-card-rpg" style="background: linear-gradient(135deg, ${rank.color}15, #111118); border-color: ${rank.color}44;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong style="color: ${rank.color}; font-size: 0.95rem;">${rank.title}</strong>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Nivel ${rank.level}/8</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0 0 12px 0;">
                    ${rank.desc}
                </p>

                <!-- Barra de EXP -->
                <div class="rank-exp-section">
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 5px;">
                        <span style="color: var(--text-muted);">Progreso de Maestría (EXP)</span>
                        <strong style="color: #fff;">${stats.expPercentage}%</strong>
                    </div>
                    <div class="rank-exp-bar-track">
                        <div class="rank-exp-bar-fill" style="width: ${stats.expPercentage}%; background: linear-gradient(90deg, ${rank.color}, ${next ? next.color : rank.color});"></div>
                    </div>
                </div>
            </div>

            <!-- Mejor registro histórico -->
            <div class="muscle-record-box">
                <div class="record-box-item">
                    <span class="record-box-label">MEJOR LEVANTAMIENTO</span>
                    <strong class="record-box-val">${stats.bestExName}</strong>
                    <small style="color: var(--text-muted);">${stats.bestWeight > 0 ? `${stats.bestWeight} kg × ${stats.bestReps} reps` : 'Sin registros aún'}</small>
                </div>
                <div class="record-box-item">
                    <span class="record-box-label">1RM ESTIMADO</span>
                    <strong class="record-box-val" style="color: var(--primary); font-size: 1.25rem;">
                        ${stats.actual1RM > 0 ? `${stats.actual1RM} kg` : '0 kg'}
                    </strong>
                    <small style="color: var(--text-muted);">Ratio: ${(stats.actual1RM / stats.bw).toFixed(2)}× Peso Corporal</small>
                </div>
            </div>

            <!-- Misión para subir de rango -->
            ${next ? `
            <div class="rank-mission-box" style="border: 1px dashed ${next.color}88; background: ${next.color}0d;">
                <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
                    <span style="font-size: 1.2rem;">🎯</span>
                    <strong style="color: ${next.color}; font-size: 0.9rem;">
                        Misión para subir a Rango ${next.name} ${next.icon}
                    </strong>
                </div>
                <p style="font-size: 0.85rem; color: #fff; margin: 0;">
                    Te faltan <strong>+${stats.neededKg} kg</strong> en tu 1RM de este grupo muscular para ascender a ${next.name}.
                </p>
            </div>
            ` : `
            <div class="rank-mission-box" style="border: 1px solid #10b981; background: #10b98115;">
                <strong style="color: #10b981;">❇️ ¡RANGO MÁXIMO ALCANZADO!</strong>
                <p style="font-size: 0.85rem; color: #fff; margin: 4px 0 0 0;">
                    Has conquistado el nivel supremo Esmeralda. Eres una leyenda de la era Aesthetic.
                </p>
            </div>
            `}

            <!-- Consejo y Técnica -->
            <div style="margin-top: 14px; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                <span style="font-size: 0.75rem; color: var(--text-muted); display: block; font-weight: 700; margin-bottom: 4px;">CONSEJO DE TÉCNICA:</span>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0;">
                    ${stats.tips}
                </p>
            </div>
        `;

        modal.classList.remove('hidden');
    },

    closeMuscleModal() {
        const modal = document.getElementById('muscle-rank-modal');
        if (modal) modal.classList.add('hidden');
    },

    // Cambiar entre vista frontal y dorsal
    toggleSilhouetteView() {
        this.currentViewMode = this.currentViewMode === 'front' ? 'back' : 'front';
        const containers = document.querySelectorAll('.silhouette-interactive-container, #silhouette-interactive-container');
        const toggleBtns = document.querySelectorAll('.btn-toggle-silhouette-view, #btn-toggle-silhouette-view');
        
        containers.forEach(container => {
            container.innerHTML = this.getSilhouetteSvgHtml(this.currentViewMode);
        });
        this.applyRankColorsToSvg();

        const btnText = this.currentViewMode === 'front' 
            ? '🔄 Girar a Espalda' 
            : '🔄 Girar a Frontal';
        toggleBtns.forEach(btn => {
            if (btn.classList.contains('btn-home-rotate')) {
                btn.innerHTML = this.currentViewMode === 'front' ? '🔄 Girar' : '🔄 Frontal';
            } else {
                btn.innerHTML = btnText;
            }
        });
    },

    // Renderizar sección de silueta en la pestaña de progreso y en home
    renderSilhouetteSection() {
        const containers = document.querySelectorAll('.silhouette-interactive-container, #silhouette-interactive-container');
        if (!containers.length) return;

        containers.forEach(container => {
            container.innerHTML = this.getSilhouetteSvgHtml(this.currentViewMode);
        });
        this.applyRankColorsToSvg();
        this.renderRankSummaryCards();
        this.updateHeaderBadge();

        const overallEls = document.querySelectorAll('.overall-tier-val, #overall-tier-val');
        if (overallEls.length) {
            const { overallRank, avgLevel } = this.getOverallRank();
            const rankHtml = `<span style="color: ${overallRank.color};">${overallRank.icon} ${overallRank.name}</span> <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: normal;">(Nivel ${avgLevel}/8)</span>`;
            overallEls.forEach(el => {
                el.innerHTML = rankHtml;
            });
        }
    },

    // Tarjetas resumen debajo de la silueta
    renderRankSummaryCards() {
        const grid = document.getElementById('muscle-ranks-summary-grid');
        if (!grid) return;

        const keys = ['pecho', 'espalda', 'piernas', 'hombros', 'biceps', 'triceps', 'core'];
        let html = '';

        keys.forEach(k => {
            const stats = this.getMuscleRankStats(k);
            const rank = stats.currentRank;

            html += `
            <div class="muscle-rank-mini-card" onclick="RankingService.openMuscleModal('${k}')" style="border-left: 3px solid ${rank.color};">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span>${stats.icon}</span>
                        <strong style="color: #fff; font-size: 0.9rem;">${stats.muscleName.split('/')[0].trim()}</strong>
                    </div>
                    <span class="rank-mini-pill" style="color: ${rank.color}; background: ${rank.color}1a; border: 1px solid ${rank.color}44;">
                        ${rank.icon} ${rank.name}
                    </span>
                </div>
                <div style="margin-top: 8px; display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted);">
                    <span>1RM: <strong style="color: var(--text-primary);">${stats.actual1RM > 0 ? stats.actual1RM + ' kg' : '0 kg'}</strong></span>
                    <span>EXP: <strong style="color: ${rank.color};">${stats.expPercentage}%</strong></span>
                </div>
            </div>
            `;
        });

        grid.innerHTML = html;
    },

    // Actualizar píldora de usuario en el header con su rango global
    updateHeaderBadge() {
        const badge = document.getElementById('header-athlete-pill');
        const nameEl = document.getElementById('header-athlete-name');
        if (!badge || !nameEl) return;

        const { overallRank } = this.getOverallRank();
        const userName = window.StorageService ? window.StorageService.getUserName() : 'Atleta';

        badge.style.borderColor = overallRank.color;
        badge.style.boxShadow = `0 0 10px ${overallRank.glow}`;
        nameEl.innerHTML = `<span style="color: ${overallRank.color}; font-weight: 800;">[${overallRank.icon} ${overallRank.name}]</span> ${userName || 'Atleta'}`;
    },

    // Verificar si se alcanzó un nuevo rango durante la sesión activa
    checkSessionRankUp(oldOverallLevel) {
        const { overallRank, avgLevel } = this.getOverallRank();
        if (overallRank.level > oldOverallLevel) {
            // Disparar celebración de RANK UP
            this.showRankUpModal(overallRank);
        }
    },

    showRankUpModal(newRank) {
        const modal = document.getElementById('rank-up-modal');
        if (!modal) return;

        const rankIconEl = document.getElementById('rank-up-icon');
        const rankNameEl = document.getElementById('rank-up-name');
        const rankDescEl = document.getElementById('rank-up-desc');

        if (rankIconEl) rankIconEl.textContent = newRank.icon;
        if (rankNameEl) {
            rankNameEl.textContent = `¡RANGO ${newRank.name.toUpperCase()} ALCANZADO!`;
            rankNameEl.style.color = newRank.color;
        }
        if (rankDescEl) {
            rankDescEl.textContent = newRank.desc;
        }

        // Tocar melodía épica de subida de nivel
        if (window.RestTimer) {
            window.RestTimer.playTone(523.25, 0.15, 'triangle'); // Do5
            setTimeout(() => window.RestTimer.playTone(659.25, 0.15, 'triangle'), 150); // Mi5
            setTimeout(() => window.RestTimer.playTone(783.99, 0.2, 'triangle'), 300); // Sol5
            setTimeout(() => window.RestTimer.playTone(1046.50, 0.4, 'triangle'), 450); // Do6
        }

        modal.classList.remove('hidden');
    },

    closeRankUpModal() {
        const modal = document.getElementById('rank-up-modal');
        if (modal) modal.classList.add('hidden');
    }
};

window.RankingService = RankingService;
window.RANKS_LADDER = RANKS_LADDER;
