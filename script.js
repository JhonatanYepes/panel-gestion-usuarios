// ==========================================
// 1. VARIABLES GLOBALES Y SELECTORES DEL DOM
// ==========================================
let usuarios = [];
let idEnEdicion = null; // Variable para saber si estamos editando un usuario (guarda su ID)

const mensajeEstado = document.querySelector('#mensaje-estado');
const tablaUsuarios = document.querySelector('#tabla-usuarios tbody');
const userForm = document.querySelector('#user-form');
const btnSubmit = document.querySelector('#btn-submit');

const inputId = document.querySelector('#id-user');
const inputNombre = document.querySelector('#nombre-user');
const inputCorreo = document.querySelector('#correo-user');
const inputCiudad = document.querySelector('#ciudad-user');

const inputBuscarId = document.querySelector('#buscar-id');
const btnBuscar = document.querySelector('.btn-buscar');

// ==========================================
// 2. CONSUMO DE API (FETCH, ASYNC/AWAIT, MAP)
// ==========================================
async function cargarUsuarios() {
    try {
        mensajeEstado.textContent = "Cargando...";

        const respuesta = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!respuesta.ok) {
            throw new Error("No se pudo conectar con el servidor");
        }

        const datos = await respuesta.json();

        // Usamos map() para transformar los datos al formato requerido
        usuarios = datos.map(user => ({
            id: Number(user.id),
            nombre: user.name,
            correo: user.email,
            ciudad: user.address.city
        }));

        // Imprimir el arreglo completo con JSON.stringify (exigido por la rúbrica)
        console.log(JSON.stringify(usuarios));

        mensajeEstado.textContent = "Usuarios cargados correctamente.";
        renderizarTabla(usuarios);

    } catch (error) {
        console.error(error);
        mensajeEstado.textContent = "Hubo un error al cargar los usuarios. Intenta más tarde.";
    }
}

// ==========================================
// 3. RENDERIZAR LA TABLA DINÁMICAMENTE
// ==========================================
function renderizarTabla(listaUsuarios) {
    tablaUsuarios.innerHTML = ""; // Limpiar tabla antes de pintar

    // Uso de un bucle for tradicional (exigido en fundamentos del lenguaje)
    for (let i = 0; i < listaUsuarios.length; i++) {
        const u = listaUsuarios[i];
        
        // Destructuring para extraer los campos del usuario
        const { id, nombre, correo, ciudad } = u;

        // Template strings para armar el HTML de cada fila
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${id}</td>
            <td>${nombre}</td>
            <td>${correo}</td>
            <td>${ciudad}</td>
            <td>
                <button class="btn-editar" data-id="${id}">Editar</button>
                <button class="btn-eliminar" data-id="${id}">Eliminar</button>
            </td>
        `;
        tablaUsuarios.appendChild(fila);
    }
}

// ==========================================
// 4. GESTIÓN DE USUARIOS (CREAR, VALIDAR, EDITAR, ELIMINAR)
// ==========================================

// Evento Submit del formulario (Crear o Guardar Cambios)
userForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Evita que se recargue la página

    const idVal = Number(inputId.value.trim());
    const nombreVal = inputNombre.value.trim();
    const correoVal = inputCorreo.value.trim();
    const ciudadVal = inputCiudad.value.trim();

   if (
    inputId.value.trim() === "" ||
    !Number.isInteger(idVal) ||
    idVal <= 0 ||
    !nombreVal ||
    !correoVal ||
    !ciudadVal
) {
    mensajeEstado.textContent =
        "Ingresa un ID entero positivo y completa todos los campos.";
    return;
}

    if (!correoVal.includes('@')) {
        mensajeEstado.textContent = "Error: El correo electrónico debe contener '@'.";
        return;
    }

    // Si NO estamos en modo edición, validamos que el ID no exista
    if (idEnEdicion === null) {
        const existe = usuarios.some(u => u.id === idVal);
        if (existe) {
            mensajeEstado.textContent = `Ya existe un usuario con el ID ${idVal}.`;
            return;
        }

        // Crear nuevo usuario
        const nuevoUsuario = {
            id: idVal,
            nombre: nombreVal,
            correo: correoVal,
            ciudad: ciudadVal
        };

        usuarios.push(nuevoUsuario);
        mensajeEstado.textContent = `¡Usuario ${nombreVal} agregado exitosamente!`;
    } else {
        // Modo edición: Actualizar datos existentes
        const index = usuarios.findIndex(u => u.id === idEnEdicion);
        if (index !== -1) {
            usuarios[index].nombre = nombreVal;
            usuarios[index].correo = correoVal;
            usuarios[index].ciudad = ciudadVal;
            mensajeEstado.textContent = `¡Usuario con ID ${idEnEdicion} modificado exitosamente!`;
        }

        // Restaurar estado del formulario y desbloquear ID
        idEnEdicion = null;
        inputId.disabled = false;
        btnSubmit.textContent = "Agregar";
    }

    // Limpiar formulario y redibujar tabla
    userForm.reset();
    renderizarTabla(usuarios);
    console.log(JSON.stringify(usuarios));
});

// Delegación de eventos en la tabla para los botones "Editar" y "Eliminar"
tablaUsuarios.addEventListener('click', (e) => {
    const target = e.target;
    const idTarget = Number(target.getAttribute('data-id'));

    // ACCIÓN: ELIMINAR
    if (target.classList.contains('btn-eliminar')) {
        const confirmar = confirm(`¿Estás seguro de que deseas eliminar al usuario con ID ${idTarget}?`);
        if (confirmar) {
            // Usamos filter para quitar el usuario del array
            usuarios = usuarios.filter(u => u.id !== idTarget);
            mensajeEstado.textContent = `Usuario con ID ${idTarget} eliminado correctamente.`;
            renderizarTabla(usuarios);
            console.log(JSON.stringify(usuarios));
        }
    }

    // ACCIÓN: EDITAR
    if (target.classList.contains('btn-editar')) {
        const usuarioAEditar = usuarios.find(u => u.id === idTarget);
        if (usuarioAEditar) {
            // Llenar el formulario con los datos del usuario
            inputId.value = usuarioAEditar.id;
            inputNombre.value = usuarioAEditar.nombre;
            inputCorreo.value = usuarioAEditar.correo;
            inputCiudad.value = usuarioAEditar.ciudad;

            // Bloquear el ID para que no se pueda modificar
            inputId.disabled = true;
            idEnEdicion = usuarioAEditar.id;

            // Cambiar texto del botón a Guardar Cambios
            btnSubmit.textContent = "Guardar cambios";
            mensajeEstado.textContent = `Editando al usuario con ID ${idTarget}. Modifica los datos y presiona Guardar cambios.`;
        }
    }
});


// Búsqueda en vivo de usuarios por nombre

inputBuscarId.addEventListener('input', () => {
    const busqueda = inputBuscarId.value.trim().toLowerCase();

    const resultados = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(busqueda)
    );

    renderizarTabla(resultados);
    
});

// Buscar por nombre al pulsar el botón
btnBuscar.addEventListener('click', () => {
    const busqueda = inputBuscarId.value.trim().toLowerCase();

    const resultados = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(busqueda)
    );

    renderizarTabla(resultados);

    mensajeEstado.textContent = busqueda === ""
        ? "Mostrando todos los usuarios."
        : resultados.length > 0
            ? `Se encontraron ${resultados.length} usuario(s).`
            : "No se encontraron usuarios con ese nombre.";
});

// ==========================================
// INICIALIZACIÓN
// ==========================================
cargarUsuarios();