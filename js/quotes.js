// ===================================================================
// CATÁLOGO DE FRASES CÉLEBRES DE CULTURISTAS FAMOSOS EN ESPAÑOL
// ===================================================================

const BODYBUILDER_QUOTES = [
    {
        quote: "¡Sí amigo, peso pluma! ¡A por ello con todo!",
        author: "Ronnie Coleman",
        title: "8× Mr. Olympia"
    },
    {
        quote: "Todo el mundo quiere ser culturista, pero nadie quiere levantar pesos verdaderamente pesados.",
        author: "Ronnie Coleman",
        title: "8× Mr. Olympia"
    },
    {
        quote: "Las últimas tres o cuatro repeticiones son las que hacen crecer el músculo. Esa zona de dolor divide a un campeón de quien no lo es.",
        author: "Arnold Schwarzenegger",
        title: "7× Mr. Olympia"
    },
    {
        quote: "La mente es el límite. Mientras tu mente pueda imaginar que puedes lograr algo, realmente puedes hacerlo.",
        author: "Arnold Schwarzenegger",
        title: "7× Mr. Olympia"
    },
    {
        quote: "El verdadero campeón es aquel capaz de atravesar la barrera del dolor sin vacilar.",
        author: "Tom Platz",
        title: "La Leyenda de las Piernas Doradas"
    },
    {
        quote: "Cuando sientas que no puedes más, recuerda que la mente siempre se rinde mucho antes que el cuerpo.",
        author: "Tom Platz",
        title: "Golden Era Legend"
    },
    {
        quote: "Los campeones se construyen en la oscuridad, en esas repeticiones en las que nadie te está mirando.",
        author: "Chris Bumstead (CBum)",
        title: "5× Mr. Olympia Classic Physique"
    },
    {
        quote: "No busques atajos. El camino difícil y exigente es el único que forja un físico legendario.",
        author: "Chris Bumstead (CBum)",
        title: "Classic Physique Icon"
    },
    {
        quote: "Cada entrenamiento es como un ladrillo en un edificio: sigue colocando ladrillos con precisión hasta levantar una fortaleza.",
        author: "Dorian Yates",
        title: "6× Mr. Olympia (Shadow Era)"
    },
    {
        quote: "Los ganadores hacen aquello que los demás temen hacer.",
        author: "Franco Columbu",
        title: "2× Mr. Olympia & Strongman"
    },
    {
        quote: "La constancia lo es todo. El físico perfecto se esculpe día a día, repetición a repetición.",
        author: "Frank Zane",
        title: "3× Mr. Olympia (The King of Aesthetics)"
    },
    {
        quote: "La obsesión es simplemente como las personas perezosas llaman a la verdadera disciplina.",
        author: "David Laid",
        title: "Aesthetic Era Pioneer"
    },
    {
        quote: "Todos lo vamos a lograr, hermano. Deja las excusas y ve a levantar barras.",
        author: "Zyzz (Aziz Shavershian)",
        title: "Padre de la Generación Aesthetic"
    },
    {
        quote: "Estimula el músculo, no lo aniquiles. La inteligencia supera a la fuerza ciega.",
        author: "Lee Haney",
        title: "8× Mr. Olympia"
    },
    {
        quote: "Si eres capaz de visualizar tu meta y estás dispuesto a pagar el precio del sudor, nada te detendrá.",
        author: "Lou Ferrigno",
        title: "IFBB Legend & The Incredible Hulk"
    },
    {
        quote: "Cuando creas que has llegado a tu límite, haz una repetición más. Ahí reside la grandeza.",
        author: "Branch Warren",
        title: "2× Arnold Classic Champion"
    }
];

const QuotesService = {
    currentIndex: -1,

    getRandomQuote() {
        if (BODYBUILDER_QUOTES.length === 0) return null;
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * BODYBUILDER_QUOTES.length);
        } while (nextIndex === this.currentIndex && BODYBUILDER_QUOTES.length > 1);
        
        this.currentIndex = nextIndex;
        return BODYBUILDER_QUOTES[nextIndex];
    },

    renderQuoteInElement(quoteTextEl, quoteAuthorEl, quoteTitleEl) {
        const quoteObj = this.getRandomQuote();
        if (!quoteObj) return;

        if (quoteTextEl) {
            quoteTextEl.style.opacity = '0';
            setTimeout(() => {
                quoteTextEl.textContent = `“${quoteObj.quote}”`;
                quoteTextEl.style.opacity = '1';
            }, 150);
        }

        if (quoteAuthorEl) {
            quoteAuthorEl.style.opacity = '0';
            setTimeout(() => {
                quoteAuthorEl.textContent = quoteObj.author;
                quoteAuthorEl.style.opacity = '1';
            }, 150);
        }

        if (quoteTitleEl) {
            quoteTitleEl.style.opacity = '0';
            setTimeout(() => {
                quoteTitleEl.textContent = quoteObj.title;
                quoteTitleEl.style.opacity = '1';
            }, 150);
        }
    }
};

window.QuotesService = QuotesService;
