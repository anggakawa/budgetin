/**
 * Format a date string to a readable format
 * @param {string} dateString - The date string to format
 * @returns {string} - The formatted date
 */
export function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Convert billing cycle to readable text
 * @param {string} cycle - The billing cycle (weekly, monthly, etc.)
 * @returns {string} - Human-readable billing cycle
 */
export function formatBillingCycle(cycle) {
    const mappings = {
        'weekly': 'Weekly',
        'monthly': 'Monthly',
        'quarterly': 'Quarterly (Every 3 Months)',
        'annually': 'Annually (Yearly)'
    };
    
    return mappings[cycle] || cycle;
}

/**
 * Format a number with thousands separators
 * @param {number} number - The number to format
 * @returns {string} - The formatted number
 */
export function formatNumber(number) {
    return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Get the first letter of a category for the icon
 * @param {string} category - The category name
 * @returns {string} - The first letter
 */
export function getCategoryInitial(category) {
    return category.charAt(0).toUpperCase();
}

/**
 * Get transactions for a specific time period from the current date
 * @param {Array} transactions - All transactions 
 * @param {string} period - The time period (week, month, quarter, year)
 * @returns {Array} - Filtered transactions
 */
export function getTransactionsForPeriod(transactions, period) {
    const now = new Date();
    const startDate = new Date();
    
    // Calculate start date based on period
    switch (period) {
        case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        case 'quarter':
            startDate.setMonth(now.getMonth() - 3);
            break;
        case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        default:
            startDate.setMonth(now.getMonth() - 1); // Default to month
    }
    
    // Filter transactions by date
    return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= now;
    });
}

/**
 * Calculate financial summary from transactions
 * @param {Array} transactions - The transactions to summarize
 * @returns {Object} - Summary object containing totals and categorized data
 */
export function calculateSummary(transactions) {
    const summary = {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        incomeByCategory: {},
        expensesByCategory: {}
    };
    
    // Process each transaction
    transactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount);
        
        if (transaction.type === 'income') {
            summary.totalIncome += amount;
            
            // Add to income by category
            if (!summary.incomeByCategory[transaction.category]) {
                summary.incomeByCategory[transaction.category] = 0;
            }
            summary.incomeByCategory[transaction.category] += amount;
            
        } else if (transaction.type === 'expense') {
            summary.totalExpenses += amount;
            
            // Add to expenses by category
            if (!summary.expensesByCategory[transaction.category]) {
                summary.expensesByCategory[transaction.category] = 0;
            }
            summary.expensesByCategory[transaction.category] += amount;
        }
    });
    
    // Calculate balance
    summary.balance = summary.totalIncome - summary.totalExpenses;
    
    return summary;
}

/**
 * Calculate total monthly subscription cost
 * @param {Array} subscriptions - The list of subscriptions
 * @returns {number} - Total monthly cost
 */
export function calculateTotalSubscriptionCost(subscriptions) {
    return subscriptions.reduce((total, subscription) => {
        const amount = parseFloat(subscription.amount);
        
        // Convert to monthly equivalent
        switch (subscription.billingCycle) {
            case 'weekly':
                return total + (amount * 4.33); // Average weeks in a month
            case 'monthly':
                return total + amount;
            case 'quarterly':
                return total + (amount / 3);
            case 'annually':
                return total + (amount / 12);
            default:
                return total + amount;
        }
    }, 0);
}

/**
 * Generate a random color code for charts
 * @returns {string} - RGB color string
 */
export function getRandomColor() {
    const r = Math.floor(Math.random() * 200 + 55);
    const g = Math.floor(Math.random() * 200 + 55);
    const b = Math.floor(Math.random() * 200 + 55);
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Set the current date in an input element
 * @param {HTMLElement} element - The input element
 */
export function setCurrentDate(element) {
    const today = new Date().toISOString().split('T')[0];
    element.value = today;
}

/**
 * Create a date range for filtering
 * @param {string} fromDate - Start date string
 * @param {string} toDate - End date string
 * @returns {Object} - Date range object
 */
export function createDateRange(fromDate, toDate) {
    // Set default values if not provided
    const from = fromDate ? new Date(fromDate) : new Date(0); // Beginning of time
    const to = toDate ? new Date(toDate) : new Date(); // Current date
    
    // Adjust end date to include the entire day
    to.setHours(23, 59, 59, 999);
    
    return { from, to };
}

/**
 * Filter an array of objects based on a property matching a value
 * @param {Array} array - The array to filter
 * @param {string} property - The property to check
 * @param {*} value - The value to match
 * @returns {Array} - Filtered array
 */
export function filterByProperty(array, property, value) {
    if (!value || value === 'all') {
        return array;
    }
    
    return array.filter(item => item[property] === value);
} 