let indice = 0;
let aciertos = 0;
let bancoPreguntas = [];

const txtTitulo = document.querySelector(".main-header h1");
const txtPregunta = document.getElementById("pregunta-texto");
const contenedorOpciones = document.getElementById("opciones-container");
const barraRelleno = document.getElementById("barra-progreso-relleno");
const txtProgreso = document.getElementById("progreso");
const txtPuntos = document.getElementById("puntos");

const urlParams = new URLSearchParams(window.location.search);
const nombreTest = urlParams.get('test'); 

// --- INICIO: Lógica para cargar Test o generar Menú ---
if (nombreTest) {
    import(`./data/${nombreTest}.js`)
        .then(modulo => {
            txtTitulo.innerText = modulo.datosTest.titulo;
            bancoPreguntas = modulo.datosTest.preguntas;
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
    
    // Apuntamos al contenedor de botones del menú
    const contenedorMenu = document.getElementById("menu-botones");
    if (!contenedorMenu) return;

    contenedorMenu.innerHTML = ""; 

    for (const nombre of listaTests) {
        try {
            const modulo = await import(`./data/${nombre}.js`);
            const btn = document.createElement("button");
            
            // Usamos solo el título
            btn.innerText = modulo.datosTest.titulo; 
            btn.classList.add("opcion-btn");
            btn.onclick = () => window.location.href = `index.html?test=${nombre}`;
            
            contenedorMenu.appendChild(btn);
        } catch (error) {
            console.error("No se pudo cargar el título de:", nombre);
        }
    }
}
// --- FIN DE LÓGICA DE MENÚ ---

function cargarPregunta() {
    contenedorOpciones.innerHTML = "";
    
    if (indice >= bancoPreguntas.length) {
        mostrarResultadoFinal();
        return;
    }

    const p = bancoPreguntas[indice];
    txtPregunta.innerText = p.q;
    
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
    
    // Bloqueamos clics adicionales
    botones.forEach(btn => btn.style.pointerEvents = "none");

    const esCorrecta = (seleccion === pActual.correcta);
    let tiempoEspera = 1000; // 1 segundo si acierta

    if (esCorrecta) {
        aciertos++;
        evento.target.classList.add("correcto");
    } else {
        // El usuario falló
        tiempoEspera = 2000; // 2 segundos si falla para que le dé tiempo a ver la buena
        
        // Marcamos la elegida como incorrecta
        evento.target.classList.add("incorrecto");
        
        // Buscamos el botón correcto, le ponemos color verde y lo agrandamos
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
    txtPregunta.innerText = "Test finalizado";
    
    contenedorOpciones.innerHTML = `
        <div style="text-align: center;">
            <h2 style="font-size: 3rem; color: #2c3e50;">${nota.toFixed(1)}</h2>
            <button onclick="location.reload()" class="opcion-btn" style="text-align:center; background:#3498db; color:white;">Repetir Test</button>
            <button onclick="window.location.href='index.html'" class="opcion-btn" style="text-align:center; margin-top:10px;">Inicio</button>
        </div>
    `;
}