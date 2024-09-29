class Ingreso {
    constructor(dia, mes, anio, monto, descripcion) {
        this.dia = dia;
        this.mes = mes;
        this.anio = anio;
        this.monto = monto;
        this.descripcion = descripcion;
    }
}

class Gasto {
    constructor(dia, mes, anio, monto, descripcion) {
        this.dia = dia;
        this.mes = mes;
        this.anio = anio;
        this.monto = monto;
        this.descripcion = descripcion;
    }
}

// Usuario actual que ha iniciado sesión
let usuarioActual = null;

// Cargar usuarios desde localStorage o inicializar un objeto vacío
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || {};

function guardarUsuarios() {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

function login() {
    let usuario = document.getElementById('usuario').value;
    
    if (!usuario) {
        alert('Por favor, ingrese un nombre de usuario.');
        return;
    }

    // Verificar si el usuario ya existe
    if (!usuarios[usuario]) {
        // Si el usuario no existe, lo creamos y guardamos en localStorage
        usuarios[usuario] = {
            ingresos: [],
            gastos: []
        };
        guardarUsuarios();
        alert(`Nuevo usuario creado: ${usuario}`);
    }

    // Iniciar sesión con el usuario
    usuarioActual = usuario;
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    // Mostrar el historial del usuario
    mostrarHistorial();
}

function registrar() {
    let tipo = document.getElementById('tipo').value;
    let fecha = document.getElementById('fecha').value.split('/');
    let dia = parseInt(fecha[0]);
    let mes = parseInt(fecha[1]);
    let anio = parseInt(fecha[2]);
    let monto = parseFloat(document.getElementById('monto').value);
    let descripcion = document.getElementById('descripcion').value;

    if (usuarioActual === null) {
        alert('Debe iniciar sesión antes de registrar un ingreso o gasto.');
        return;
    }

    if (tipo === 'ingreso') {
        let ingreso = new Ingreso(dia, mes, anio, monto, descripcion);
        usuarios[usuarioActual].ingresos.push(ingreso);
    } else {
        let gasto = new Gasto(dia, mes, anio, monto, descripcion);
        usuarios[usuarioActual].gastos.push(gasto);
    }

    // Guardar el registro en localStorage
    guardarUsuarios();

    document.getElementById('fecha').value = '';
    document.getElementById('monto').value = '';
    document.getElementById('descripcion').value = '';
}

function mostrarBalance() {
    if (usuarioActual === null) {
        alert('Debe iniciar sesión para ver el balance.');
        return;
    }

    let balance = 0;
    for (let ingreso of usuarios[usuarioActual].ingresos) {
        balance += ingreso.monto;
    }
    for (let gasto of usuarios[usuarioActual].gastos) {
        balance -= gasto.monto;
    }
    document.getElementById('output').innerText = 'Balance total: ' + balance;
}

function mostrarHistorial() {
    if (usuarioActual === null) {
        alert('Debe iniciar sesión para ver el historial.');
        return;
    }

    // Crear el contenido para los ingresos
    let ingresosOutput = '<h3>Ingresos</h3>';
    ingresosOutput += `
        <table class="table">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Monto</th>
                    <th>Descripción</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let ingreso of usuarios[usuarioActual].ingresos) {
        ingresosOutput += `
            <tr>
                <td>${ingreso.dia}/${ingreso.mes}/${ingreso.anio}</td>
                <td>${ingreso.monto}</td>
                <td>${ingreso.descripcion}</td>
            </tr>
        `;
    }
    
    ingresosOutput += '</tbody></table>';

    // Crear el contenido para los gastos
    let gastosOutput = '<h3>Gastos</h3>';
    gastosOutput += `
        <table class="table">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Monto</th>
                    <th>Descripción</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let gasto of usuarios[usuarioActual].gastos) {
        gastosOutput += `
            <tr>
                <td>${gasto.dia}/${gasto.mes}/${gasto.anio}</td>
                <td>${gasto.monto}</td>
                <td>${gasto.descripcion}</td>
            </tr>
        `;
    }

    gastosOutput += '</tbody></table>';

    // Mostrar los datos en el contenedor 'output'
    document.getElementById('output').innerHTML = ingresosOutput + gastosOutput;
}