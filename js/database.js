// ===================================================================
// BASE DE DATOS DE EJERCICIOS Y RUTINAS PRECARGADAS (GYMTRACK PRO)
// ===================================================================

const MUSCLE_GROUPS = {
    pecho: { name: 'Pecho', color: '#ef4444', icon: 'shield' },
    espalda: { name: 'Espalda', color: '#3b82f6', icon: 'disc' },
    piernas: { name: 'Piernas', color: '#10b981', icon: 'zap' },
    hombros: { name: 'Hombros', color: '#f59e0b', icon: 'target' },
    biceps: { name: 'Bíceps', color: '#8b5cf6', icon: 'activity' },
    triceps: { name: 'Tríceps', color: '#ec4899', icon: 'award' },
    core: { name: 'Core / Abdomen', color: '#06b6d4', icon: 'anchor' }
};

// Generador de ilustraciones anatómicas vectoriales interactivas
function getExerciseSvg(category, id) {
    const colors = {
        chest: '#ef4444',
        back: '#3b82f6',
        legs: '#10b981',
        shoulders: '#f59e0b',
        arms: '#8b5cf6',
        core: '#06b6d4',
        neutral: '#64748b',
        body: '#1e293b',
        highlight: '#38bdf8'
    };

    switch (category) {
        case 'pecho':
            return `
            <svg viewBox="0 0 160 160" class="exercise-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Banco de press -->
                <rect x="25" y="105" width="110" height="12" rx="4" fill="#334155"/>
                <rect x="35" y="117" width="8" height="30" rx="2" fill="#475569"/>
                <rect x="117" y="117" width="8" height="30" rx="2" fill="#475569"/>
                <!-- Atleta tumbado -->
                <circle cx="45" cy="95" r="10" fill="#94a3b8"/>
                <path d="M55 98 C70 98, 85 99, 105 101" stroke="#cbd5e1" stroke-width="12" stroke-linecap="round"/>
                <!-- Pierna flexionada hacia el suelo -->
                <path d="M100 102 L115 118 L122 145" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- Pecho activo destacado -->
                <ellipse cx="68" cy="94" rx="11" ry="8" fill="${colors.chest}" opacity="0.9"/>
                <!-- Brazos y Barra -->
                <path d="M64 97 L75 75 L80 62" stroke="#e2e8f0" stroke-width="6" stroke-linecap="round"/>
                <rect x="30" y="58" width="100" height="5" rx="2" fill="#cbd5e1"/>
                <rect x="35" y="47" width="8" height="27" rx="3" fill="${colors.chest}"/>
                <rect x="117" y="47" width="8" height="27" rx="3" fill="${colors.chest}"/>
                <circle cx="80" cy="60" r="4" fill="#f8fafc"/>
            </svg>`;

        case 'piernas':
            return `
            <svg viewBox="0 0 160 160" class="exercise-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Suelo -->
                <line x1="20" y1="148" x2="140" y2="148" stroke="#334155" stroke-width="3"/>
                <!-- Atleta en sentadilla -->
                <circle cx="68" cy="42" r="10" fill="#94a3b8"/>
                <!-- Barra sobre trapecios -->
                <rect x="25" y="48" width="110" height="6" rx="2" fill="#cbd5e1"/>
                <circle cx="35" cy="51" r="14" fill="${colors.legs}" opacity="0.85"/>
                <circle cx="125" cy="51" r="14" fill="${colors.legs}" opacity="0.85"/>
                <!-- Tronco -->
                <path d="M68 52 L62 82" stroke="#cbd5e1" stroke-width="12" stroke-linecap="round"/>
                <!-- Cuádriceps y Glúteos destacados -->
                <path d="M62 82 L90 85" stroke="${colors.legs}" stroke-width="12" stroke-linecap="round"/>
                <path d="M90 85 L65 125" stroke="${colors.legs}" stroke-width="10" stroke-linecap="round"/>
                <!-- Pies firmes -->
                <path d="M65 125 L55 146 H80" stroke="#94a3b8" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;

        case 'espalda':
            return `
            <svg viewBox="0 0 160 160" class="exercise-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Barra dominadas / polea -->
                <rect x="20" y="24" width="120" height="6" rx="3" fill="#cbd5e1"/>
                <!-- Espalda del atleta vista posterior -->
                <circle cx="80" cy="48" r="10" fill="#94a3b8"/>
                <!-- Brazos traccionando hacia arriba -->
                <path d="M42 27 L60 48 L73 54" stroke="#e2e8f0" stroke-width="6" stroke-linecap="round"/>
                <path d="M118 27 L100 48 L87 54" stroke="#e2e8f0" stroke-width="6" stroke-linecap="round"/>
                <!-- Dorsales y Trapecio en V iluminados -->
                <path d="M72 56 L88 56 L96 82 L80 96 L64 82 Z" fill="${colors.back}" opacity="0.9"/>
                <!-- Cintura y piernas suspendidas -->
                <path d="M80 96 L76 130 L72 144" stroke="#64748b" stroke-width="8" stroke-linecap="round"/>
                <path d="M80 96 L84 130 L88 144" stroke="#64748b" stroke-width="8" stroke-linecap="round"/>
            </svg>`;

        case 'hombros':
            return `
            <svg viewBox="0 0 160 160" class="exercise-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Atleta de pie -->
                <circle cx="80" cy="40" r="10" fill="#94a3b8"/>
                <rect x="25" y="22" width="110" height="5" rx="2" fill="#cbd5e1"/>
                <rect x="30" y="14" width="8" height="21" rx="3" fill="${colors.shoulders}"/>
                <rect x="122" y="14" width="8" height="21" rx="3" fill="${colors.shoulders}"/>
                <!-- Deltoides activos -->
                <circle cx="62" cy="54" r="9" fill="${colors.shoulders}" opacity="0.9"/>
                <circle cx="98" cy="54" r="9" fill="${colors.shoulders}" opacity="0.9"/>
                <!-- Brazos extendidos arriba bloqueando barra -->
                <path d="M62 54 L52 35 L42 24" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round"/>
                <path d="M98 54 L108 35 L118 24" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round"/>
                <!-- Torso y piernas firmes -->
                <path d="M80 54 L80 95" stroke="#cbd5e1" stroke-width="12" stroke-linecap="round"/>
                <path d="M76 95 L72 144" stroke="#64748b" stroke-width="8" stroke-linecap="round"/>
                <path d="M84 95 L88 144" stroke="#64748b" stroke-width="8" stroke-linecap="round"/>
            </svg>`;

        case 'biceps':
            return `
            <svg viewBox="0 0 160 160" class="exercise-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Cabeza y torso lateral -->
                <circle cx="65" cy="42" r="10" fill="#94a3b8"/>
                <path d="M65 52 L65 105" stroke="#cbd5e1" stroke-width="12" stroke-linecap="round"/>
                <!-- Brazo y Bíceps contraído -->
                <path d="M65 55 L70 82" stroke="#94a3b8" stroke-width="8" stroke-linecap="round"/>
                <!-- Biceps resaltado -->
                <ellipse cx="78" cy="74" rx="10" ry="12" fill="${colors.arms}" opacity="0.95"/>
                <path d="M70 82 L86 64" stroke="#cbd5e1" stroke-width="7" stroke-linecap="round"/>
                <!-- Mancuerna / barra -->
                <circle cx="90" cy="62" r="10" fill="${colors.arms}"/>
                <rect x="88" y="54" width="4" height="16" fill="#e2e8f0"/>
                <!-- Piernas estables -->
                <path d="M62 105 L58 145" stroke="#64748b" stroke-width="8" stroke-linecap="round"/>
                <path d="M68 105 L72 145" stroke="#64748b" stroke-width="8" stroke-linecap="round"/>
            </svg>`;

        case 'triceps':
            return `
            <svg viewBox="0 0 160 160" class="exercise-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Polea / Cuerda -->
                <rect x="76" y="15" width="8" height="15" fill="#334155"/>
                <line x1="80" y1="28" x2="80" y2="60" stroke="#cbd5e1" stroke-width="3"/>
                <circle cx="65" cy="42" r="10" fill="#94a3b8"/>
                <path d="M65 52 L68 105" stroke="#cbd5e1" stroke-width="12" stroke-linecap="round"/>
                <!-- Tríceps posterior activado -->
                <ellipse cx="61" cy="72" rx="9" ry="13" fill="#ec4899" opacity="0.95"/>
                <path d="M66 56 L64 80 L80 98" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- Manos extendiendo abajo -->
                <circle cx="80" cy="98" r="5" fill="#ec4899"/>
                <!-- Piernas con ligera flexión -->
                <path d="M68 105 L62 144" stroke="#64748b" stroke-width="8" stroke-linecap="round"/>
                <path d="M70 105 L76 144" stroke="#64748b" stroke-width="8" stroke-linecap="round"/>
            </svg>`;

        case 'core':
        default:
            return `
            <svg viewBox="0 0 160 160" class="exercise-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="20" y1="135" x2="140" y2="135" stroke="#334155" stroke-width="3"/>
                <!-- Postura en plancha -->
                <circle cx="36" cy="95" r="9" fill="#94a3b8"/>
                <!-- Apoyo de codos -->
                <path d="M38 102 L44 125 L58 125" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- Tronco recto con Core activado -->
                <line x1="44" y1="104" x2="116" y2="114" stroke="#cbd5e1" stroke-width="12" stroke-linecap="round"/>
                <rect x="62" y="102" width="34" height="12" rx="5" fill="${colors.core}" opacity="0.9"/>
                <!-- Puntas de los pies en el suelo -->
                <path d="M116 114 L126 128" stroke="#94a3b8" stroke-width="7" stroke-linecap="round"/>
            </svg>`;
    }
}

// Catálogo completo de ejercicios predefinidos
const EXERCISES_DATABASE = [
    // --- PECHO ---
    {
        id: 'press_banca_plano',
        name: 'Press de Banca Plano con Barra',
        category: 'pecho',
        equipment: 'Barra Olímpica',
        difficulty: 'Principiante / Intermedio',
        primaryMuscles: ['Pectoral Mayor', 'Pectoral Menor'],
        secondaryMuscles: ['Tríceps Braquial', 'Deltoides Anterior'],
        repRangeRecommended: '6 - 10 reps',
        restTimeSeconds: 120,
        tips: [
            'Mantén los pies firmes y apoyados en el suelo para generar tensión (leg drive).',
            'Junta y baja las escápulas (retracción escapular) antes de sacar la barra.',
            'Baja la barra de forma controlada hasta la mitad inferior del pecho (a nivel de pezones).',
            'No abras los codos a 90°; mantenlos a unos 45° - 60° respecto al torso.'
        ]
    },
    {
        id: 'press_inclinado_mancuernas',
        name: 'Press Inclinado con Mancuernas',
        category: 'pecho',
        equipment: 'Mancuernas',
        difficulty: 'Principiante',
        primaryMuscles: ['Pectoral Superior (Clavicular)'],
        secondaryMuscles: ['Deltoides Anterior', 'Tríceps'],
        repRangeRecommended: '8 - 12 reps',
        restTimeSeconds: 90,
        tips: [
            'Ajusta el banco a una inclinación suave (entre 30° y 45° máximo).',
            'Baja las mancuernas sintiendo el estiramiento en la parte superior del pecho.',
            'Empuja hacia arriba sin chocar las mancuernas bruscamente al final.'
        ]
    },
    {
        id: 'aperturas_pecho_polea',
        name: 'Cruces en Polea / Aperturas',
        category: 'pecho',
        equipment: 'Polea Doble',
        difficulty: 'Principiante',
        primaryMuscles: ['Pectoral Mayor'],
        secondaryMuscles: ['Deltoides Anterior'],
        repRangeRecommended: '10 - 15 reps',
        restTimeSeconds: 60,
        tips: [
            'Mantén una ligera flexión en los codos durante todo el recorrido.',
            'Aprieta el pecho 1 segundo en el punto de máxima contracción.'
        ]
    },

    // --- ESPALDA ---
    {
        id: 'jalon_al_pecho',
        name: 'Jalón al Pecho en Polea (Lat Pulldown)',
        category: 'espalda',
        equipment: 'Polea Alta',
        difficulty: 'Principiante',
        primaryMuscles: ['Dorsal Ancho'],
        secondaryMuscles: ['Bíceps', 'Braquial', 'Trapecio'],
        repRangeRecommended: '8 - 12 reps',
        restTimeSeconds: 90,
        tips: [
            'Agarre ligeramente más ancho que los hombros.',
            'Tira dirigiendo los codos hacia abajo y hacia tus caderas, no hacia atrás.',
            'Lleva la barra hacia la parte superior del pecho con el torso ligeramente inclinado.',
            'No des tirones con la espalda baja para aprovechar la inercia.'
        ]
    },
    {
        id: 'remo_con_barra',
        name: 'Remo con Barra Inclinado (Barbell Row)',
        category: 'espalda',
        equipment: 'Barra Olímpica',
        difficulty: 'Intermedio',
        primaryMuscles: ['Dorsal Ancho', 'Espalda Media', 'Romboides'],
        secondaryMuscles: ['Bíceps', 'Lumbar', 'Deltoides Posterior'],
        repRangeRecommended: '6 - 10 reps',
        restTimeSeconds: 120,
        tips: [
            'Inclina el torso a unos 45° manteniendo la columna totalmente neutra.',
            'Tira de la barra hacia el ombligo manteniendo los codos cerca del cuerpo.',
            'Inicia el movimiento juntando las escápulas antes de flexionar los brazos.'
        ]
    },
    {
        id: 'remo_con_mancuerna_unilateral',
        name: 'Remo con Mancuerna a una Mano',
        category: 'espalda',
        equipment: 'Mancuerna',
        difficulty: 'Principiante',
        primaryMuscles: ['Dorsal Ancho', 'Redondo Mayor'],
        secondaryMuscles: ['Bíceps', 'Core'],
        repRangeRecommended: '8 - 12 reps',
        restTimeSeconds: 75,
        tips: [
            'Apoya una rodilla y mano en un banco plano para proteger la columna.',
            'Deja que la mancuerna estire el dorsal abajo y sube llevando el codo hacia la cadera.'
        ]
    },
    {
        id: 'dominadas',
        name: 'Dominadas Pronas / Neutras (Pull-ups)',
        category: 'espalda',
        equipment: 'Barra de Dominadas / Banda Elástica',
        difficulty: 'Intermedio / Avanzado',
        primaryMuscles: ['Dorsal Ancho', 'Redondo Mayor'],
        secondaryMuscles: ['Bíceps', 'Braquiorradial', 'Core'],
        repRangeRecommended: '5 - 10 reps',
        restTimeSeconds: 120,
        tips: [
            'Si eres principiante, usa una banda de resistencia o máquina asistida.',
            'Extiende los brazos casi por completo abajo antes de iniciar la siguiente repetición.'
        ]
    },

    // --- PIERNAS ---
    {
        id: 'sentadilla_trasera',
        name: 'Sentadilla con Barra (Back Squat)',
        category: 'piernas',
        equipment: 'Barra y Rack',
        difficulty: 'Intermedio',
        primaryMuscles: ['Cuádriceps', 'Glúteo Mayor'],
        secondaryMuscles: ['Isquiotibiales', 'Erectores Espinales', 'Core'],
        repRangeRecommended: '6 - 10 reps',
        restTimeSeconds: 150,
        tips: [
            'Coloca los pies a la anchura de los hombros con las puntas ligeramente hacia afuera.',
            'Inhala hondo y aprieta el abdomen (maniobra de Valsalva) antes de descender.',
            'Baja hasta que tus caderas queden al menos paralelas a la altura de tus rodillas.',
            'Evita que las rodillas colapsen hacia adentro al subir.'
        ]
    },
    {
        id: 'prensa_de_piernas',
        name: 'Prensa de Piernas 45°',
        category: 'piernas',
        equipment: 'Máquina Prensa',
        difficulty: 'Principiante',
        primaryMuscles: ['Cuádriceps', 'Glúteos'],
        secondaryMuscles: ['Isquiotibiales'],
        repRangeRecommended: '8 - 12 reps',
        restTimeSeconds: 90,
        tips: [
            'Coloca los pies al centro de la plataforma con separación de hombros.',
            'Baja todo lo posible sin despegar el coxis ni la espalda baja del respaldo.',
            'No bloquees las rodillas bruscamente en la parte alta para proteger la articulación.'
        ]
    },
    {
        id: 'peso_muerto_rumano',
        name: 'Peso Muerto Rumano (RDL)',
        category: 'piernas',
        equipment: 'Barra o Mancuernas',
        difficulty: 'Intermedio',
        primaryMuscles: ['Isquiotibiales', 'Glúteos'],
        secondaryMuscles: ['Erectores Espinales', 'Antebrazo'],
        repRangeRecommended: '8 - 10 reps',
        restTimeSeconds: 120,
        tips: [
            'Mantén las rodillas semirrígidas (con una ligera y constante flexión).',
            'Lleva tus caderas hacia atrás como si quisieras tocar la pared con el glúteo.',
            'La barra desciende pegada a los muslos y espinillas. Espalda recta en todo momento.'
        ]
    },
    {
        id: 'curl_femoral_tumbado',
        name: 'Curl Femoral Tumbado / Sentado',
        category: 'piernas',
        equipment: 'Máquina Femoral',
        difficulty: 'Principiante',
        primaryMuscles: ['Isquiotibiales (Bíceps Femoral)'],
        secondaryMuscles: ['Gemelos'],
        repRangeRecommended: '10 - 15 reps',
        restTimeSeconds: 75,
        tips: [
            'Ajusta el cojín de apoyo justo encima de los talones.',
            'Contrae los femorales de forma controlada y frena la bajada en 2 segundos.'
        ]
    },
    {
        id: 'elevacion_talones_gemelos',
        name: 'Elevación de Talones (Gemelos)',
        category: 'piernas',
        equipment: 'Máquina o Mancuerna',
        difficulty: 'Principiante',
        primaryMuscles: ['Gastrocnemio (Gemelos)', 'Sóleo'],
        secondaryMuscles: ['Tibial Posterior'],
        repRangeRecommended: '12 - 20 reps',
        restTimeSeconds: 60,
        tips: [
            'Haz una pausa de 1 segundo en el punto de máximo estiramiento abajo.',
            'Sube con fuerza hasta la punta del pie y aguanta la contracción.'
        ]
    },

    // --- HOMBROS ---
    {
        id: 'press_militar_barra',
        name: 'Press Militar con Barra / Mancuernas',
        category: 'hombros',
        equipment: 'Barra o Mancuernas',
        difficulty: 'Principiante / Intermedio',
        primaryMuscles: ['Deltoides Anterior', 'Deltoides Lateral'],
        secondaryMuscles: ['Tríceps', 'Trapecio Superior', 'Core'],
        repRangeRecommended: '6 - 10 reps',
        restTimeSeconds: 120,
        tips: [
            'Aprieta glúteos y abdomen fuertemente para evitar arquear la espalda baja.',
            'Pasa la cabeza hacia adelante ligeramente en cuanto la barra supere la frente.',
            'Bloquea los brazos arriba de forma controlada sin hiperextender el cuello.'
        ]
    },
    {
        id: 'elevaciones_laterales',
        name: 'Elevaciones Laterales con Mancuerna / Polea',
        category: 'hombros',
        equipment: 'Mancuernas o Polea',
        difficulty: 'Principiante',
        primaryMuscles: ['Deltoides Lateral'],
        secondaryMuscles: ['Trapecio Superior'],
        repRangeRecommended: '12 - 15 reps',
        restTimeSeconds: 60,
        tips: [
            'Usa un peso moderado para evitar balancear el cuerpo.',
            'Imagina que viertes agua de una jarra; el codo debe liderar la elevación.',
            'Eleva los brazos hasta la altura paralela al suelo (unos 90°).'
        ]
    },
    {
        id: 'pajaros_deltoides_posterior',
        name: 'Face Pull o Pájaros (Deltoides Posterior)',
        category: 'hombros',
        equipment: 'Polea con Cuerda / Mancuernas',
        difficulty: 'Principiante',
        primaryMuscles: ['Deltoides Posterior', 'Manguito Rotador'],
        secondaryMuscles: ['Romboides', 'Trapecio Medio'],
        repRangeRecommended: '12 - 15 reps',
        restTimeSeconds: 60,
        tips: [
            'Esencial para la salud articular de los hombros y corregir posturas.',
            'Tira de la cuerda hacia los ojos/frente abriendo los extremos de la cuerda.'
        ]
    },

    // --- BÍCEPS ---
    {
        id: 'curl_biceps_barra_z',
        name: 'Curl de Bíceps con Barra Z',
        category: 'biceps',
        equipment: 'Barra Z',
        difficulty: 'Principiante',
        primaryMuscles: ['Bíceps Braquial'],
        secondaryMuscles: ['Braquial Anterior', 'Braquiorradial'],
        repRangeRecommended: '8 - 12 reps',
        restTimeSeconds: 75,
        tips: [
            'Pega los codos a tus costados y no los eches hacia adelante al subir.',
            'La barra Z reduce la molestia en las muñecas respecto a la barra recta.',
            'Controla la fase excéntrica (bajada) en 2 segundos.'
        ]
    },
    {
        id: 'curl_martillo_mancuernas',
        name: 'Curl Martillo con Mancuernas',
        category: 'biceps',
        equipment: 'Mancuernas',
        difficulty: 'Principiante',
        primaryMuscles: ['Braquiorradial', 'Braquial Anterior'],
        secondaryMuscles: ['Bíceps'],
        repRangeRecommended: '10 - 12 reps',
        restTimeSeconds: 60,
        tips: [
            'Mantén las palmas de las manos enfrentadas durante todo el movimiento.',
            'Excelente para desarrollar el grosor del brazo y el antebrazo.'
        ]
    },

    // --- TRÍCEPS ---
    {
        id: 'extensiones_triceps_polea',
        name: 'Extensiones de Tríceps en Polea Alta',
        category: 'triceps',
        equipment: 'Polea con Cuerda o Barra Recta',
        difficulty: 'Principiante',
        primaryMuscles: ['Tríceps (Cabeza Lateral y Medial)'],
        secondaryMuscles: ['Antebrazo'],
        repRangeRecommended: '10 - 15 reps',
        restTimeSeconds: 60,
        tips: [
            'Fija los codos a los lados del torso; no dejes que se muevan hacia adelante y atrás.',
            'Abre ligeramente la cuerda hacia los lados al llegar abajo para máxima contracción.'
        ]
    },
    {
        id: 'fondos_paralelas',
        name: 'Fondos en Paralelas (Dips) o en Banco',
        category: 'triceps',
        equipment: 'Barras Paralelas / Banco',
        difficulty: 'Intermedio',
        primaryMuscles: ['Tríceps', 'Pectoral Inferior'],
        secondaryMuscles: ['Deltoides Anterior'],
        repRangeRecommended: '8 - 12 reps',
        restTimeSeconds: 90,
        tips: [
            'Para enfatizar tríceps, mantén el torso erguido.',
            'Baja hasta que tus brazos formen un ángulo de 90° y empuja con potencia.'
        ]
    },

    // --- CORE ---
    {
        id: 'plancha_abdominal',
        name: 'Plancha Abdominal Estática (Plank)',
        category: 'core',
        equipment: 'Esterilla',
        difficulty: 'Principiante',
        primaryMuscles: ['Transverso Abdominal', 'Recto Abdominal'],
        secondaryMuscles: ['Glúteos', 'Deltoides'],
        repRangeRecommended: '30 - 60 segs',
        restTimeSeconds: 60,
        tips: [
            'Cuerpo en línea recta desde los talones hasta la cabeza; no hundas la cadera.',
            'Aprieta conscientemente glúteos y abdomen mientras respiras con normalidad.'
        ]
    },
    {
        id: 'crunch_polea_alta',
        name: 'Crunch Abdominal en Polea Alta',
        category: 'core',
        equipment: 'Polea con Cuerda',
        difficulty: 'Intermedio',
        primaryMuscles: ['Recto Abdominal'],
        secondaryMuscles: ['Oblicuos'],
        repRangeRecommended: '12 - 15 reps',
        restTimeSeconds: 60,
        tips: [
            'De rodillas, sujeta la cuerda junto a las orejas y enrolla el torso acercando las costillas a la pelvis.',
            'No muevas la cadera hacia atrás; el movimiento proviene de flexionar la columna.'
        ]
    }
];

// ===================================================================
// ===================================================================
// RUTINAS PRECARGADAS (STETICS ERA - DAVID LAID & AESTHETICS)
// ===================================================================
const PRELOADED_ROUTINES = [
    {
        id: 'routine_ppl_aesthetic',
        name: '⚡ Empuje / Tirón / Pierna - PPL',
        badge: 'David Laid Era',
        level: 'Intermedio / Avanzado',
        daysPerWeek: '3 o 6 días/sem',
        description: 'La división por excelencia del culturismo estético. Separa el cuerpo en patrones de movimiento antagónicos para permitir máxima intensidad y recuperación óptima.',
        guidelines: [
            'Frecuencia recomendada: 3 a 6 días por semana (Push, Pull, Legs, Descanso, repetir).',
            'En los días de Empuje y Tirón, busca conexión mente-músculo y congestión vascular en brazos y hombros.',
            'Descansa 90-120s en multiarticulares y 60s en accesorios.'
        ],
        days: [
            {
                id: 'day_push',
                name: 'Día 1: Empuje (Push - Pecho, Hombro, Tríceps)',
                focus: 'Pecho, Deltoides, Tríceps',
                exercises: [
                    { exerciseId: 'press_banca_plano', sets: 4, targetReps: '6 - 8', targetWeightKg: 60, restSeconds: 120 },
                    { exerciseId: 'press_inclinado_mancuernas', sets: 3, targetReps: '8 - 10', targetWeightKg: 22, restSeconds: 90 },
                    { exerciseId: 'press_militar_barra', sets: 3, targetReps: '8 - 10', targetWeightKg: 30, restSeconds: 90 },
                    { exerciseId: 'elevaciones_laterales', sets: 4, targetReps: '12 - 15', targetWeightKg: 10, restSeconds: 60 },
                    { exerciseId: 'fondos_paralelas', sets: 3, targetReps: '10 - 12', targetWeightKg: 0, restSeconds: 90 },
                    { exerciseId: 'extensiones_triceps_polea', sets: 3, targetReps: '12 - 15', targetWeightKg: 22, restSeconds: 60 }
                ]
            },
            {
                id: 'day_pull',
                name: 'Día 2: Tirón (Pull - Espalda, Dorsal, Bíceps)',
                focus: 'Espalda V-Taper, Bíceps',
                exercises: [
                    { exerciseId: 'jalon_al_pecho', sets: 4, targetReps: '8 - 10', targetWeightKg: 45, restSeconds: 90 },
                    { exerciseId: 'remo_con_barra', sets: 4, targetReps: '8 - 10', targetWeightKg: 45, restSeconds: 120 },
                    { exerciseId: 'remo_con_mancuerna_unilateral', sets: 3, targetReps: '10 - 12', targetWeightKg: 20, restSeconds: 75 },
                    { exerciseId: 'curl_biceps_barra_z', sets: 3, targetReps: '10 - 12', targetWeightKg: 20, restSeconds: 60 },
                    { exerciseId: 'curl_martillo_mancuernas', sets: 3, targetReps: '10 - 12', targetWeightKg: 12, restSeconds: 60 }
                ]
            },
            {
                id: 'day_legs',
                name: 'Día 3: Pierna (Legs - Cuádriceps, Femoral, Gemelo)',
                focus: 'Tren Inferior & Core',
                exercises: [
                    { exerciseId: 'sentadilla_trasera', sets: 4, targetReps: '6 - 8', targetWeightKg: 60, restSeconds: 150 },
                    { exerciseId: 'prensa_de_piernas', sets: 3, targetReps: '10 - 12', targetWeightKg: 120, restSeconds: 120 },
                    { exerciseId: 'plancha_abdominal', sets: 3, targetReps: '45s', targetWeightKg: 0, restSeconds: 60 }
                ]
            }
        ]
    },
    {
        id: 'routine_torso_pierna',
        name: '🔥 Torso / Pierna (V-Taper & Proportions)',
        badge: 'Hipertrofia V-Taper',
        level: 'Intermedio',
        daysPerWeek: '4 días/sem',
        description: 'Enfocada en esculpir la silueta en V: hombros densos como cocos, espalda amplia y cintura compacta, complementado con fuerza en tren inferior.',
        guidelines: [
            'Estructura: 2 días de Torso y 2 días de Pierna (ej: Lunes, Martes, Jueves y Viernes).',
            'Días pesados a 6-8 reps para reclutar fibras; días de bombeo a 10-15 reps.'
        ],
        days: [
            {
                id: 'day_torso',
                name: 'Día 1: Torso Completo (Empuje & Tirón)',
                focus: 'Pecho, Espalda, Hombro, Brazos',
                exercises: [
                    { exerciseId: 'press_banca_plano', sets: 4, targetReps: '6 - 8', targetWeightKg: 50, restSeconds: 120 },
                    { exerciseId: 'remo_con_barra', sets: 4, targetReps: '8 - 10', targetWeightKg: 45, restSeconds: 120 },
                    { exerciseId: 'press_inclinado_mancuernas', sets: 3, targetReps: '8 - 12', targetWeightKg: 20, restSeconds: 90 },
                    { exerciseId: 'elevaciones_laterales', sets: 4, targetReps: '12 - 15', targetWeightKg: 8, restSeconds: 60 },
                    { exerciseId: 'curl_martillo_mancuernas', sets: 3, targetReps: '10 - 12', targetWeightKg: 12, restSeconds: 60 },
                    { exerciseId: 'extensiones_triceps_polea', sets: 3, targetReps: '12 - 15', targetWeightKg: 20, restSeconds: 60 }
                ]
            },
            {
                id: 'day_pierna',
                name: 'Día 2: Pierna y Core (Fuerza & Estabilidad)',
                focus: 'Cuádriceps, Isquios, Abdomen',
                exercises: [
                    { exerciseId: 'sentadilla_trasera', sets: 4, targetReps: '6 - 8', targetWeightKg: 60, restSeconds: 150 },
                    { exerciseId: 'prensa_de_piernas', sets: 3, targetReps: '10 - 12', targetWeightKg: 100, restSeconds: 120 },
                    { exerciseId: 'plancha_abdominal', sets: 3, targetReps: '60s', targetWeightKg: 0, restSeconds: 60 }
                ]
            }
        ]
    },
    {
        id: 'routine_fullbody_beginner',
        name: '🌟 Full Body Principiantes (Aesthetic Foundation)',
        badge: 'Iniciación',
        level: 'Principiante',
        daysPerWeek: '3 días/sem',
        description: 'La base innegociable para empezar a construir un físico estético y fuerte con los ejercicios multiarticulares más seguros y efectivos.',
        guidelines: [
            'Frecuencia: Entrena 3 días no consecutivos por semana (ej: Lunes, Miércoles y Viernes).',
            'Descansa entre 90 y 120 segundos para maximizar el rendimiento en cada serie.'
        ],
        days: [
            {
                id: 'day_fullbody_a',
                name: 'Día A: Sentadilla, Banca y Jalón',
                focus: 'Cuerpo Completo - Enfoque Empuje',
                exercises: [
                    { exerciseId: 'sentadilla_trasera', sets: 3, targetReps: '8 - 10', targetWeightKg: 30, restSeconds: 120 },
                    { exerciseId: 'press_banca_plano', sets: 3, targetReps: '8 - 10', targetWeightKg: 35, restSeconds: 120 },
                    { exerciseId: 'jalon_al_pecho', sets: 3, targetReps: '10 - 12', targetWeightKg: 35, restSeconds: 90 },
                    { exerciseId: 'extensiones_triceps_polea', sets: 2, targetReps: '12 - 15', targetWeightKg: 15, restSeconds: 60 },
                    { exerciseId: 'plancha_abdominal', sets: 3, targetReps: '45s', targetWeightKg: 0, restSeconds: 60 }
                ]
            },
            {
                id: 'day_fullbody_b',
                name: 'Día B: Prensa, Militar y Remo',
                focus: 'Cuerpo Completo - Enfoque Hombro & Espalda',
                exercises: [
                    { exerciseId: 'prensa_de_piernas', sets: 3, targetReps: '10 - 12', targetWeightKg: 70, restSeconds: 120 },
                    { exerciseId: 'press_militar_barra', sets: 3, targetReps: '8 - 10', targetWeightKg: 20, restSeconds: 90 },
                    { exerciseId: 'remo_con_barra', sets: 3, targetReps: '8 - 10', targetWeightKg: 30, restSeconds: 90 },
                    { exerciseId: 'curl_biceps_barra_z', sets: 2, targetReps: '10 - 12', targetWeightKg: 15, restSeconds: 60 }
                ]
            }
        ]
    }
];

window.MUSCLE_GROUPS = MUSCLE_GROUPS;
window.EXERCISES_DATABASE = EXERCISES_DATABASE;
window.PRELOADED_ROUTINES = PRELOADED_ROUTINES;
window.getExerciseSvg = getExerciseSvg;
