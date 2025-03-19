import { formatNumber, getTransactionsForPeriod, calculateSummary, calculateTotalSubscriptionCost, getRandomColor, formatDate, getCategoryInitial } from '../utils/helpers.js';

/**
 * Dashboard component for handling dashboard UI and functionality
 */
export default class Dashboard {
    /**
     * Create a Dashboard component
     * @param {Object} store - The application store
     */
    constructor(store) {
        this.store = store;
        this.incomeExpenseChart = null;
        this.expenseCategoryChart = null;
        
        // DOM Elements
        this.balanceElement = document.getElementById('total-balance');
        this.incomeElement = document.getElementById('total-income');
        this.expensesElement = document.getElementById('total-expenses');
        this.subscriptionsElement = document.getElementById('total-subscriptions');
        this.recentTransactionsList = document.getElementById('recent-transactions-list');
        
        // Add event listeners for period filters
        this.initTimeFilters();
    }
    
    /**
     * Initialize time filter buttons
     */
    initTimeFilters() {
        document.querySelectorAll('.time-filter').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.time-filter').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const period = button.getAttribute('data-period');
                this.store.setState('currentPeriod', period);
                this.render();
            });
        });
    }
    
    /**
     * Render the dashboard with current data
     */
    render() {
        const state = this.store.getState();
        const transactions = getTransactionsForPeriod(state.transactions, state.currentPeriod);
        const summary = calculateSummary(transactions);
        const subscriptionCost = calculateTotalSubscriptionCost(state.subscriptions);
        
        // Update summary cards
        this.balanceElement.textContent = formatNumber(summary.balance);
        this.incomeElement.textContent = formatNumber(summary.totalIncome);
        this.expensesElement.textContent = formatNumber(summary.totalExpenses);
        this.subscriptionsElement.textContent = formatNumber(subscriptionCost);
        
        // Generate and update charts
        this.renderIncomeExpenseChart(summary);
        this.renderExpenseCategoryChart(summary);
        
        // Show recent transactions (most recent 5)
        this.renderRecentTransactions(transactions);
    }
    
    /**
     * Render the income vs expense chart
     * @param {Object} summary - Financial summary data
     */
    renderIncomeExpenseChart(summary) {
        const ctx = document.getElementById('income-expense-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.incomeExpenseChart) {
            this.incomeExpenseChart.destroy();
        }
        
        // Create new chart
        this.incomeExpenseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    label: 'Amount',
                    data: [summary.totalIncome, summary.totalExpenses],
                    backgroundColor: [
                        'rgba(73, 197, 182, 0.7)',
                        'rgba(255, 84, 112, 0.7)'
                    ],
                    borderColor: [
                        'rgba(73, 197, 182, 1)',
                        'rgba(255, 84, 112, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw.toLocaleString()}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Render the expense categories chart
     * @param {Object} summary - Financial summary data
     */
    renderExpenseCategoryChart(summary) {
        const ctx = document.getElementById('expense-category-chart').getContext('2d');
        
        // Prepare data for the chart
        const expenseCategories = Object.keys(summary.expensesByCategory);
        const expenseValues = Object.values(summary.expensesByCategory);
        
        // Generate colors
        const backgroundColors = expenseCategories.map(() => {
            const color = getRandomColor();
            return color.replace('rgb', 'rgba').replace(')', ', 0.7)');
        });
        
        const borderColors = backgroundColors.map(color => 
            color.replace('0.7', '1')
        );
        
        // Destroy existing chart if it exists
        if (this.expenseCategoryChart) {
            this.expenseCategoryChart.destroy();
        }
        
        // If there's no expense data, show a message
        if (expenseCategories.length === 0) {
            ctx.canvas.style.display = 'none';
            
            // Add no data message if it doesn't exist
            let noDataMsg = ctx.canvas.parentNode.querySelector('.no-data-message');
            if (!noDataMsg) {
                noDataMsg = document.createElement('div');
                noDataMsg.className = 'no-data-message';
                noDataMsg.textContent = 'No expense data available for this period';
                ctx.canvas.parentNode.appendChild(noDataMsg);
            }
            
            return;
        }
        
        // Remove any no data message
        const noDataMsg = ctx.canvas.parentNode.querySelector('.no-data-message');
        if (noDataMsg) {
            noDataMsg.remove();
        }
        
        // Show the canvas
        ctx.canvas.style.display = 'block';
        
        // Create new chart
        this.expenseCategoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: expenseCategories,
                datasets: [{
                    data: expenseValues,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 15,
                            font: {
                                size: 10
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Render the recent transactions list
     * @param {Array} transactions - Transactions to display
     */
    renderRecentTransactions(transactions) {
        // Sort transactions by date, most recent first
        const sortedTransactions = [...transactions].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        // Get only the most recent 5
        const recentTransactions = sortedTransactions.slice(0, 5);
        
        // Clear the list
        this.recentTransactionsList.innerHTML = '';
        
        if (recentTransactions.length === 0) {
            this.recentTransactionsList.innerHTML = '<div class="no-data">No recent transactions</div>';
            return;
        }
        
        // Add each transaction
        recentTransactions.forEach(transaction => {
            const item = document.createElement('div');
            item.className = 'transaction-item';
            
            const amountClass = transaction.type === 'income' ? 'income-amount' : 'expense-amount';
            const sign = transaction.type === 'income' ? '+' : '-';
            const currency = this.store.getState().currency;
            
            item.innerHTML = `
                <div class="transaction-info">
                    <div class="category-icon">${getCategoryInitial(transaction.category)}</div>
                    <div class="transaction-details">
                        <div class="transaction-title">${transaction.category}</div>
                        <div class="transaction-date">${formatDate(transaction.date)}</div>
                    </div>
                </div>
                <div class="transaction-amount ${amountClass}">${sign} ${currency} ${formatNumber(transaction.amount)}</div>
            `;
            
            this.recentTransactionsList.appendChild(item);
        });
    }
} 