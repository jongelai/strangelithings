let indice = 0;
let aciertos = 0;
let bancoPreguntas = [];
let musicaFondo = null; // Para controlar el audio

const txtTitulo = document.querySelector(".main-header h1");
const txtPregunta = document.getElementById("pregunta-texto");
const contenedorOpciones = document.getElementById("opciones-container");
const barraRelleno = document.getElementById("barra-progreso-relleno");
const txtProgreso = document.getElementById("progreso");
const txtPuntos = document.getElementById("puntos");

// Crear el elemento de imagen para los personajes (Dustin, Eleven, etc.)
const imgPersonaje = document.createElement("img");
imgPersonaje.id = "personaje-img";
imgPersonaje.style.display = "none"; // Oculto hasta que haya una imagen

const urlParams = new URLSearchParams(window.location.search);
const nombreTest = urlParams.get('test'); 

// --- Lógica para cargar Test o generar Menú ---
if (nombreTest) {
    import(`./data/${nombreTest}.js`)
        .then(modulo => {
            txtTitulo.innerHTML = modulo.datosTest.titulo;
            bancoPreguntas = modulo.datosTest.preguntas;

            // Iniciar música si el test tiene el campo 'musica'
            if (modulo.datosTest.musica) {
                musicaFondo = new Audio(modulo.datosTest.musica);
                musicaFondo.loop = true;
                musicaFondo.volume = 0.4;
                // El navegador bloquea audio automático, se activará al primer clic
                document.addEventListener('click', () => musicaFondo.play(), { once: true });
            }

            cargarPregunta();
        })
        .catch(err => {
            txtPregunta.innerText = "Error al cargar el test.";
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
            console.error("No se pudo cargar el título de:", nombre);
        }
    }
}

function cargarPregunta() {
    contenedorOpciones.innerHTML = "";
    
    if (indice >= bancoPreguntas.length) {
        mostrarResultadoFinal();
        return;
    }

    const p = bancoPreguntas[indice];
    txtPregunta.innerText = p.q;
    
    // --- LÓGICA DE IMAGEN DE PERSONAJE ---
    if (p.personaje) {
        imgPersonaje.src = `./img/${p.personaje}`;
        imgPersonaje.style.display = "block";
        imgPersonaje.className = "img-personaje-estilo"; // Asegúrate de darle estilo en CSS
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
    let tiempoEspera = 1000;

    if (esCorrecta) {
        aciertos++;
        evento.target.classList.add("correcto");
    } else {
        tiempoEspera = 2500; // Un poco más de tiempo para ver la correcta agrandada
        evento.target.classList.add("incorrecto");
        
        // Buscamos la correcta para agrandarla
        const botonCorrecto = botones[pActual.correcta];
        botonCorrecto.classList.add("correcto", "resaltar-correcta");
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
    txtPregunta.innerText = "¡Has sobrevivido al Upside Down!";
    
    // Envolvemos todo en el nuevo contenedor para centrar
    contenedorOpciones.innerHTML = `
        <div class="resultado-final-container">
            <img src="./img/logoimagenfin.png" class="img-portada-fin">
            
            <h2 style="font-size: 3.5rem; color: #e74c3c; text-shadow: 0 0 15px red; margin: 10px 0;">
                ${nota.toFixed(1)}
            </h2>
            
            <p style="font-family: 'Press Start 2P'; font-size: 0.8rem; margin-bottom: 25px; color: #eee;">
                Tu puntuación final
            </p>
            
            <button onclick="location.reload()" class="opcion-btn" style="width: 200px; background:#e74c3c; color:white;">
                REINTENTAR
            </button>
            
            <button onclick="window.location.href='index.html'" class="opcion-btn" style="width: 200px; margin-top: 10px;">
                VOLVER AL MENÚ
            </button>
        </div>
    `;
}