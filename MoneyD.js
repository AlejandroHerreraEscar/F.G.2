const incomeInput = document.getElementById('monthly-income');
const setIncomeBtn = document.getElementById('set-income-btn');
const expenseAmountInput = document.getElementById('expense-amount');
const expensePeriodSelect = document.getElementById('expense-period');
const expenseCategorySelect = document.getElementById('expense-category');
const addExpenseBtn = document.getElementById('add-expense-btn');
const totalExpensesEl = document.getElementById('total-expenses');
const balanceEl = document.getElementById('balance');
const resetBtn = document.getElementById('reset-btn'); // Botón de reiniciar
const saveDataBtn = document.getElementById('save-data-btn'); // Botón de guardar mes
const compareDataBtn = document.getElementById('compare-data-btn'); // Botón de comparar meses
const viewMonthsBtn = document.getElementById('view-months-btn'); // Botón para ver los meses guardados
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const monthsListEl = document.getElementById('months-list');

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

// Guardar datos del mes
saveDataBtn.addEventListener('click', () => {
    const monthName = prompt("Ingrese el nombre del mes para guardar los datos (ejemplo: Enero, Febrero, etc.):");
    if (monthName && monthlyIncome > 0 && totalExpenses > 0) {
        const monthData = {
            month: monthName,
            income: monthlyIncome,
            expenses: totalExpenses
        };
        storeMonthlyData(monthData);
        alert(`Datos guardados para el mes de ${monthName}`);
    } else {
        alert('Por favor, ingrese un mes válido y asegúrese de que haya ingresos y gastos.');
    }
});

// Comparar gastos entre meses
compareDataBtn.addEventListener('click', () => {
    const month1 = prompt("Ingrese el primer mes a comparar:");
    const month2 = prompt("Ingrese el segundo mes a comparar:");

    if (month1 && month2) {
        compareMonths(month1, month2);
    } else {
        alert('Por favor, ingrese ambos meses para comparar.');
    }
});

// Reiniciar
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
    localStorage.removeItem('monthlyData'); // Borrar los datos del mes

    // Actualizar la UI
    updateExpenses();
    updateBalance();
    updateChart();
    document.getElementById('recommendations').textContent = ''; // Limpiar recomendaciones
});

// Ajuste de gasto según el periodo
function adjustExpense(amount, period) {
    if (period === 'daily') {
        return amount * 30;  // Ajuste a mensual
    } else if (period === 'annual') {
        return amount / 12;  // Ajuste a mensual
    }
    return amount;  // Mensual
}

// Actualizar total de gastos
function updateExpenses() {
    totalExpensesEl.textContent = `Gastos Totales: $${totalExpenses.toFixed(2)}`;
}

// Actualizar balance
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

// Obtener gastos almacenados
function getStoredExpenses() {
    return JSON.parse(localStorage.getItem('expenses')) || [];
}

// Función para almacenar los datos de cada mes
function storeMonthlyData(monthData) {
    let monthlyDataList = getStoredMonthlyData();
    monthlyDataList.push(monthData);
    localStorage.setItem('monthlyData', JSON.stringify(monthlyDataList));
}

// Obtener datos almacenados por mes
function getStoredMonthlyData() {
    return JSON.parse(localStorage.getItem('monthlyData')) || [];
}

// Comparar los gastos entre dos meses
function compareMonths(month1, month2) {
    const monthlyData = getStoredMonthlyData();

    const data1 = monthlyData.find(data => data.month.toLowerCase() === month1.toLowerCase());
    const data2 = monthlyData.find(data => data.month.toLowerCase() === month2.toLowerCase());

    if (data1 && data2) {
        const difference = data1.expenses - data2.expenses;
        alert(`Comparación entre ${month1} y ${month2}:\nGastos en ${month1}: $${data1.expenses}\nGastos en ${month2}: $${data2.expenses}\nDiferencia: $${difference.toFixed(2)}`);
    } else {
        alert('No se encontraron datos para uno o ambos meses.');
    }
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

// Obtener total de gastos por categoría
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

// Establecer ingresos y gastos cuando se cargue la página
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

// Mostrar meses guardados en la ventana modal
viewMonthsBtn.addEventListener('click', () => {
    const storedData = getStoredMonthlyData();
    if (storedData.length === 0) {
        monthsListEl.innerHTML = '<li>No hay meses guardados.</li>';
    } else {
        monthsListEl.innerHTML = ''; // Limpiar la lista de meses
        storedData.forEach(data => {
            const listItem = document.createElement('li');
            listItem.textContent = `${data.month.charAt(0).toUpperCase() + data.month.slice(1)}: Ingresos: $${data.income}, Gastos: $${data.expenses}`;
            monthsListEl.appendChild(listItem);
        });
    }

    // Mostrar el modal
    modal.style.display = 'flex';
});

// Cerrar la ventana modal
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});
