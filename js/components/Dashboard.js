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
        this.dashboardPocketsContainer = document.getElementById('dashboard-pockets');
        
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
        
        // Render pockets
        this.renderPockets();
        
        // Generate and update charts
        this.renderIncomeExpenseChart(summary);
        this.renderExpenseCategoryChart(summary);
        
        // Show recent transactions (most recent 5)
        this.renderRecentTransactions(transactions);
    }
    
    /**
     * Render pocket cards on the dashboard
     */
    renderPockets() {
        if (!this.dashboardPocketsContainer) return;
        
        this.dashboardPocketsContainer.innerHTML = '';
        
        const pockets = this.store.getState().pockets;
        const currency = this.store.getState().currency;
        
        if (pockets.length === 0) {
            this.dashboardPocketsContainer.innerHTML = '<div class="empty-state">No pockets found</div>';
            return;
        }
        
        pockets.forEach(pocket => {
            const pocketCard = document.createElement('div');
            pocketCard.className = 'pocket-card';
            pocketCard.style.borderColor = pocket.color;
            
            pocketCard.innerHTML = `
                <div class="pocket-card-header" style="background-color: ${pocket.color}">
                    <div class="pocket-icon">
                        ${this.getPocketIconHTML(pocket.icon)}
                    </div>
                    <div class="pocket-name">${pocket.name}</div>
                </div>
                <div class="pocket-balance">
                    <span class="currency-symbol">${currency}</span> 
                    <span class="balance-amount">${formatNumber(pocket.balance)}</span>
                </div>
            `;
            
            this.dashboardPocketsContainer.appendChild(pocketCard);
        });
    }
    
    /**
     * Get HTML for pocket icon
     * @param {string} icon - The icon name
     * @returns {string} The HTML for the icon
     */
    getPocketIconHTML(icon) {
        const icons = {
            cash: '💵',
            bank: '🏦',
            wallet: '👛',
            card: '💳',
            savings: '🏺',
            invest: '📈',
            crypto: '🪙',
            piggy: '🐖'
        };
        
        return icons[icon] || icons.wallet;
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
     * Render the expense category chart
     * @param {Object} summary - Financial summary data
     */
    renderExpenseCategoryChart(summary) {
        const ctx = document.getElementById('expense-category-chart').getContext('2d');
        
        // Check if there are expenses to display
        if (!summary || !summary.expensesByCategory || Object.keys(summary.expensesByCategory).length === 0) {
            // Hide canvas and show "No Data" message
            ctx.canvas.style.display = 'none';
            
            const noDataElem = document.createElement('div');
            noDataElem.className = 'no-data-message';
            noDataElem.textContent = 'No expense data available';
            
            const parent = ctx.canvas.parentElement;
            if (!parent.querySelector('.no-data-message')) {
                parent.appendChild(noDataElem);
            }
            
            return;
        }
        
        // Show canvas if it was hidden
        ctx.canvas.style.display = 'block';
        
        // Remove any "No Data" message
        const parent = ctx.canvas.parentElement;
        const noDataElem = parent.querySelector('.no-data-message');
        if (noDataElem) {
            parent.removeChild(noDataElem);
        }
        
        // Extract categories and amounts
        const categories = Object.keys(summary.expensesByCategory);
        const amounts = categories.map(category => summary.expensesByCategory[category]);
        
        // Generate colors for each category
        const backgroundColors = categories.map(() => {
            const color = getRandomColor();
            return `rgba(${color.r}, ${color.g}, ${color.b}, 0.7)`;
        });
        
        const borderColors = backgroundColors.map(color => {
            return color.replace('0.7', '1');
        });
        
        // Destroy existing chart if it exists
        if (this.expenseCategoryChart) {
            this.expenseCategoryChart.destroy();
        }
        
        // Create new chart
        this.expenseCategoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Render recent transactions list
     * @param {Array} transactions - All transactions for the selected period
     */
    renderRecentTransactions(transactions) {
        if (!this.recentTransactionsList) return;
        
        this.recentTransactionsList.innerHTML = '';
        
        // Sort by date (most recent first) and take only the most recent 5
        const recentTransactions = [...transactions]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        if (recentTransactions.length === 0) {
            this.recentTransactionsList.innerHTML = '<div class="empty-state">No recent transactions</div>';
            return;
        }
        
        const { currency, pockets } = this.store.getState();
        
        recentTransactions.forEach(transaction => {
            const transactionElement = document.createElement('div');
            transactionElement.className = `transaction-item ${transaction.type}`;
            
            const pocket = pockets.find(p => p.id === transaction.pocketId) || { name: 'Unknown' };
            const isTransfer = transaction.category === 'Transfer';
            
            const transactionContent = `
                <div class="transaction-category">
                    <span class="category-icon">${getCategoryInitial(transaction.category)}</span>
                </div>
                <div class="transaction-details">
                    <div class="transaction-name">
                        <span>${transaction.category}</span>
                        <span class="transaction-amount ${transaction.type}">${currency} ${formatNumber(transaction.amount)}</span>
                    </div>
                    <div class="transaction-meta">
                        <span class="transaction-date">${formatDate(transaction.date)}</span>
                        <span class="transaction-pocket">${pocket.name}</span>
                        ${transaction.description ? `<span class="transaction-description">${transaction.description}</span>` : ''}
                    </div>
                </div>
            `;
            
            transactionElement.innerHTML = transactionContent;
            this.recentTransactionsList.appendChild(transactionElement);
        });
    }
} 