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
    const labels = Object.keys(expenseCategories);
    const data = Object.values(expenseCategories);

    if (labels.length > 0 && data.length > 0) {
        expensesChart.data.labels = labels;
        expensesChart.data.datasets[0].data = data;
        expensesChart.data.datasets[0].backgroundColor = labels.map(
            category => categoryColors[category] || '#C9CBCF'
        );
        expensesChart.update();
    } else {
        logMessage('No hay datos para mostrar en el gráfico.');
    }
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
    monthsListEl.innerHTML = ''; // Limpiar la lista de meses guardados

    if (Object.keys(savedMonths).length > 0) {
        Object.keys(savedMonths).forEach(month => {
            const li = document.createElement('li');
            li.textContent = `${month}: Ingresos - $${savedMonths[month].income}, Gastos - $${savedMonths[month].expenses}`;
            
            // Cargar datos del mes seleccionado
            li.style.cursor = 'pointer';
            li.addEventListener('click', () => {
                loadMonthData(month); // Cargar datos del mes seleccionado
            });

            monthsListEl.appendChild(li);
        });
    } else {
        monthsListEl.textContent = 'No hay meses guardados.';
    }

    logMessage('Modal de meses abierto.');
});

// Cerrar el modal
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    logMessage('Modal cerrado.');
});

// Función para manejar el gráfico de comparación

// Guardar datos del mes
saveDataBtn.addEventListener('click', () => {
    const month = prompt('Ingrese el nombre del mes (e.g., enero, febrero):').toLowerCase();
    const validMonths = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    if (validMonths.includes(month)) {
        if (Object.keys(savedMonths).length < 12 || savedMonths.hasOwnProperty(month)) {
            savedMonths[month] = {
                income: monthlyIncome,
                expenses: totalExpenses,
                categoryExpenses: { ...expenseCategories } // Guardar gastos por categoría
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


function loadMonthData(month) {
    if (savedMonths[month]) {
        const monthData = savedMonths[month];

        // Actualizar variables de estado
        monthlyIncome = monthData.income;
        totalExpenses = monthData.expenses;

        // Reconstruir los datos de categorías para el gráfico
        expenseCategories = {}; // Reiniciar las categorías
        const categoryGastos = monthData.categoryExpenses || {}; // Gastos por categoría
        Object.keys(categoryGastos).forEach(category => {
            expenseCategories[category] = categoryGastos[category];
        });

        // Verificar si el gráfico necesita reinicialización
        expensesChart.data.labels = [];
        expensesChart.data.datasets[0].data = [];
        expensesChart.data.datasets[0].backgroundColor = [];

        // Actualizar la UI y el gráfico
        updateExpenses();
        updateBalance();
        updateChart(); // Actualizar el gráfico con los nuevos datos

        logMessage(`Datos del mes ${month} cargados correctamente.`);
        modal.style.display = 'none'; // Cerrar el modal
    } else {
        logMessage('No se encontraron datos para el mes seleccionado.');
    }
}



// Borrar datos de los meses guardados
deleteMonthsBtn.addEventListener('click', () => {
    if (confirm('¿Está seguro de que desea borrar todos los meses guardados?')) {
        savedMonths = {};
        localStorage.removeItem('budgetAppData'); // Borrar datos guardados del almacenamiento local
        saveData();
        logMessage('Todos los datos de los meses guardados han sido borrados.');

        // Borrar el gráfico de comparación si existe
        const comparisonChartEl = document.getElementById('comparison-chart');
        if (comparisonChartEl) {
            const comparisonCtx = comparisonChartEl.getContext('2d');
            comparisonCtx.clearRect(0, 0, comparisonChartEl.width, comparisonChartEl.height);
        }
    }
});

// Función de comparación de meses con gráficos
// Variable para el gráfico de comparación
let comparisonChart = null;

// Función de comparación de meses con gráficos

compareDataBtn.addEventListener('click', () => {
    if (Object.keys(savedMonths).length > 1) {
        const labels = Object.keys(savedMonths);
        const incomeData = labels.map(month => savedMonths[month].income);
        const expenseData = labels.map(month => savedMonths[month].expenses);

        const comparisonChartEl = document.getElementById('comparison-chart');
        const comparisonCtx = comparisonChartEl.getContext('2d');

        // Reiniciar manualmente el canvas y destruir el gráfico existente si existe
        comparisonCtx.clearRect(0, 0, comparisonChartEl.width, comparisonChartEl.height);
        if (comparisonChart) {
            comparisonChart.destroy();
        }

        // Crear nuevo gráfico
        comparisonChart = new Chart(comparisonCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Ingresos',
                        data: incomeData,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Gastos',
                        data: expenseData,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Determinar el mes con mayor gasto y mayor ahorro
        let mesMayorGasto = labels[0];
        let mesMayorAhorro = labels[0];
        let mayorGasto = expenseData[0];
        let mayorAhorro = incomeData[0] - expenseData[0];

        labels.forEach((month, index) => {
            if (expenseData[index] > mayorGasto) {
                mayorGasto = expenseData[index];
                mesMayorGasto = month;
            }
            const ahorro = incomeData[index] - expenseData[index];
            if (ahorro > mayorAhorro) {
                mayorAhorro = ahorro;
                mesMayorAhorro = month;
            }
        });

        logMessage(`El mes con mayor gasto fue ${mesMayorGasto} con $${mayorGasto.toFixed(2)}.`);
        logMessage(`El mes con mayor ahorro fue ${mesMayorAhorro} con $${mayorAhorro.toFixed(2)}.`);
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

    // Limpiar el gráfico
    expensesChart.data.labels = [];
    expensesChart.data.datasets[0].data = [];
    expensesChart.data.datasets[0].backgroundColor = [];
    expensesChart.update();

    updateExpenses();
    updateBalance();
    saveData();
    logMessage('Datos reiniciados.');
});
