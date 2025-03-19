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
     * Export application data
     */
    exportData() {
        const dataToExport = this.store.exportData();
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileName = `budgetin_export_${new Date().toISOString().slice(0, 10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
    }
    
    /**
     * Import application data
     */
    importData() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    const success = this.store.importData(importedData);
                    
                    if (success) {
                        this.updateCurrencyDropdown();
                        this.updateCurrencySymbols();
                        this.render();
                        alert('Data imported successfully!');
                    } else {
                        alert('Error importing data. Invalid format.');
                    }
                } catch (error) {
                    alert('Error importing data. Please check the file format.');
                    console.error('Import error:', error);
                }
            };
            
            reader.readAsText(file);
        });
        
        fileInput.click();
    }
    
    /**
     * Clear all application data
     */
    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            this.store.clearAllData();
            this.render();
            alert('All data has been cleared.');
        }
    }
    
    /**
     * Update the currency dropdown with custom currencies
     */
    updateCurrencyDropdown() {
        const customCurrencies = this.store.getState().customCurrencies;
        const currentCurrency = this.store.getState().currency;
        
        // Clear custom currency options
        const options = this.currencySelect.options;
        for (let i = options.length - 1; i >= 0; i--) {
            if (options[i].classList.contains('custom-currency-option')) {
                options.remove(i);
            }
        }
        
        // Add custom currencies to the dropdown
        customCurrencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency.symbol;
            option.textContent = `${currency.symbol} - ${currency.name}`;
            option.classList.add('custom-currency-option');
            this.currencySelect.insertBefore(option, this.currencySelect.lastElementChild);
        });
        
        // Set current currency as selected
        this.currencySelect.value = currentCurrency;
    }
    
    /**
     * Update all currency symbols in the UI
     */
    updateCurrencySymbols() {
        const currency = this.store.getState().currency;
        document.querySelectorAll('.currency-symbol').forEach(element => {
            element.textContent = currency;
        });
    }
    
    /**
     * Render categories
     */
    renderCategories() {
        const categories = this.store.getState().categories;
        
        this.categoriesList.innerHTML = '';
        
        // Create section for income categories
        const incomeSection = document.createElement('div');
        incomeSection.className = 'category-section';
        incomeSection.innerHTML = '<h4>Income Categories</h4>';
        
        // Create section for expense categories
        const expenseSection = document.createElement('div');
        expenseSection.className = 'category-section';
        expenseSection.innerHTML = '<h4>Expense Categories</h4>';
        
        // Add income categories
        categories.income.forEach(category => {
            const item = document.createElement('div');
            item.className = 'category-item';
            
            item.innerHTML = `
                <span>${category}</span>
                <button class="delete-category" data-type="income" data-name="${category}">×</button>
            `;
            
            incomeSection.appendChild(item);
        });
        
        // Add expense categories
        categories.expense.forEach(category => {
            const item = document.createElement('div');
            item.className = 'category-item';
            
            item.innerHTML = `
                <span>${category}</span>
                <button class="delete-category" data-type="expense" data-name="${category}">×</button>
            `;
            
            expenseSection.appendChild(item);
        });
        
        // Add both sections to the list
        this.categoriesList.appendChild(incomeSection);
        this.categoriesList.appendChild(expenseSection);
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-category').forEach(button => {
            button.addEventListener('click', (e) => {
                const categoryType = e.target.getAttribute('data-type');
                const categoryName = e.target.getAttribute('data-name');
                this.deleteCategory(categoryType, categoryName);
            });
        });
    }
    
    /**
     * Render the settings page
     */
    render() {
        this.renderCategories();
        this.updateCurrencyDropdown();
    }
} 