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
 * Get a category icon representation
 * @param {string} category - The category name
 * @returns {string} - An emoji icon for the category
 */
export function getCategoryInitial(category) {
    const categoryIcons = {
        // Income categories
        'Salary': '💰',
        'Bonus': '🎁',
        'Investment': '📈',
        'Gift': '🎀',
        'Other Income': '💸',
        
        // Expense categories
        'Food': '🍔',
        'Groceries': '🛒',
        'Dining': '🍽️',
        'Housing': '🏠',
        'Rent': '🏢',
        'Mortgage': '🏘️',
        'Utilities': '💡',
        'Transportation': '🚗',
        'Health': '⚕️',
        'Education': '🎓',
        'Entertainment': '🎬',
        'Shopping': '🛍️',
        'Travel': '✈️',
        'Subscriptions': '📱',
        'Personal': '👤',
        'Bills': '📄',
        'Insurance': '🔒',
        'Taxes': '📊',
        'Business': '💼',
        'Charity': '❤️',
        'Transfer': '↔️',
    };
    
    // Return the emoji if the category exists in our mapping
    if (categoryIcons[category]) {
        return categoryIcons[category];
    }
    
    // Default: return the first letter of the category
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
 * Get a random color from a predefined color palette
 * @returns {Object} - Color object with r, g, b properties
 */
export function getRandomColor() {
    // Predefined color palette with distinct, high-contrast colors
    const colors = [
        { r: 255, g: 99, b: 132 },  // Red
        { r: 54, g: 162, b: 235 },  // Blue
        { r: 255, g: 206, b: 86 },  // Yellow
        { r: 75, g: 192, b: 192 },  // Teal
        { r: 153, g: 102, b: 255 }, // Purple
        { r: 255, g: 159, b: 64 },  // Orange
        { r: 76, g: 175, b: 80 },   // Green
        { r: 121, g: 85, b: 72 },   // Brown
        { r: 63, g: 81, b: 181 },   // Indigo
        { r: 0, g: 150, b: 136 },   // Mint
        { r: 233, g: 30, b: 99 },   // Pink
        { r: 96, g: 125, b: 139 }   // Blue-gray
    ];
    
    // Return a random color from the palette
    return colors[Math.floor(Math.random() * colors.length)];
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