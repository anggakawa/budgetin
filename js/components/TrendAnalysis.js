import { formatNumber } from '../utils/helpers.js';

/**
 * TrendAnalysis component for analyzing and displaying spending trends
 */
export default class TrendAnalysis {
    /**
     * Create a TrendAnalysis component
     * @param {Object} store - The application store
     */
    constructor(store) {
        this.store = store;
        this.trendChart = null;
    }
    
    /**
     * Generate monthly data for trend analysis
     * @param {Array} transactions - List of transactions
     * @param {number} months - Number of months to analyze
     * @returns {Object} Monthly analysis data
     */
    generateMonthlyData(transactions, months = 6) {
        const today = new Date();
        const monthData = {};
        
        // Initialize data structure for last X months
        for (let i = 0; i < months; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthData[monthKey] = {
                income: 0,
                expenses: 0,
                balance: 0,
                expensesByCategory: {}
            };
        }
        
        // Populate with transaction data
        transactions.forEach(transaction => {
            const txDate = new Date(transaction.date);
            const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
            
            // Skip if not in our analysis period
            if (!monthData[monthKey]) return;
            
            const amount = parseFloat(transaction.amount);
            
            if (transaction.type === 'income') {
                monthData[monthKey].income += amount;
            } else if (transaction.type === 'expense') {
                monthData[monthKey].expenses += amount;
                
                // Track expenses by category
                if (!monthData[monthKey].expensesByCategory[transaction.category]) {
                    monthData[monthKey].expensesByCategory[transaction.category] = 0;
                }
                monthData[monthKey].expensesByCategory[transaction.category] += amount;
            }
        });
        
        // Calculate balance for each month
        Object.keys(monthData).forEach(month => {
            monthData[month].balance = monthData[month].income - monthData[month].expenses;
        });
        
        return monthData;
    }
    
    /**
     * Generate formatted month labels
     * @param {Array} monthKeys - Array of month keys in format YYYY-MM
     * @returns {Array} Formatted month names
     */
    formatMonthLabels(monthKeys) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        return monthKeys.map(key => {
            const [year, month] = key.split('-');
            return `${months[parseInt(month) - 1]} ${year}`;
        });
    }
    
    /**
     * Identify top spending categories
     * @param {Object} monthData - Monthly analysis data
     * @param {number} topCount - Number of top categories to return
     * @returns {Array} Top categories
     */
    getTopCategories(monthData, topCount = 5) {
        // Combine all expenses by category across all months
        const categoryTotals = {};
        
        Object.values(monthData).forEach(monthInfo => {
            Object.entries(monthInfo.expensesByCategory).forEach(([category, amount]) => {
                if (!categoryTotals[category]) {
                    categoryTotals[category] = 0;
                }
                categoryTotals[category] += amount;
            });
        });
        
        // Sort and get top categories
        return Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, topCount)
            .map(entry => entry[0]);
    }
    
    /**
     * Calculate spending trends and predictions
     * @param {Object} monthData - Monthly analysis data
     * @returns {Object} Trend analysis results
     */
    analyzeTrends(monthData) {
        const monthKeys = Object.keys(monthData).sort();
        
        // Need at least 3 months for a meaningful trend analysis
        if (monthKeys.length < 3) {
            return {
                averageIncome: 0,
                averageExpenses: 0,
                incomeGrowthRate: 0,
                expenseGrowthRate: 0,
                savingsRate: 0,
                prediction: {
                    nextMonthExpenses: 0,
                    nextMonthIncome: 0
                }
            };
        }
        
        // Calculate averages
        let totalIncome = 0;
        let totalExpenses = 0;
        
        monthKeys.forEach(month => {
            totalIncome += monthData[month].income;
            totalExpenses += monthData[month].expenses;
        });
        
        const averageIncome = totalIncome / monthKeys.length;
        const averageExpenses = totalExpenses / monthKeys.length;
        const savingsRate = averageIncome > 0 ? (averageIncome - averageExpenses) / averageIncome * 100 : 0;
        
        // Calculate growth rates using linear regression
        const incomePoints = monthKeys.map((month, i) => [i, monthData[month].income]);
        const expensePoints = monthKeys.map((month, i) => [i, monthData[month].expenses]);
        
        const incomeSlope = this.calculateSlope(incomePoints);
        const expenseSlope = this.calculateSlope(expensePoints);
        
        const incomeGrowthRate = averageIncome > 0 ? (incomeSlope / averageIncome) * 100 : 0;
        const expenseGrowthRate = averageExpenses > 0 ? (expenseSlope / averageExpenses) * 100 : 0;
        
        // Predict next month
        const lastIncomeValue = monthData[monthKeys[0]].income;
        const lastExpenseValue = monthData[monthKeys[0]].expenses;
        
        const nextMonthIncome = Math.max(0, lastIncomeValue + incomeSlope);
        const nextMonthExpenses = Math.max(0, lastExpenseValue + expenseSlope);
        
        return {
            averageIncome,
            averageExpenses,
            incomeGrowthRate,
            expenseGrowthRate,
            savingsRate,
            prediction: {
                nextMonthIncome,
                nextMonthExpenses
            }
        };
    }
    
    /**
     * Calculate the slope of a linear regression line
     * @param {Array} points - Array of [x, y] points
     * @returns {number} Slope value
     */
    calculateSlope(points) {
        const n = points.length;
        
        // Calculate means
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;
        
        points.forEach(([x, y]) => {
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
        });
        
        const meanX = sumX / n;
        const meanY = sumY / n;
        
        // Calculate slope
        const numerator = sumXY - n * meanX * meanY;
        const denominator = sumXX - n * meanX * meanX;
        
        return denominator !== 0 ? numerator / denominator : 0;
    }
    
    /**
     * Render the trend analysis chart
     * @param {Object} monthData - Monthly analysis data
     */
    renderTrendChart(monthData) {
        const chartCanvas = document.getElementById('trend-chart');
        const ctx = chartCanvas.getContext('2d');
        
        // Sort months chronologically (oldest to newest)
        const monthKeys = Object.keys(monthData).sort();
        const formattedLabels = this.formatMonthLabels(monthKeys);
        
        // Prepare datasets
        const incomeData = monthKeys.map(month => monthData[month].income);
        const expenseData = monthKeys.map(month => monthData[month].expenses);
        const balanceData = monthKeys.map(month => monthData[month].balance);
        
        // Destroy existing chart if it exists
        if (this.trendChart) {
            this.trendChart.destroy();
        }
        
        // Create new chart
        this.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: formattedLabels,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        borderColor: 'rgba(73, 197, 182, 1)',
                        backgroundColor: 'rgba(73, 197, 182, 0.1)',
                        tension: 0.4,
                        fill: false,
                        borderWidth: 3,
                        pointRadius: 4
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        borderColor: 'rgba(255, 84, 112, 1)',
                        backgroundColor: 'rgba(255, 84, 112, 0.1)',
                        tension: 0.4,
                        fill: false,
                        borderWidth: 3,
                        pointRadius: 4
                    },
                    {
                        label: 'Balance',
                        data: balanceData,
                        borderColor: 'rgba(255, 222, 89, 1)',
                        backgroundColor: 'rgba(255, 222, 89, 0.1)',
                        tension: 0.4,
                        fill: false,
                        borderWidth: 3,
                        pointRadius: 4
                    }
                ]
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
                    },
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    }
    
    /**
     * Render category trend chart
     * @param {Object} monthData - Monthly analysis data
     */
    renderCategoryTrendChart(monthData) {
        const chartCanvas = document.getElementById('category-trend-chart');
        const ctx = chartCanvas.getContext('2d');
        
        // Get top categories across all months
        const topCategories = this.getTopCategories(monthData);
        
        // Sort months chronologically (oldest to newest)
        const monthKeys = Object.keys(monthData).sort();
        const formattedLabels = this.formatMonthLabels(monthKeys);
        
        // Create datasets for each top category
        const datasets = topCategories.map((category, index) => {
            // Generate a color based on index
            const hue = (index * 137) % 360; // Use golden ratio to spread colors
            const color = `hsl(${hue}, 70%, 60%)`;
            
            // Get data for this category
            const data = monthKeys.map(month => {
                return monthData[month].expensesByCategory[category] || 0;
            });
            
            return {
                label: category,
                data: data,
                borderColor: color,
                backgroundColor: `hsla(${hue}, 70%, 60%, 0.1)`,
                tension: 0.4,
                fill: false,
                borderWidth: 3,
                pointRadius: 3
            };
        });
        
        // Destroy existing chart if it exists
        if (this.categoryTrendChart) {
            this.categoryTrendChart.destroy();
        }
        
        // Create new chart
        this.categoryTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: formattedLabels,
                datasets: datasets
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
                    },
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    }
    
    /**
     * Render the trend analysis insights
     * @param {Object} trendAnalysis - Trend analysis results
     */
    renderInsights(trendAnalysis) {
        const insightsContainer = document.getElementById('trend-insights');
        const currency = this.store.getState().currency;
        
        // Format insights
        const formattedAvgIncome = formatNumber(trendAnalysis.averageIncome);
        const formattedAvgExpenses = formatNumber(trendAnalysis.averageExpenses);
        const formattedSavingsRate = trendAnalysis.savingsRate.toFixed(1);
        const incomeGrowthPrefix = trendAnalysis.incomeGrowthRate >= 0 ? '+' : '';
        const expenseGrowthPrefix = trendAnalysis.expenseGrowthRate >= 0 ? '+' : '';
        
        // Generate insight message
        let insightMessage = '';
        if (trendAnalysis.savingsRate < 0) {
            insightMessage = '<div class="alert alert-danger">You\'re spending more than you earn. Consider reducing expenses.</div>';
        } else if (trendAnalysis.savingsRate < 10) {
            insightMessage = '<div class="alert alert-warning">Your savings rate is low. Try to increase income or reduce expenses.</div>';
        } else if (trendAnalysis.savingsRate > 20) {
            insightMessage = '<div class="alert alert-success">Great job! You have a healthy savings rate.</div>';
        } else {
            insightMessage = '<div class="alert alert-info">You have a good savings rate, but there\'s room for improvement.</div>';
        }
        
        // Define CSS for alerts
        const alertCSS = `
            <style>
                .alert {
                    padding: 15px;
                    margin-bottom: 15px;
                    border-radius: 0;
                    border: 2px solid var(--border-color);
                }
                .alert-danger {
                    background-color: rgba(255, 84, 112, 0.2);
                    color: var(--danger-color);
                }
                .alert-warning {
                    background-color: rgba(255, 222, 89, 0.2);
                    color: var(--warning-color);
                }
                .alert-success {
                    background-color: rgba(73, 197, 182, 0.2);
                    color: var(--secondary-color);
                }
                .alert-info {
                    background-color: rgba(93, 95, 239, 0.2);
                    color: var(--info-color);
                }
                .insight-card {
                    background-color: white;
                    border: 2px solid var(--border-color);
                    padding: 1rem;
                    margin-bottom: 1rem;
                    box-shadow: var(--shadow);
                }
                .insight-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .insight-value {
                    font-size: 1.4rem;
                    font-weight: bold;
                    margin-bottom: 0.25rem;
                }
                .insight-label {
                    font-size: 0.875rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    opacity: 0.7;
                }
                .trend-up {
                    color: var(--secondary-color);
                }
                .trend-down {
                    color: var(--primary-color);
                }
                .prediction-section {
                    margin-top: 1.5rem;
                }
            </style>
        `;
        
        // Generate HTML
        insightsContainer.innerHTML = alertCSS + insightMessage + `
            <div class="insight-grid">
                <div class="insight-card">
                    <div class="insight-value">${currency} ${formattedAvgIncome}</div>
                    <div class="insight-label">Average Monthly Income</div>
                    <div class="insight-trend ${trendAnalysis.incomeGrowthRate >= 0 ? 'trend-up' : 'trend-down'}">
                        ${incomeGrowthPrefix}${trendAnalysis.incomeGrowthRate.toFixed(1)}% trend
                    </div>
                </div>
                <div class="insight-card">
                    <div class="insight-value">${currency} ${formattedAvgExpenses}</div>
                    <div class="insight-label">Average Monthly Expenses</div>
                    <div class="insight-trend ${trendAnalysis.expenseGrowthRate <= 0 ? 'trend-up' : 'trend-down'}">
                        ${expenseGrowthPrefix}${trendAnalysis.expenseGrowthRate.toFixed(1)}% trend
                    </div>
                </div>
                <div class="insight-card">
                    <div class="insight-value">${formattedSavingsRate}%</div>
                    <div class="insight-label">Average Savings Rate</div>
                </div>
            </div>
            
            <div class="prediction-section">
                <h4>Next Month Prediction</h4>
                <div class="insight-grid">
                    <div class="insight-card">
                        <div class="insight-value">${currency} ${formatNumber(trendAnalysis.prediction.nextMonthIncome)}</div>
                        <div class="insight-label">Predicted Income</div>
                    </div>
                    <div class="insight-card">
                        <div class="insight-value">${currency} ${formatNumber(trendAnalysis.prediction.nextMonthExpenses)}</div>
                        <div class="insight-label">Predicted Expenses</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render the trend analysis view
     */
    render() {
        const allTransactions = this.store.getState().transactions;
        
        // Generate monthly data 
        const monthData = this.generateMonthlyData(allTransactions);
        
        // Analyze trends
        const trendAnalysis = this.analyzeTrends(monthData);
        
        // Render components
        this.renderTrendChart(monthData);
        this.renderCategoryTrendChart(monthData);
        this.renderInsights(trendAnalysis);
    }
} 