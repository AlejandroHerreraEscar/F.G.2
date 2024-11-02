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
