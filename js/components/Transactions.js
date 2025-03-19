import { formatNumber, formatDate, getCategoryInitial, createDateRange, filterByProperty } from '../utils/helpers.js';

/**
 * Transactions component for handling transactions functionality
 */
export default class Transactions {
    /**
     * Create a Transactions component
     * @param {Object} store - The application store
     */
    constructor(store) {
        this.store = store;
        
        // DOM Elements
        this.transactionsList = document.getElementById('all-transactions-list');
        this.typeFilterSelect = document.getElementById('transaction-type-filter');
        this.categoryFilterSelect = document.getElementById('transaction-category-filter');
        this.pocketFilterSelect = document.getElementById('transaction-pocket-filter');
        this.dateFromInput = document.getElementById('date-from');
        this.dateToInput = document.getElementById('date-to');
        
        // Modal elements
        this.transactionTypeSelect = document.getElementById('transaction-type');
        this.transactionAmountInput = document.getElementById('transaction-amount');
        this.transactionCategorySelect = document.getElementById('transaction-category');
        this.transactionPocketSelect = document.getElementById('transaction-pocket');
        this.transactionDateInput = document.getElementById('transaction-date');
        this.transactionDescriptionInput = document.getElementById('transaction-description');
        
        // Set up event listeners
        this.initEventListeners();
    }
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Add transaction button
        document.getElementById('add-transaction-btn').addEventListener('click', () => {
            this.setCurrentDate();
            this.showModal();
        });
        
        // Modal close button
        document.querySelector('#transaction-modal .close').addEventListener('click', () => {
            this.hideModal();
        });

        // Modal cancel button
        document.querySelector('#transaction-modal .modal-cancel').addEventListener('click', () => {
            this.hideModal();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target.id === 'transaction-modal') {
                this.hideModal();
            }
        });
        
        // Transaction form submit
        document.getElementById('transaction-form').addEventListener('submit', (event) => {
            event.preventDefault();
            this.addTransaction();
            this.hideModal();
            document.getElementById('transaction-form').reset();
        });
        
        // Transaction type change for category dropdown
        this.transactionTypeSelect.addEventListener('change', () => {
            this.updateCategoryDropdown();
        });
        
        // Filter inputs
        this.typeFilterSelect.addEventListener('change', () => this.filterTransactions());
        this.categoryFilterSelect.addEventListener('change', () => this.filterTransactions());
        this.pocketFilterSelect.addEventListener('change', () => this.filterTransactions());
        this.dateFromInput.addEventListener('change', () => this.filterTransactions());
        this.dateToInput.addEventListener('change', () => this.filterTransactions());
    }
    
    /**
     * Set the current date in the date input field
     */
    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        this.transactionDateInput.value = today;
    }
    
    /**
     * Show the transaction modal
     */
    showModal() {
        document.getElementById('transaction-modal').style.display = 'flex';
        this.updateCategoryDropdown();
        this.updatePocketDropdown();
    }
    
    /**
     * Hide the transaction modal
     */
    hideModal() {
        document.getElementById('transaction-modal').style.display = 'none';
    }
    
    /**
     * Update the category dropdown based on transaction type
     */
    updateCategoryDropdown() {
        const transactionType = this.transactionTypeSelect.value;
        const categories = this.store.getState().categories[transactionType];
        
        this.transactionCategorySelect.innerHTML = '';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            this.transactionCategorySelect.appendChild(option);
        });
    }

    /**
     * Update the pocket dropdown
     */
    updatePocketDropdown() {
        const pockets = this.store.getState().pockets;
        
        this.transactionPocketSelect.innerHTML = '';
        
        pockets.forEach(pocket => {
            const option = document.createElement('option');
            option.value = pocket.id;
            option.textContent = pocket.name;
            this.transactionPocketSelect.appendChild(option);
        });
    }
    
    /**
     * Update the category filter dropdown
     */
    updateCategoryFilterDropdown() {
        const allCategories = [
            ...this.store.getState().categories.income,
            ...this.store.getState().categories.expense
        ];
        
        // Clear existing options except the first one ("All Categories")
        while (this.categoryFilterSelect.options.length > 1) {
            this.categoryFilterSelect.options.remove(1);
        }
        
        // Add categories to the filter dropdown
        allCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            this.categoryFilterSelect.appendChild(option);
        });
    }

    /**
     * Update the pocket filter dropdown
     */
    updatePocketFilterDropdown() {
        const pockets = this.store.getState().pockets;
        
        // Clear existing options except the first one ("All Pockets")
        while (this.pocketFilterSelect.options.length > 1) {
            this.pocketFilterSelect.options.remove(1);
        }
        
        // Add pockets to the filter dropdown
        pockets.forEach(pocket => {
            const option = document.createElement('option');
            option.value = pocket.id;
            option.textContent = pocket.name;
            this.pocketFilterSelect.appendChild(option);
        });
    }
    
    /**
     * Add a new transaction
     */
    addTransaction() {
        const transaction = {
            type: this.transactionTypeSelect.value,
            amount: parseFloat(this.transactionAmountInput.value),
            category: this.transactionCategorySelect.value,
            pocketId: this.transactionPocketSelect.value,
            date: this.transactionDateInput.value,
            description: this.transactionDescriptionInput.value || '',
        };
        
        this.store.addTransaction(transaction);
        this.render();
    }
    
    /**
     * Delete a transaction
     * @param {string} transactionId - The ID of the transaction to delete
     */
    deleteTransaction(transactionId) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.store.deleteTransaction(transactionId);
            this.render();
        }
    }
    
    /**
     * Filter transactions based on selected filters
     */
    filterTransactions() {
        const typeFilter = this.typeFilterSelect.value;
        const categoryFilter = this.categoryFilterSelect.value;
        const pocketFilter = this.pocketFilterSelect.value;
        const fromDate = this.dateFromInput.value;
        const toDate = this.dateToInput.value;
        
        let filteredTransactions = [...this.store.getState().transactions];
        
        // Filter by type
        if (typeFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(transaction => transaction.type === typeFilter);
        }
        
        // Filter by category
        if (categoryFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(transaction => transaction.category === categoryFilter);
        }
        
        // Filter by pocket
        if (pocketFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(transaction => transaction.pocketId === pocketFilter);
        }
        
        // Filter by date range
        if (fromDate && toDate) {
            filteredTransactions = filteredTransactions.filter(transaction => {
                return transaction.date >= fromDate && transaction.date <= toDate;
            });
        } else if (fromDate) {
            filteredTransactions = filteredTransactions.filter(transaction => transaction.date >= fromDate);
        } else if (toDate) {
            filteredTransactions = filteredTransactions.filter(transaction => transaction.date <= toDate);
        }
        
        // Sort by date (newest first)
        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        this.renderTransactionsList(filteredTransactions);
    }
    
    /**
     * Render the transactions list
     * @param {Array} transactions - The transactions to render
     */
    renderTransactionsList(transactions) {
        if (!this.transactionsList) return;
        
        this.transactionsList.innerHTML = '';
        
        if (transactions.length === 0) {
            this.transactionsList.innerHTML = '<div class="empty-state">No transactions found</div>';
            return;
        }
        
        const currencySymbol = this.store.getState().currency;
        const pockets = this.store.getState().pockets;
        
        transactions.forEach(transaction => {
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
                        <span class="transaction-amount ${transaction.type}">${currencySymbol} ${formatNumber(transaction.amount)}</span>
                    </div>
                    <div class="transaction-meta">
                        <span class="transaction-date">${formatDate(transaction.date)}</span>
                        <span class="transaction-pocket">${pocket.name}</span>
                        ${transaction.description ? `<span class="transaction-description">${transaction.description}</span>` : ''}
                    </div>
                </div>
                ${isTransfer ? '' : '<button class="delete-transaction">&times;</button>'}
            `;
            
            transactionElement.innerHTML = transactionContent;
            
            // Add delete event listener if not a transfer transaction
            if (!isTransfer) {
                const deleteButton = transactionElement.querySelector('.delete-transaction');
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteTransaction(transaction.id);
                });
            }
            
            this.transactionsList.appendChild(transactionElement);
        });
    }
    
    /**
     * Render the transactions component
     */
    render() {
        this.updateCategoryDropdown();
        this.updateCategoryFilterDropdown();
        this.updatePocketDropdown();
        this.updatePocketFilterDropdown();
        this.filterTransactions();
    }
} 