const incomeInput = document.getElementById('monthly-income');
const setIncomeBtn = document.getElementById('set-income-btn');
const expenseAmountInput = document.getElementById('expense-amount');
const expensePeriodSelect = document.getElementById('expense-period');
const expenseCategorySelect = document.getElementById('expense-category');
const addExpenseBtn = document.getElementById('add-expense-btn');
const totalExpensesEl = document.getElementById('total-expenses');
const balanceEl = document.getElementById('balance');
const resetBtn = document.getElementById('reset-btn');
const currencySelector = document.getElementById('currency-selector');
const expenseCurrencySelector = document.getElementById('expense-currency-selector'); // Nuevo selector de moneda para gastos

// Inicialización de valores
let totalExpenses = 0;
let monthlyIncome = 0;

// Tasas de cambio iniciales (actualizadas al cargar la página)
let exchangeRates = { CLP: 1, USD: 0.0013, EUR: 0.0011 };

// Establecer ingresos
setIncomeBtn.addEventListener('click', () => {
    monthlyIncome = parseFloat(incomeInput.value);
    if (!isNaN(monthlyIncome) && monthlyIncome > 0) {
        alert(`Ingresos establecidos: ${currencySelector.value} ${monthlyIncome}`);
        storeIncome(monthlyIncome);
        updateBalance();
    } else {
        alert('Por favor, ingrese un valor válido de ingresos.');
    }
});

// Obtener tasas de cambio de la API
async function fetchExchangeRates() {
    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/fef6f22e3a3c9e1022bf9397/latest/USD`);
        const data = await response.json();
        exchangeRates = data.conversion_rates;
        updateExpenses();
        updateBalance();
    } catch (error) {
        console.error("Error al obtener las tasas de cambio:", error);
    }
}

// Obtener tasas de cambio cuando la página se carga
document.addEventListener('DOMContentLoaded', () => {
    fetchExchangeRates();
});

// Función para convertir valores a la moneda seleccionada
function convertCurrency(amount) {
    const currency = currencySelector.value;
    return amount * (exchangeRates[currency] || 1);
}

// Agregar gasto con conversión a la moneda base
addExpenseBtn.addEventListener('click', () => {
    const amount = parseFloat(expenseAmountInput.value);
    const period = expensePeriodSelect.value;
    const category = expenseCategorySelect.value;
    const expenseCurrency = expenseCurrencySelector.value;

    if (!isNaN(amount) && amount > 0) {
        // Convertir el gasto a la moneda base (CLP en este ejemplo) antes de sumarlo a totalExpenses
        const amountInBaseCurrency = amount / exchangeRates[expenseCurrency];
        const adjustedAmount = adjustExpense(amountInBaseCurrency, period);
        
        totalExpenses += adjustedAmount;
        storeExpense({ amount: adjustedAmount, period, category, currency: 'CLP' }); // Guardar en la moneda base

        updateExpenses();
        updateBalance();
        updateChart();
    } else {
        alert('Ingrese un monto válido para el gasto.');
    }
});

// Actualizar los gastos totales en pantalla
function updateExpenses() {
    const convertedTotalExpenses = convertCurrency(totalExpenses);
    totalExpensesEl.textContent = `Gastos Totales: ${currencySelector.value} ${convertedTotalExpenses.toFixed(2)}`;
}

// Actualizar el balance en pantalla
function updateBalance() {
    const balance = monthlyIncome - totalExpenses;
    const convertedBalance = convertCurrency(balance);
    
    balanceEl.textContent = `Balance: ${currencySelector.value} ${convertedBalance.toFixed(2)}`;
    balanceEl.style.color = convertedBalance >= 0 ? 'green' : 'red';

    const recommendationsEl = document.getElementById('recommendations');
    recommendationsEl.textContent = convertedBalance < 0 
        ? "Tus gastos están excediendo tus ingresos. Considera reducir gastos en algunas categorías."
        : "";
}

// Reiniciar la aplicación
resetBtn.addEventListener('click', () => {
    totalExpenses = 0;
    monthlyIncome = 0;
    incomeInput.value = '';
    expenseAmountInput.value = '';
    expensePeriodSelect.value = 'monthly';
    expenseCategorySelect.value = 'food';
    expenseCurrencySelector.value = 'CLP';
    
    localStorage.removeItem('monthlyIncome');
    localStorage.removeItem('expenses');

    updateExpenses();
    updateBalance();
    updateChart();
    document.getElementById('recommendations').textContent = '';
});

// Ajustar el monto del gasto según el período
function adjustExpense(amount, period) {
    if (period === 'daily') {
        return amount * 30;  
    } else if (period === 'annual') {
        return amount / 12;  
    }
    return amount;  
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
let chart; 
function updateChart() {
    const ctx = document.getElementById('expenses-chart').getContext('2d');
    
    const categories = ['Alimentación', 'Transporte', 'Entretenimiento', 'Otros'];
    const expensesByCategory = getExpensesByCategory();

    if (chart) {
        chart.destroy();
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

// Establecer ingresos y gastos al cargar la página
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

    updateExpenses();
    updateChart();
});

