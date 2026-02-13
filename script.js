let indice = 0;
let aciertos = 0;
let bancoPreguntas = [];

// Elementos del DOM
const txtTitulo = document.querySelector(".main-header h1");
const txtPregunta = document.getElementById("pregunta-texto");
const contenedorOpciones = document.getElementById("opciones-container");
const barraRelleno = document.getElementById("barra-progreso-relleno");
const txtProgreso = document.getElementById("progreso");
const txtPuntos = document.getElementById("puntos");
const audioFondo = document.getElementById("musica-fondo");

// Configuración inicial de audio
if (audioFondo) {
    audioFondo.volume = 0.15;
}

// Imagen de personaje
const imgPersonaje = document.createElement("img");
imgPersonaje.id = "personaje-img";
imgPersonaje.style.display = "none";

const urlParams = new URLSearchParams(window.location.search);
const nombreTest = urlParams.get('test');

/* =========================================
   LÓGICA DE AUDIO (Móvil y PC)
   ========================================= */

// Función GLOBAL para el botón de Mute (para que el HTML la vea)
window.toggleMute = function() {
    const btn = document.getElementById("btn-mute");
    if (!audioFondo || !btn) return;

    if (audioFondo.muted) {
        audioFondo.muted = false;
        btn.innerText = "🔊";
        btn.style.opacity = "1";
    } else {
        audioFondo.muted = true;
        btn.innerText = "🔇";
        btn.style.opacity = "0.5";
    }
};

function arrancarMusica() {
    if (audioFondo) {
        audioFondo.play().catch(err => console.log("Esperando interacción..."));
    }
    // Quitamos los listeners para que no intente activarse en cada clic
    document.removeEventListener('click', arrancarMusica);
    document.removeEventListener('touchstart', arrancarMusica);
}

// Escuchamos el primer toque en cualquier sitio para activar el sonido
document.addEventListener('click', arrancarMusica);
document.addEventListener('touchstart', arrancarMusica);

/* =========================================
   INICIO DEL JUEGO / MENÚ
   ========================================= */
if (nombreTest) {
    import(`./data/${nombreTest}.js`)
        .then(modulo => {
            if (txtTitulo) txtTitulo.innerHTML = modulo.datosTest.titulo;
            bancoPreguntas = modulo.datosTest.preguntas;
            cargarPregunta();
        })
        .catch(err => {
            if (txtPregunta) txtPregunta.innerText = "Error al cargar el test.";
            console.error(err);
        });
} else {
    generarMenu();
}

async function generarMenu() {
    const { listaTests } = await import('./data/lista_tests.js');
    const contenedorMenu = document.getElementById("menu-botones");
    if (!contenedorMenu) return;

    contenedorMenu.innerHTML = ""; 
    
    const portada = document.createElement("img");
    portada.src = "./img/logoimagen.png";
    portada.classList.add("img-portada");
    contenedorMenu.appendChild(portada);

    for (const nombre of listaTests) {
        try {
            const modulo = await import(`./data/${nombre}.js`);
            const btn = document.createElement("button");
            btn.innerText = modulo.datosTest.titulo; 
            btn.classList.add("opcion-btn");
            btn.onclick = () => window.location.href = `index.html?test=${nombre}`;
            contenedorMenu.appendChild(btn);
        } catch (error) {
            console.error("Error cargando:", nombre);
        }
    }
}

/* =========================================
   FLUJO DEL TEST
   ========================================= */
function cargarPregunta() {
    if (!contenedorOpciones) return;
    contenedorOpciones.innerHTML = "";
    
    if (indice >= bancoPreguntas.length) {
        mostrarResultadoFinal();
        return;
    }

    const p = bancoPreguntas[indice];
    txtPregunta.innerText = p.q;
    
    if (p.personaje) {
        imgPersonaje.src = `./img/${p.personaje}`;
        imgPersonaje.style.display = "block";
        txtPregunta.before(imgPersonaje);
    } else {
        imgPersonaje.style.display = "none";
    }
    
    const porcentaje = (indice / bancoPreguntas.length) * 100;
    if (barraRelleno) barraRelleno.style.width = `${porcentaje}%`;
    if (txtProgreso) txtProgreso.innerText = `Pregunta ${indice + 1} de ${bancoPreguntas.length}`;

    p.a.forEach((opcion, i) => {
        const btn = document.createElement("button");
        btn.innerText = opcion;
        btn.classList.add("opcion-btn");
        btn.onclick = (e) => validar(i, e); 
        contenedorOpciones.appendChild(btn);
    });
}

function validar(seleccion, evento) {
    const pActual = bancoPreguntas[indice];
    const botones = document.querySelectorAll("#opciones-container .opcion-btn");
    
    botones.forEach(btn => btn.style.pointerEvents = "none");

    const esCorrecta = (seleccion === pActual.correcta);
    let tiempoEspera = 1200;

    if (esCorrecta) {
        aciertos++;
        evento.target.classList.add("correcto");
    } else {
        tiempoEspera = 2500;
        evento.target.classList.add("incorrecto");
        botones[pActual.correcta].classList.add("correcto", "resaltar-correcta");
    }

    if (txtPuntos) txtPuntos.innerText = `Aciertos: ${aciertos}`;

    setTimeout(() => {
        indice++;
        cargarPregunta();
    }, tiempoEspera);
}

function mostrarResultadoFinal() {
    if (barraRelleno) barraRelleno.style.width = "100%";
    const nota = (aciertos / bancoPreguntas.length) * 10;
    
    imgPersonaje.style.display = "none";
    
    let mensajeFinal = "";
    let colorNota = "#e74c3c"; 

    if (nota < 5) {
        mensajeFinal = "¡Vuelve a ver la serie! Ni siquiera Eleven podría salvarte con esa puntuación. Estás atrapado en el Upside Down.";
        txtPregunta.innerText = "¡PERDISTE!";
        if (audioFondo) audioFondo.volume = 0.05;
    } else if (nota < 9) {
        mensajeFinal = "¡No está mal! Has sobrevivido, pero te falta mucho para ser un experto en Hawkins.";
        txtPregunta.innerText = "¡SOBREVIVISTE!";
        colorNota = "#f1c40f"; 
    } else {
        mensajeFinal = "¡Increíble! Eres un auténtico miembro de The Party. Hopper estaría orgulloso.";
        txtPregunta.innerText = "¡MAESTRO DE HAWKINS!";
        colorNota = "#2ecc71";
    }

    contenedorOpciones.innerHTML = `
        <div class="resultado-final-container">
            <img src="./img/logoimagenfin.png" class="img-portada-fin">
            <h2 style="font-size: 4rem; color: ${colorNota}; text-shadow: 0 0 15px ${colorNota}; margin: 10px 0;">
                ${nota.toFixed(1)}
            </h2>
            <p style="font-family: 'Press Start 2P'; font-size: 0.7rem; color: #fff; margin-bottom: 20px; padding: 0 20px; line-height: 1.6;">
                ${mensajeFinal}
            </p>
            <button onclick="location.reload()" class="opcion-btn" style="width: 220px; background:#e74c3c; color:white; text-align:center; margin: 0 auto;">
                REINTENTAR
            </button>
            <button onclick="window.location.href='index.html'" class="opcion-btn" style="width: 220px; margin: 10px auto; text-align:center;">
                VOLVER AL MENÚ
            </button>
        </div>
    `;
}