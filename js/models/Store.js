/**
 * Store Class - Handles application state and local storage
 */
export default class Store {
    // Default categories for the application
    static DEFAULT_CATEGORIES = {
        income: ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other Income'],
        expense: ['Food', 'Housing', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Education', 'Shopping', 'Personal', 'Debt', 'Savings', 'Other Expenses']
    };

    // Default pockets for the application
    static DEFAULT_POCKETS = [
        { id: '1', name: 'Cash', balance: 0, color: '#4caf50', icon: 'cash' },
        { id: '2', name: 'Bank Account', balance: 0, color: '#2196f3', icon: 'bank' }
    ];

    // Local Storage Keys
    static STORAGE_KEYS = {
        TRANSACTIONS: 'budgetin_transactions',
        SUBSCRIPTIONS: 'budgetin_subscriptions',
        CATEGORIES: 'budgetin_categories',
        CURRENCY: 'budgetin_currency',
        CUSTOM_CURRENCIES: 'budgetin_custom_currencies',
        POCKETS: 'budgetin_pockets'
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
            customCurrencies: [], // Store custom currencies
            pockets: [...Store.DEFAULT_POCKETS] // Initialize with default pockets
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
        const storedPockets = localStorage.getItem(Store.STORAGE_KEYS.POCKETS);
        
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

        if (storedPockets) {
            this.state.pockets = JSON.parse(storedPockets);
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
        localStorage.setItem(Store.STORAGE_KEYS.POCKETS, JSON.stringify(this.state.pockets));
    }

    /**
     * Add a transaction to the store
     * @param {Object} transaction - The transaction to add
     */
    addTransaction(transaction) {
        const newTransaction = {
            ...transaction,
            id: Date.now().toString()
        };
        
        this.state.transactions.push(newTransaction);
        
        // Update pocket balance based on transaction type and pocket
        if (transaction.pocketId) {
            const pocketIndex = this.state.pockets.findIndex(p => p.id === transaction.pocketId);
            if (pocketIndex !== -1) {
                const pocket = this.state.pockets[pocketIndex];
                if (transaction.type === 'income') {
                    pocket.balance += transaction.amount;
                } else if (transaction.type === 'expense') {
                    pocket.balance -= transaction.amount;
                }
                this.state.pockets[pocketIndex] = pocket;
            }
        }
        
        this.saveToStorage();
    }

    /**
     * Delete a transaction from the store
     * @param {string} transactionId - The ID of the transaction to delete
     */
    deleteTransaction(transactionId) {
        const transaction = this.state.transactions.find(t => t.id === transactionId);
        if (transaction && transaction.pocketId) {
            // Reverse the effect on pocket balance
            const pocketIndex = this.state.pockets.findIndex(p => p.id === transaction.pocketId);
            if (pocketIndex !== -1) {
                const pocket = this.state.pockets[pocketIndex];
                if (transaction.type === 'income') {
                    pocket.balance -= transaction.amount;
                } else if (transaction.type === 'expense') {
                    pocket.balance += transaction.amount;
                }
                this.state.pockets[pocketIndex] = pocket;
            }
        }
        
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
     * Add a new pocket
     * @param {Object} pocket - The pocket to add
     * @returns {string} The ID of the new pocket
     */
    addPocket(pocket) {
        const newPocket = {
            ...pocket,
            id: Date.now().toString(),
            balance: pocket.initialBalance || 0
        };
        
        // Remove initialBalance property
        if (newPocket.initialBalance) {
            delete newPocket.initialBalance;
        }
        
        this.state.pockets.push(newPocket);
        this.saveToStorage();
        return newPocket.id;
    }

    /**
     * Update a pocket
     * @param {string} pocketId - The ID of the pocket to update
     * @param {Object} pocketData - The new pocket data
     * @returns {boolean} True if the pocket was updated, false otherwise
     */
    updatePocket(pocketId, pocketData) {
        const pocketIndex = this.state.pockets.findIndex(p => p.id === pocketId);
        if (pocketIndex !== -1) {
            // Keep the current balance unless explicitly provided
            const currentBalance = this.state.pockets[pocketIndex].balance;
            this.state.pockets[pocketIndex] = {
                ...this.state.pockets[pocketIndex],
                ...pocketData,
                balance: pocketData.balance !== undefined ? pocketData.balance : currentBalance
            };
            this.saveToStorage();
            return true;
        }
        return false;
    }

    /**
     * Delete a pocket
     * @param {string} pocketId - The ID of the pocket to delete
     * @returns {boolean} True if the pocket was deleted, false otherwise
     */
    deletePocket(pocketId) {
        // Check if pocket is in use
        const isInUse = this.state.transactions.some(
            transaction => transaction.pocketId === pocketId
        );
        
        // Don't allow deleting if it's the only pocket
        if (this.state.pockets.length <= 1) {
            return false;
        }
        
        if (!isInUse) {
            this.state.pockets = this.state.pockets.filter(
                pocket => pocket.id !== pocketId
            );
            this.saveToStorage();
            return true;
        }
        return false;
    }

    /**
     * Transfer money between pockets
     * @param {string} fromPocketId - The ID of the source pocket
     * @param {string} toPocketId - The ID of the destination pocket
     * @param {number} amount - The amount to transfer
     * @returns {boolean} True if the transfer was successful, false otherwise
     */
    transferBetweenPockets(fromPocketId, toPocketId, amount) {
        if (fromPocketId === toPocketId) return false;
        
        const fromPocketIndex = this.state.pockets.findIndex(p => p.id === fromPocketId);
        const toPocketIndex = this.state.pockets.findIndex(p => p.id === toPocketId);
        
        if (fromPocketIndex === -1 || toPocketIndex === -1) return false;
        
        const fromPocket = this.state.pockets[fromPocketIndex];
        const toPocket = this.state.pockets[toPocketIndex];
        
        // Check if source pocket has enough balance
        if (fromPocket.balance < amount) return false;
        
        // Perform the transfer
        fromPocket.balance -= amount;
        toPocket.balance += amount;
        
        // Update pockets
        this.state.pockets[fromPocketIndex] = fromPocket;
        this.state.pockets[toPocketIndex] = toPocket;
        
        // Add transfer transactions
        const transferDate = new Date().toISOString().split('T')[0];
        
        // From pocket transaction (expense)
        this.state.transactions.push({
            id: Date.now().toString(),
            type: 'expense',
            amount: amount,
            category: 'Transfer',
            date: transferDate,
            description: `Transfer to ${toPocket.name}`,
            pocketId: fromPocketId,
            transferId: Date.now().toString(),
            transferToPocketId: toPocketId
        });
        
        // To pocket transaction (income)
        this.state.transactions.push({
            id: (Date.now() + 1).toString(),
            type: 'income',
            amount: amount,
            category: 'Transfer',
            date: transferDate,
            description: `Transfer from ${fromPocket.name}`,
            pocketId: toPocketId,
            transferId: Date.now().toString(),
            transferFromPocketId: fromPocketId
        });
        
        this.saveToStorage();
        return true;
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
            customCurrencies: this.state.customCurrencies,
            pockets: this.state.pockets
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
        
        if (data.pockets && Array.isArray(data.pockets)) {
            this.state.pockets = data.pockets;
        } else {
            this.state.pockets = [...Store.DEFAULT_POCKETS];
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
        this.state.pockets = [...Store.DEFAULT_POCKETS];
        // Keep the currency setting when clearing data
        this.saveToStorage();
    }
} 