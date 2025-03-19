/**
 * Store Class - Handles application state and local storage
 */
export default class Store {
    // Default categories for the application
    static DEFAULT_CATEGORIES = {
        income: ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other Income'],
        expense: ['Food', 'Housing', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Education', 'Shopping', 'Personal', 'Debt', 'Savings', 'Other Expenses']
    };

    // Local Storage Keys
    static STORAGE_KEYS = {
        TRANSACTIONS: 'budgetin_transactions',
        SUBSCRIPTIONS: 'budgetin_subscriptions',
        CATEGORIES: 'budgetin_categories',
        CURRENCY: 'budgetin_currency',
        CUSTOM_CURRENCIES: 'budgetin_custom_currencies'
    };

    constructor() {
        // Initialize app state
        this.state = {
            transactions: [],
            subscriptions: [],
            categories: {...Store.DEFAULT_CATEGORIES},
            currentPage: 'transactions',
            currentPeriod: 'month',
            currency: 'Rp', // Default to Indonesian Rupiah
            customCurrencies: [] // Store custom currencies
        };

        // Load data from local storage
        this.loadFromStorage();
    }

    /**
     * Get the current application state
     * @returns {Object} The current state
     */
    getState() {
        return this.state;
    }

    /**
     * Set a value in the state and save to storage
     * @param {string} key - The state key to update
     * @param {*} value - The new value
     */
    setState(key, value) {
        this.state[key] = value;
        this.saveToStorage();
    }

    /**
     * Load data from local storage
     */
    loadFromStorage() {
        const storedTransactions = localStorage.getItem(Store.STORAGE_KEYS.TRANSACTIONS);
        const storedSubscriptions = localStorage.getItem(Store.STORAGE_KEYS.SUBSCRIPTIONS);
        const storedCategories = localStorage.getItem(Store.STORAGE_KEYS.CATEGORIES);
        const storedCurrency = localStorage.getItem(Store.STORAGE_KEYS.CURRENCY);
        const storedCustomCurrencies = localStorage.getItem(Store.STORAGE_KEYS.CUSTOM_CURRENCIES);
        
        if (storedTransactions) {
            this.state.transactions = JSON.parse(storedTransactions);
        }
        
        if (storedSubscriptions) {
            this.state.subscriptions = JSON.parse(storedSubscriptions);
        }
        
        if (storedCategories) {
            this.state.categories = JSON.parse(storedCategories);
        }
        
        if (storedCurrency) {
            this.state.currency = storedCurrency;
        }
        
        if (storedCustomCurrencies) {
            this.state.customCurrencies = JSON.parse(storedCustomCurrencies);
        }
    }

    /**
     * Save data to local storage
     */
    saveToStorage() {
        localStorage.setItem(Store.STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.state.transactions));
        localStorage.setItem(Store.STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(this.state.subscriptions));
        localStorage.setItem(Store.STORAGE_KEYS.CATEGORIES, JSON.stringify(this.state.categories));
        localStorage.setItem(Store.STORAGE_KEYS.CURRENCY, this.state.currency);
        localStorage.setItem(Store.STORAGE_KEYS.CUSTOM_CURRENCIES, JSON.stringify(this.state.customCurrencies));
    }

    /**
     * Add a transaction to the store
     * @param {Object} transaction - The transaction to add
     */
    addTransaction(transaction) {
        this.state.transactions.push({
            ...transaction,
            id: Date.now().toString()
        });
        this.saveToStorage();
    }

    /**
     * Delete a transaction from the store
     * @param {string} transactionId - The ID of the transaction to delete
     */
    deleteTransaction(transactionId) {
        this.state.transactions = this.state.transactions.filter(
            transaction => transaction.id !== transactionId
        );
        this.saveToStorage();
    }

    /**
     * Add a subscription to the store
     * @param {Object} subscription - The subscription to add
     */
    addSubscription(subscription) {
        this.state.subscriptions.push({
            ...subscription,
            id: Date.now().toString()
        });
        this.saveToStorage();
    }

    /**
     * Delete a subscription from the store
     * @param {string} subscriptionId - The ID of the subscription to delete
     */
    deleteSubscription(subscriptionId) {
        this.state.subscriptions = this.state.subscriptions.filter(
            subscription => subscription.id !== subscriptionId
        );
        this.saveToStorage();
    }

    /**
     * Add a category to the store
     * @param {string} categoryType - The type of category (income/expense)
     * @param {string} categoryName - The name of the category
     */
    addCategory(categoryType, categoryName) {
        if (!this.state.categories[categoryType].includes(categoryName)) {
            this.state.categories[categoryType].push(categoryName);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    /**
     * Delete a category from the store
     * @param {string} categoryType - The type of category (income/expense)
     * @param {string} categoryName - The name of the category
     */
    deleteCategory(categoryType, categoryName) {
        // Check if category is in use
        const isInUse = this.state.transactions.some(
            transaction => transaction.type === categoryType && transaction.category === categoryName
        );
        
        if (!isInUse) {
            this.state.categories[categoryType] = this.state.categories[categoryType].filter(
                category => category !== categoryName
            );
            this.saveToStorage();
            return true;
        }
        return false;
    }

    /**
     * Export all data from the store
     * @returns {Object} The exported data
     */
    exportData() {
        return {
            transactions: this.state.transactions,
            subscriptions: this.state.subscriptions,
            categories: this.state.categories,
            currency: this.state.currency,
            customCurrencies: this.state.customCurrencies
        };
    }

    /**
     * Import data into the store
     * @param {Object} data - The data to import
     */
    importData(data) {
        if (data.transactions && Array.isArray(data.transactions)) {
            this.state.transactions = data.transactions;
        }
        
        if (data.subscriptions && Array.isArray(data.subscriptions)) {
            this.state.subscriptions = data.subscriptions;
        }
        
        if (data.categories) {
            this.state.categories = data.categories;
        }
        
        if (data.currency) {
            this.state.currency = data.currency;
        }
        
        if (data.customCurrencies) {
            this.state.customCurrencies = data.customCurrencies;
        }
        
        this.saveToStorage();
        return true;
    }

    /**
     * Clear all data from the store
     */
    clearAllData() {
        this.state.transactions = [];
        this.state.subscriptions = [];
        this.state.categories = {...Store.DEFAULT_CATEGORIES};
        // Keep the currency setting when clearing data
        this.saveToStorage();
    }
} 