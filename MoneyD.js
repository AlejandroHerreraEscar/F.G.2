// Referencias a elementos del DOM
const incomeInput = document.getElementById('monthly-income');
const setIncomeBtn = document.getElementById('set-income-btn');
const expenseAmountInput = document.getElementById('expense-amount');
const expensePeriodSelect = document.getElementById('expense-period');
const expenseCategorySelect = document.getElementById('expense-category');
const addExpenseBtn = document.getElementById('add-expense-btn');
const totalExpensesEl = document.getElementById('total-expenses');
const balanceEl = document.getElementById('balance');
const resetBtn = document.getElementById('reset-btn');
const saveDataBtn = document.getElementById('save-data-btn');
const compareDataBtn = document.getElementById('compare-data-btn');
const viewMonthsBtn = document.getElementById('view-months-btn');
const deleteMonthsBtn = document.getElementById('delete-months-btn');
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const monthsListEl = document.getElementById('months-list');
const logContainer = document.createElement('div');
logContainer.className = 'log-container';
document.body.appendChild(logContainer);

// Variables de estado
let totalExpenses = 0;
let monthlyIncome = 0;
let expenseCategories = {};
let savedMonths = {};

// Inicialización del gráfico
const ctx = document.getElementById('expenses-chart').getContext('2d');
let expensesChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: [],
        datasets: [{
            label: 'Gastos por Categoría',
            data: [],
            backgroundColor: []
        }]
    }
});

// Función para mostrar mensajes en log
function logMessage(message) {
    const log = document.createElement('div');
    log.className = 'alert';
    log.textContent = message;
    logContainer.appendChild(log);
    setTimeout(() => log.remove(), 5000); // Remover el mensaje después de 5 segundos
}

// Cargar datos guardados al iniciar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    const savedData = localStorage.getItem('budgetAppData');
    if (savedData) {
        const data = JSON.parse(savedData);
        totalExpenses = data.totalExpenses;
        monthlyIncome = data.monthlyIncome;
        expenseCategories = data.expenseCategories;
        savedMonths = data.savedMonths;
        updateExpenses();
        updateBalance();
        updateChart();
        logMessage('Datos cargados desde el almacenamiento local.');
    }
});

// Establecer ingresos
setIncomeBtn.addEventListener('click', () => {
    const income = parseFloat(incomeInput.value);
    if (!isNaN(income) && income > 0) {
        monthlyIncome = income;
        updateBalance();
        logMessage(`Ingresos establecidos: $${monthlyIncome}`);
        saveData();
    } else {
        logMessage('Por favor, ingrese un valor válido de ingresos.');
    }
});

// Convertir gasto a base mensual
function convertExpense(amount, period) {
    switch (period) {
        case 'daily':
            return amount * 30; // Aproximación de 30 días en un mes
        case 'annual':
            return amount / 12; // Dividir gasto anual por 12 meses
        case 'monthly':
        default:
            return amount;
    }
}

// Agregar gasto
addExpenseBtn.addEventListener('click', () => {
    const amount = parseFloat(expenseAmountInput.value);
    const period = expensePeriodSelect.value;
    const category = expenseCategorySelect.value;
    if (!isNaN(amount) && amount > 0) {
        const monthlyAmount = convertExpense(amount, period);
        totalExpenses += monthlyAmount;

        // Actualizar datos de categorías
        expenseCategories[category] = (expenseCategories[category] || 0) + monthlyAmount;

        updateExpenses();
        updateBalance();
        updateChart();
        logMessage(`Gasto agregado: ${category} - $${monthlyAmount.toFixed(2)}`);
        saveData();
    } else {
        logMessage('Por favor, ingrese un monto válido para el gasto.');
    }
});

// Colores por categoría
const categoryColors = {
    Alimentacion: '#FF6384',
    Transporte: '#36A2EB',
    Entretenimiento: '#FFCE56',
    Arriendo: '#4BC0C0',
    Cuentas: '#9966FF',
    Impuestos: '#FF9F40',
    Deudas: '#FFCD56',
    Otros: '#C9CBCF'
};

// Actualizar el gráfico
function updateChart() {
    expensesChart.data.labels = Object.keys(expenseCategories);
    expensesChart.data.datasets[0].data = Object.values(expenseCategories);
    expensesChart.data.datasets[0].backgroundColor = Object.keys(expenseCategories).map(category => categoryColors[category] || '#C9CBCF');
    expensesChart.update();
}

// Funciones para actualizar UI
function updateExpenses() {
    totalExpensesEl.textContent = `Gastos Totales: $${totalExpenses.toFixed(2)}`;
}

function updateBalance() {
    const balance = monthlyIncome - totalExpenses;
    balanceEl.textContent = `Balance: $${balance.toFixed(2)}`;
}

// Guardar datos en localStorage
function saveData() {
    const data = {
        totalExpenses,
        monthlyIncome,
        expenseCategories,
        savedMonths
    };
    localStorage.setItem('budgetAppData', JSON.stringify(data));
}

// Mostrar y cerrar el modal
viewMonthsBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    monthsListEl.innerHTML = '';
    Object.keys(savedMonths).forEach(month => {
        const li = document.createElement('li');
        li.textContent = `${month}: Ingresos - $${savedMonths[month].income}, Gastos - $${savedMonths[month].expenses}`;
        monthsListEl.appendChild(li);
    });
    logMessage('Mostrando meses guardados.');
});

closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    logMessage('Cerrando ventana de meses guardados.');
});

// Guardar datos del mes
saveDataBtn.addEventListener('click', () => {
    const month = prompt('Ingrese el nombre del mes (e.g., enero, febrero):').toLowerCase();
    const validMonths = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    if (validMonths.includes(month)) {
        if (Object.keys(savedMonths).length < 12 || savedMonths.hasOwnProperty(month)) {
            savedMonths[month] = {
                income: monthlyIncome,
                expenses: totalExpenses
            };
            logMessage(`Datos guardados para el mes de ${month}`);
            saveData();
        } else {
            logMessage('Capacidad máxima de almacenamiento alcanzada (12 meses).');
        }
    } else {
        logMessage('Por favor, ingrese un mes válido.');
    }
});

// Borrar datos de los meses guardados
deleteMonthsBtn.addEventListener('click', () => {
    if (confirm('¿Está seguro de que desea borrar todos los meses guardados?')) {
        savedMonths = {};
        saveData();
        logMessage('Todos los datos de los meses guardados han sido borrados.');
    }
});

// Función de comparación (puedes añadir lógica específica según sea necesario)
compareDataBtn.addEventListener('click', () => {
    if (Object.keys(savedMonths).length > 1) {
        let comparison = 'Comparación de Meses:\n';
        for (const month in savedMonths) {
            comparison += `${month}: Ingresos - $${savedMonths[month].income}, Gastos - $${savedMonths[month].expenses}\n`;
        }
        logMessage(comparison);
    } else {
        logMessage('Se necesita al menos dos meses de datos para comparar.');
    }
});

// Reiniciar datos
resetBtn.addEventListener('click', () => {
    totalExpenses = 0;
    monthlyIncome = 0;
    expenseCategories = {};
    incomeInput.value = '';
    expenseAmountInput.value = '';
    updateExpenses();
    updateBalance();
    updateChart();
    saveData();
    logMessage('Datos reiniciados.');
});
