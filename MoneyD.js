const incomeInput = document.getElementById('monthly-income');
const setIncomeBtn = document.getElementById('set-income-btn');
const expenseAmountInput = document.getElementById('expense-amount');
const expensePeriodSelect = document.getElementById('expense-period');
const expenseCategorySelect = document.getElementById('expense-category');
const addExpenseBtn = document.getElementById('add-expense-btn');
const totalExpensesEl = document.getElementById('total-expenses');
const balanceEl = document.getElementById('balance');
const resetBtn = document.getElementById('reset-btn'); // Botón de reiniciar

let totalExpenses = 0;
let monthlyIncome = 0;

require('dotenv').config();
const sql = require('mssql');

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, // Si estás en Azure, usa esta opción
        trustServerCertificate: true // Si es local
    }
};

async function connectToDatabase() {
    try {
        await sql.connect(dbConfig);
        console.log('Conectado a SQL Server');
    } catch (error) {
        console.error('Error conectando a SQL Server:', error);
    }
}

connectToDatabase();

const express = require('express');
const app = express();
app.use(express.json());

// Crear usuario
app.post('/usuarios', async (req, res) => {
    const { nombre, correo } = req.body;
    try {
        const result = await sql.query`INSERT INTO Usuarios (Nombre, Correo) VALUES (${nombre}, ${correo})`;
        res.status(201).json({ message: 'Usuario creado', usuarioID: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
});

// Crear boleta
app.post('/boletas', async (req, res) => {
    const { usuarioID, fecha, total, comercio } = req.body;
    try {
        await sql.query`INSERT INTO Boletas (UsuarioID, Fecha, Total, Comercio) VALUES (${usuarioID}, ${fecha}, ${total}, ${comercio})`;
        res.status(201).json({ message: 'Boleta creada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la boleta' });
    }
});

// Obtener boletas de un usuario
app.get('/boletas/:usuarioID', async (req, res) => {
    const { usuarioID } = req.params;
    try {
        const result = await sql.query`SELECT * FROM Boletas WHERE UsuarioID = ${usuarioID}`;
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener boletas' });
    }
});

async function agregarBoleta(boletaData) {
    try {
        const response = await fetch('http://localhost:3000/api/boletas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(boletaData)
        });

        const data = await response.json();
        console.log(data.message); // Mensaje de confirmación
    } catch (error) {
        console.error('Error al enviar la boleta:', error);
    }
}


// Establecer ingresos
setIncomeBtn.addEventListener('click', () => {
    monthlyIncome = parseFloat(incomeInput.value);
    if (!isNaN(monthlyIncome) && monthlyIncome > 0) {
        alert(`Ingresos establecidos: $${monthlyIncome}`);
        storeIncome(monthlyIncome); // Guardar ingresos en localStorage
        updateBalance();
    } else {
        alert('Por favor, ingrese un valor válido de ingresos.');
    }
});

// Agregar gasto
addExpenseBtn.addEventListener('click', () => {
    const amount = parseFloat(expenseAmountInput.value);
    const period = expensePeriodSelect.value;
    const category = expenseCategorySelect.value;

    if (!isNaN(amount) && amount > 0) {
        let adjustedAmount = adjustExpense(amount, period);
        totalExpenses += adjustedAmount;

        // Guardar el gasto en localStorage
        const newExpense = { amount, period, category };
        storeExpense(newExpense);

        updateExpenses();
        updateBalance();
        updateChart(); // Actualizamos el gráfico con los nuevos datos
    } else {
        alert('Ingrese un monto válido para el gasto.');
    }
});

// Reiniciar la aplicación
resetBtn.addEventListener('click', () => {
    totalExpenses = 0;
    monthlyIncome = 0;

    // Limpiar los inputs
    incomeInput.value = '';
    expenseAmountInput.value = '';
    expensePeriodSelect.value = 'monthly';
    expenseCategorySelect.value = 'food';
    
    // Borrar los datos almacenados
    localStorage.removeItem('monthlyIncome');
    localStorage.removeItem('expenses');

    // Actualizar la UI
    updateExpenses();
    updateBalance();
    updateChart();
    document.getElementById('recommendations').textContent = ''; // Limpiar recomendaciones
});

function adjustExpense(amount, period) {
    if (period === 'daily') {
        return amount * 30;  // Ajuste a mensual
    } else if (period === 'annual') {
        return amount / 12;  // Ajuste a mensual
    }
    return amount;  // Mensual
}

function updateExpenses() {
    totalExpensesEl.textContent = `Gastos Totales: $${totalExpenses.toFixed(2)}`;
}

function updateBalance() {
    const balance = monthlyIncome - totalExpenses;
    balanceEl.textContent = `Balance: $${balance.toFixed(2)}`;
    balanceEl.style.color = balance >= 0 ? 'green' : 'red';

    const recommendationsEl = document.getElementById('recommendations');
    if (balance < 0) {
        recommendationsEl.textContent = "Tus gastos están excediendo tus ingresos. Considera reducir gastos en algunas categorías.";
    } else {
        recommendationsEl.textContent = "";
    }
}

// Guardar ingresos y gastos en localStorage
function storeIncome(income) {
    localStorage.setItem('monthlyIncome', income);
}

function storeExpense(expense) {
    let expenses = getStoredExpenses();
    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function getStoredExpenses() {
    return JSON.parse(localStorage.getItem('expenses')) || [];
}

// Actualizar el gráfico de gastos
let chart; // Variable para almacenar el gráfico
function updateChart() {
    const ctx = document.getElementById('expenses-chart').getContext('2d');
    
    const categories = ['Alimentación', 'Transporte', 'Entretenimiento', 'Otros'];
    const expensesByCategory = getExpensesByCategory();

    if (chart) {
        chart.destroy(); // Destruir el gráfico anterior para crear uno nuevo
    }

    chart = new Chart(ctx, {
        type: 'pie', 
        data: {
            labels: categories,
            datasets: [{
                label: 'Gastos por Categoría',
                data: expensesByCategory,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
            }]
        },
        options: {
            responsive: true,
        }
    });
}

function getExpensesByCategory() {
    const categories = ['food', 'transport', 'entertainment', 'other'];
    const expenses = getStoredExpenses(); 
    let totals = [0, 0, 0, 0]; 

    expenses.forEach(expense => {
        const index = categories.indexOf(expense.category);
        if (index > -1) {
            totals[index] += adjustExpense(expense.amount, expense.period);
        }
    });

    return totals;
}

// Establecer ingresos cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    const storedIncome = localStorage.getItem('monthlyIncome');
    if (storedIncome) {
        monthlyIncome = parseFloat(storedIncome);
        updateBalance();
    }

    const storedExpenses = getStoredExpenses();
    storedExpenses.forEach(expense => {
        totalExpenses += adjustExpense(expense.amount, expense.period);
    });

    updateExpenses();
    updateChart();
});
