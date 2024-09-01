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

let ingresos = [];
let gastos = [];

function registrar() {
    let tipo = document.getElementById('tipo').value;
    let fecha = document.getElementById('fecha').value.split('/');
    let dia = parseInt(fecha[0]);
    let mes = parseInt(fecha[1]);
    let anio = parseInt(fecha[2]);
    let monto = parseFloat(document.getElementById('monto').value);
    let descripcion = document.getElementById('descripcion').value;

    if (tipo === 'ingreso') {
        let ingreso = new Ingreso(dia, mes, anio, monto, descripcion);
        ingresos.push(ingreso);
    } else {
        let gasto = new Gasto(dia, mes, anio, monto, descripcion);
        gastos.push(gasto);
    }

    document.getElementById('fecha').value = '';
    document.getElementById('monto').value = '';
    document.getElementById('descripcion').value = '';
}

function mostrarBalance() {
    let balance = 0;
    for (let ingreso of ingresos) {
        balance += ingreso.monto;
    }
    for (let gasto of gastos) {
        balance -= gasto.monto;
    }
    document.getElementById('output').innerText = 'Balance total: ' + balance;
}

function mostrarHistorial() {
    let output = 'Ingresos:\n';
    for (let ingreso of ingresos) {
        output += `${ingreso.dia}/${ingreso.mes}/${ingreso.anio} - ${ingreso.monto} - ${ingreso.descripcion}\n`;
    }
    output += 'Gastos:\n';
    for (let gasto of gastos) {
        output += `${gasto.dia}/${gasto.mes}/${gasto.anio} - ${gasto.monto} - ${gasto.descripcion}\n`;
    }
    document.getElementById('output').innerText = output;
}
