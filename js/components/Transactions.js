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
        this.dateFromInput = document.getElementById('date-from');
        this.dateToInput = document.getElementById('date-to');
        
        // Modal elements
        this.transactionTypeSelect = document.getElementById('transaction-type');
        this.transactionAmountInput = document.getElementById('transaction-amount');
        this.transactionCategorySelect = document.getElementById('transaction-category');
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
     * Add a new transaction
     */
    addTransaction() {
        const transaction = {
            type: this.transactionTypeSelect.value,
            amount: parseFloat(this.transactionAmountInput.value),
            category: this.transactionCategorySelect.value,
            date: this.transactionDateInput.value,
            description: this.transactionDescriptionInput.value || '',
        };
        
        this.store.addTransaction(transaction);
        this.render();
    }
    
    /**
     * Delete a transaction
     * @param {string} transactionId - ID of the transaction to delete
     */
    deleteTransaction(transactionId) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.store.deleteTransaction(transactionId);
            this.render();
        }
    }
    
    /**
     * Filter transactions based on selected criteria
     */
    filterTransactions() {
        let filteredTransactions = [...this.store.getState().transactions];
        
        // Filter by type
        const typeFilter = this.typeFilterSelect.value;
        filteredTransactions = filterByProperty(filteredTransactions, 'type', typeFilter);
        
        // Filter by category
        const categoryFilter = this.categoryFilterSelect.value;
        if (categoryFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.category === categoryFilter);
        }
        
        // Filter by date range
        const dateRange = createDateRange(this.dateFromInput.value, this.dateToInput.value);
        
        filteredTransactions = filteredTransactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= dateRange.from && transactionDate <= dateRange.to;
        });
        
        // Render the filtered transactions
        this.renderTransactionsList(filteredTransactions);
    }
    
    /**
     * Render the transactions list
     * @param {Array} transactions - Transactions to display
     */
    renderTransactionsList(transactions) {
        // Sort transactions by date, most recent first
        const sortedTransactions = [...transactions].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        // Clear the list
        this.transactionsList.innerHTML = '';
        
        if (sortedTransactions.length === 0) {
            this.transactionsList.innerHTML = '<div class="no-data">No transactions found</div>';
            return;
        }
        
        // Add each transaction
        sortedTransactions.forEach(transaction => {
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
                        ${transaction.description ? `<div class="transaction-description">${transaction.description}</div>` : ''}
                    </div>
                </div>
                <div class="transaction-amount ${amountClass}">${sign} ${currency} ${formatNumber(transaction.amount)}</div>
                <div class="transaction-actions">
                    <div class="delete-transaction" data-id="${transaction.id}">×</div>
                </div>
            `;
            
            this.transactionsList.appendChild(item);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-transaction').forEach(button => {
            button.addEventListener('click', (e) => {
                const transactionId = e.target.getAttribute('data-id');
                this.deleteTransaction(transactionId);
            });
        });
    }
    
    /**
     * Render the transactions page
     */
    render() {
        // Update the category filter dropdown
        this.updateCategoryFilterDropdown();
        
        // Apply filters and render
        this.filterTransactions();
    }
} 