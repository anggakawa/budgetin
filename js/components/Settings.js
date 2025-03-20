import Store from '../models/Store.js';
import { formatNumber } from '../utils/helpers.js';

/**
 * Settings component for handling application settings
 */
export default class Settings {
    /**
     * Create a Settings component
     * @param {Object} store - The application store
     */
    constructor(store) {
        this.store = store;
        
        // DOM Elements
        this.categoriesList = document.getElementById('categories-list');
        this.newCategoryNameInput = document.getElementById('new-category-name');
        this.categoryTypeRadios = document.getElementsByName('category-type');
        this.currencySelect = document.getElementById('currency-select');
        this.customCurrencySymbolInput = document.getElementById('custom-currency-symbol');
        this.customCurrencyNameInput = document.getElementById('custom-currency-name');
        
        // Set up event listeners
        this.initEventListeners();
    }
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Add category button
        document.getElementById('add-category-btn').addEventListener('click', () => {
            this.addCategory();
        });
        
        // Currency select change
        this.currencySelect.addEventListener('change', () => {
            if (this.currencySelect.value === 'custom') {
                // Show custom currency input
                document.getElementById('custom-currency-container').style.display = 'block';
            } else {
                // Hide custom currency input and save the selected currency
                document.getElementById('custom-currency-container').style.display = 'none';
                this.store.setState('currency', this.currencySelect.value);
                this.updateCurrencySymbols();
            }
        });
        
        // Save custom currency
        document.getElementById('save-custom-currency').addEventListener('click', () => {
            this.saveCustomCurrency();
        });
        
        // Data management buttons
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });
        
        document.getElementById('import-data').addEventListener('click', () => {
            this.importData();
        });
        
        document.getElementById('clear-data').addEventListener('click', () => {
            this.clearAllData();
        });

        // Add pocket button
        document.getElementById('add-pocket-btn').addEventListener('click', () => {
            this.showAddPocketModal();
        });

        // Save pocket button
        document.getElementById('save-pocket-btn').addEventListener('click', () => {
            this.savePocket();
        });

        // Transfer between pockets button
        document.getElementById('transfer-btn').addEventListener('click', () => {
            this.showTransferModal();
        });

        // Perform transfer button
        document.getElementById('perform-transfer-btn').addEventListener('click', () => {
            this.performTransfer();
        });

        // Close pocket modal
        document.querySelector('#pocket-modal .close').addEventListener('click', () => {
            this.hidePocketModal();
        });

        // Close transfer modal
        document.querySelector('#transfer-modal .close').addEventListener('click', () => {
            this.hideTransferModal();
        });

        // Close modals when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target.id === 'pocket-modal') {
                this.hidePocketModal();
            }
            if (event.target.id === 'transfer-modal') {
                this.hideTransferModal();
            }
        });
    }
    
    /**
     * Get the selected category type
     * @returns {string} - The selected category type (income/expense)
     */
    getSelectedCategoryType() {
        for (const radio of this.categoryTypeRadios) {
            if (radio.checked) {
                return radio.value;
            }
        }
        return 'expense'; // Default to expense
    }
    
    /**
     * Add a new category
     */
    addCategory() {
        const categoryName = this.newCategoryNameInput.value.trim();
        
        if (!categoryName) {
            alert('Please enter a category name');
            return;
        }
        
        const categoryType = this.getSelectedCategoryType();
        
        const success = this.store.addCategory(categoryType, categoryName);
        
        if (success) {
            this.newCategoryNameInput.value = '';
            this.render();
        } else {
            alert('This category already exists');
        }
    }
    
    /**
     * Delete a category
     * @param {string} categoryType - Type of category (income/expense)
     * @param {string} categoryName - Name of the category
     */
    deleteCategory(categoryType, categoryName) {
        const success = this.store.deleteCategory(categoryType, categoryName);
        
        if (success) {
            this.render();
        } else {
            alert('Cannot delete this category as it is being used by transactions');
        }
    }
    
    /**
     * Save a custom currency
     */
    saveCustomCurrency() {
        const symbol = this.customCurrencySymbolInput.value.trim();
        const name = this.customCurrencyNameInput.value.trim();
        
        if (!symbol || !name) {
            alert('Please enter both currency symbol and name');
            return;
        }
        
        // Add to custom currencies
        const newCurrency = {
            symbol: symbol,
            name: name
        };
        
        const customCurrencies = [...this.store.getState().customCurrencies, newCurrency];
        this.store.setState('customCurrencies', customCurrencies);
        this.store.setState('currency', symbol); // Set as current currency
        
        // Clear and hide custom currency input
        this.customCurrencySymbolInput.value = '';
        this.customCurrencyNameInput.value = '';
        document.getElementById('custom-currency-container').style.display = 'none';
        
        this.updateCurrencyDropdown();
        this.updateCurrencySymbols();
    }

    /**
     * Show the add/edit pocket modal
     * @param {string} pocketId - The ID of the pocket to edit (null for new pocket)
     */
    showAddPocketModal(pocketId = null) {
        const pocketModal = document.getElementById('pocket-modal');
        const pocketForm = document.getElementById('pocket-form');
        const modalTitle = pocketModal.querySelector('h2');
        const pocketNameInput = document.getElementById('pocket-name');
        const pocketColorInput = document.getElementById('pocket-color');
        const pocketIconSelect = document.getElementById('pocket-icon');
        const pocketInitialBalanceInput = document.getElementById('pocket-initial-balance');
        const pocketInitialBalanceGroup = document.getElementById('initial-balance-group');
        
        if (pocketId) {
            // Edit mode
            const pocket = this.store.getState().pockets.find(p => p.id === pocketId);
            if (pocket) {
                modalTitle.textContent = 'Edit Pocket';
                pocketNameInput.value = pocket.name;
                pocketColorInput.value = pocket.color;
                pocketIconSelect.value = pocket.icon;
                pocketForm.dataset.pocketId = pocketId;
                pocketInitialBalanceGroup.style.display = 'none';
            }
        } else {
            // Add mode
            modalTitle.textContent = 'Add Pocket';
            pocketNameInput.value = '';
            pocketColorInput.value = '#3498db';
            pocketIconSelect.value = 'wallet';
            pocketInitialBalanceInput.value = '0';
            pocketForm.dataset.pocketId = '';
            pocketInitialBalanceGroup.style.display = 'block';
        }
        
        pocketModal.style.display = 'flex';
    }

    /**
     * Hide the pocket modal
     */
    hidePocketModal() {
        document.getElementById('pocket-modal').style.display = 'none';
    }

    /**
     * Show the transfer between pockets modal
     */
    showTransferModal() {
        const transferModal = document.getElementById('transfer-modal');
        const fromPocketSelect = document.getElementById('from-pocket');
        const toPocketSelect = document.getElementById('to-pocket');
        const transferAmountInput = document.getElementById('transfer-amount');
        
        // Reset form
        transferAmountInput.value = '';
        
        // Update pocket dropdowns
        fromPocketSelect.innerHTML = '';
        toPocketSelect.innerHTML = '';
        
        const pockets = this.store.getState().pockets;
        const currency = this.store.getState().currency;
        
        pockets.forEach(pocket => {
            const balance = typeof pocket.balance === 'number' ? pocket.balance.toFixed(2) : '0.00';
            
            const fromOption = document.createElement('option');
            fromOption.value = pocket.id;
            fromOption.textContent = `${pocket.name} (${currency} ${balance})`;
            fromPocketSelect.appendChild(fromOption);
            
            const toOption = document.createElement('option');
            toOption.value = pocket.id;
            toOption.textContent = `${pocket.name} (${currency} ${balance})`;
            toPocketSelect.appendChild(toOption);
        });
        
        // Select different pockets by default
        if (pockets.length > 1) {
            toPocketSelect.selectedIndex = 1;
        }
        
        transferModal.style.display = 'flex';
    }

    /**
     * Hide the transfer modal
     */
    hideTransferModal() {
        document.getElementById('transfer-modal').style.display = 'none';
    }

    /**
     * Save a pocket (add new or update existing)
     */
    savePocket() {
        const pocketForm = document.getElementById('pocket-form');
        const pocketId = pocketForm.dataset.pocketId;
        const name = document.getElementById('pocket-name').value.trim();
        const color = document.getElementById('pocket-color').value;
        const icon = document.getElementById('pocket-icon').value;
        
        if (!name) {
            alert('Please enter a pocket name');
            return;
        }
        
        if (pocketId) {
            // Update existing pocket
            const success = this.store.updatePocket(pocketId, { name, color, icon });
            if (success) {
                this.hidePocketModal();
                this.render();
            } else {
                alert('Failed to update pocket');
            }
        } else {
            // Add new pocket
            const initialBalance = parseFloat(document.getElementById('pocket-initial-balance').value) || 0;
            const newPocketId = this.store.addPocket({ name, color, icon, initialBalance });
            if (newPocketId) {
                this.hidePocketModal();
                this.render();
            } else {
                alert('Failed to add pocket');
            }
        }
    }

    /**
     * Delete a pocket
     * @param {string} pocketId - The ID of the pocket to delete
     */
    deletePocket(pocketId) {
        if (confirm('Are you sure you want to delete this pocket? This action cannot be undone.')) {
            const success = this.store.deletePocket(pocketId);
            if (success) {
                this.render();
            } else {
                alert('Cannot delete this pocket as it is being used by transactions or it is the only pocket');
            }
        }
    }

    /**
     * Perform transfer between pockets
     */
    performTransfer() {
        const fromPocketId = document.getElementById('from-pocket').value;
        const toPocketId = document.getElementById('to-pocket').value;
        const amountInput = document.getElementById('transfer-amount').value;
        const amount = parseFloat(amountInput);
        
        if (!amount || isNaN(amount) || amount <= 0) {
            alert('Please enter a valid transfer amount');
            return;
        }
        
        if (fromPocketId === toPocketId) {
            alert('Please select different pockets for transfer');
            return;
        }
        
        const success = this.store.transferBetweenPockets(fromPocketId, toPocketId, amount);
        
        if (success) {
            this.hideTransferModal();
            this.render();
        } else {
            alert('Transfer failed. Please check the pocket balances and try again.');
        }
    }
    
    /**
     * Export application data
     */
    exportData() {
        const dataToExport = this.store.exportData();
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'budgetin_data.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    
    /**
     * Import application data
     */
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            
            if (!file) {
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = event => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    if (confirm('This will replace all your current data. Are you sure you want to continue?')) {
                        const success = this.store.importData(data);
                        
                        if (success) {
                            alert('Data imported successfully');
                            window.location.reload();
                        } else {
                            alert('Failed to import data');
                        }
                    }
                } catch (err) {
                    console.error('Error parsing imported data', err);
                    alert('Error importing data: Invalid JSON format');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    /**
     * Clear all application data
     */
    clearAllData() {
        if (confirm('This will delete all your data including transactions, subscriptions, and categories. This action cannot be undone. Are you sure you want to continue?')) {
            this.store.clearAllData();
            alert('All data has been cleared');
            window.location.reload();
        }
    }
    
    /**
     * Update the currency dropdown
     */
    updateCurrencyDropdown() {
        const customCurrencies = this.store.getState().customCurrencies;
        const currencySelect = this.currencySelect;
        
        // Find and remove existing custom currency options
        const customOptions = currencySelect.querySelectorAll('option.custom-currency');
        customOptions.forEach(option => option.remove());
        
        // Get the "Add Custom Currency" option
        const addCustomOption = currencySelect.querySelector('option[value="custom"]');
        
        // Add custom currencies before the "Add Custom Currency" option
        customCurrencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency.symbol;
            option.textContent = `${currency.symbol} - ${currency.name}`;
            option.classList.add('custom-currency');
            currencySelect.insertBefore(option, addCustomOption);
        });
        
        // Set the selected currency
        currencySelect.value = this.store.getState().currency;
    }
    
    /**
     * Update all currency symbols in the UI
     */
    updateCurrencySymbols() {
        const currencySymbol = this.store.getState().currency;
        const currencyElements = document.querySelectorAll('.currency-symbol');
        
        currencyElements.forEach(element => {
            element.textContent = currencySymbol;
        });
    }
    
    /**
     * Render the categories list
     */
    renderCategories() {
        const { categories } = this.store.getState();
        
        if (!this.categoriesList) return;
        
        this.categoriesList.innerHTML = '';
        
        // Create sections for income and expense categories
        const categoryTypes = ['income', 'expense'];
        
        categoryTypes.forEach(type => {
            const categorySection = document.createElement('div');
            categorySection.classList.add('category-section');
            
            const typeTitle = document.createElement('h4');
            typeTitle.textContent = type === 'income' ? 'Income Categories' : 'Expense Categories';
            categorySection.appendChild(typeTitle);
            
            const categoryItems = document.createElement('div');
            categoryItems.classList.add('category-items');
            
            categories[type].forEach(category => {
                const categoryItem = document.createElement('div');
                categoryItem.classList.add('category-item');
                
                const categoryName = document.createElement('span');
                categoryName.textContent = category;
                categoryItem.appendChild(categoryName);
                
                const deleteButton = document.createElement('button');
                deleteButton.classList.add('delete-btn');
                deleteButton.innerHTML = '&times;';
                deleteButton.addEventListener('click', () => this.deleteCategory(type, category));
                categoryItem.appendChild(deleteButton);
                
                categoryItems.appendChild(categoryItem);
            });
            
            categorySection.appendChild(categoryItems);
            this.categoriesList.appendChild(categorySection);
        });
    }

    /**
     * Render the pockets list
     */
    renderPockets() {
        const pocketsList = document.getElementById('pockets-list');
        const { pockets, currency } = this.store.getState();
        
        if (!pocketsList) return;
        
        pocketsList.innerHTML = '';
        
        pockets.forEach(pocket => {
            const pocketItem = document.createElement('div');
            pocketItem.classList.add('pocket-item');
            pocketItem.style.borderLeftColor = pocket.color;
            
            const pocketIcon = document.createElement('div');
            pocketIcon.classList.add('pocket-icon');
            pocketIcon.textContent = this.getPocketIconHTML(pocket.icon);
            pocketIcon.style.backgroundColor = pocket.color;
            pocketItem.appendChild(pocketIcon);
            
            const pocketInfo = document.createElement('div');
            pocketInfo.classList.add('pocket-info');
            
            const pocketName = document.createElement('div');
            pocketName.classList.add('pocket-name');
            pocketName.textContent = pocket.name;
            pocketInfo.appendChild(pocketName);
            
            const pocketBalance = document.createElement('div');
            pocketBalance.classList.add('pocket-balance');
            const balance = typeof pocket.balance === 'number' ? formatNumber(pocket.balance) : '0.00';
            pocketBalance.textContent = `${currency} ${balance}`;
            pocketInfo.appendChild(pocketBalance);
            pocketItem.appendChild(pocketInfo);
            
            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('pocket-actions');
            
            const editButton = document.createElement('button');
            editButton.classList.add('edit-btn');
            editButton.textContent = 'EDIT';
            editButton.addEventListener('click', () => this.showAddPocketModal(pocket.id));
            actionsDiv.appendChild(editButton);
            
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-btn');
            deleteButton.textContent = 'DELETE';
            deleteButton.addEventListener('click', () => this.deletePocket(pocket.id));
            actionsDiv.appendChild(deleteButton);
            
            pocketItem.appendChild(actionsDiv);
            
            pocketsList.appendChild(pocketItem);
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
     * Check if a category is a default category
     * @param {string} type - The category type
     * @param {string} name - The category name
     * @returns {boolean} True if it's a default category
     */
    isDefaultCategory(type, name) {
        return Array.isArray(Store.DEFAULT_CATEGORIES[type]) && 
               Store.DEFAULT_CATEGORIES[type].includes(name);
    }
    
    /**
     * Render the settings component
     */
    render() {
        this.renderCategories();
        this.renderPockets();
        this.updateCurrencyDropdown();
    }
} 