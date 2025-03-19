import { formatNumber, formatDate, formatBillingCycle, getCategoryInitial } from '../utils/helpers.js';

/**
 * Subscriptions component for handling subscription functionality
 */
export default class Subscriptions {
    /**
     * Create a Subscriptions component
     * @param {Object} store - The application store
     */
    constructor(store) {
        this.store = store;
        
        // DOM Elements
        this.subscriptionsList = document.getElementById('subscriptions-list');
        
        // Modal elements
        this.subscriptionNameInput = document.getElementById('subscription-name');
        this.subscriptionAmountInput = document.getElementById('subscription-amount');
        this.subscriptionCategorySelect = document.getElementById('subscription-category');
        this.subscriptionCycleSelect = document.getElementById('subscription-cycle');
        this.subscriptionNextDateInput = document.getElementById('subscription-next-date');
        this.subscriptionPocketSelect = document.getElementById('subscription-pocket');
        
        // Set up event listeners
        this.initEventListeners();
    }
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Add subscription button
        document.getElementById('add-subscription-btn').addEventListener('click', () => {
            this.setCurrentDate();
            this.showModal();
        });
        
        // Modal close button
        document.querySelector('#subscription-modal .close').addEventListener('click', () => {
            this.hideModal();
        });

        // Modal cancel button
        document.querySelector('#subscription-modal .modal-cancel').addEventListener('click', () => {
            this.hideModal();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target.id === 'subscription-modal') {
                this.hideModal();
            }
        });
        
        // Subscription form submit
        document.getElementById('subscription-form').addEventListener('submit', (event) => {
            event.preventDefault();
            this.addSubscription();
            this.hideModal();
            document.getElementById('subscription-form').reset();
        });
    }
    
    /**
     * Set the current date in the date input field
     */
    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        this.subscriptionNextDateInput.value = today;
    }
    
    /**
     * Show the subscription modal
     */
    showModal() {
        document.getElementById('subscription-modal').style.display = 'flex';
        this.updateCategoryDropdown();
        this.updatePocketDropdown();
    }
    
    /**
     * Hide the subscription modal
     */
    hideModal() {
        document.getElementById('subscription-modal').style.display = 'none';
    }
    
    /**
     * Update the category dropdown for subscriptions
     */
    updateCategoryDropdown() {
        const expenseCategories = this.store.getState().categories.expense;
        
        this.subscriptionCategorySelect.innerHTML = '';
        
        expenseCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            this.subscriptionCategorySelect.appendChild(option);
        });
    }

    /**
     * Update the pocket dropdown
     */
    updatePocketDropdown() {
        const pockets = this.store.getState().pockets;
        
        this.subscriptionPocketSelect.innerHTML = '';
        
        pockets.forEach(pocket => {
            const option = document.createElement('option');
            option.value = pocket.id;
            option.textContent = pocket.name;
            this.subscriptionPocketSelect.appendChild(option);
        });
    }
    
    /**
     * Add a new subscription
     */
    addSubscription() {
        const subscription = {
            name: this.subscriptionNameInput.value,
            amount: parseFloat(this.subscriptionAmountInput.value),
            category: this.subscriptionCategorySelect.value,
            billingCycle: this.subscriptionCycleSelect.value,
            nextBillingDate: this.subscriptionNextDateInput.value,
            pocketId: this.subscriptionPocketSelect.value,
        };
        
        this.store.addSubscription(subscription);
        this.render();
    }
    
    /**
     * Delete a subscription
     * @param {string} subscriptionId - The ID of the subscription to delete
     */
    deleteSubscription(subscriptionId) {
        if (confirm('Are you sure you want to delete this subscription?')) {
            this.store.deleteSubscription(subscriptionId);
            this.render();
        }
    }
    
    /**
     * Format the billing cycle for display
     * @param {string} cycle - The billing cycle (weekly, monthly, etc.)
     * @returns {string} The formatted billing cycle
     */
    formatBillingCycle(cycle) {
        switch (cycle) {
            case 'weekly':
                return 'Weekly';
            case 'monthly':
                return 'Monthly';
            case 'quarterly':
                return 'Every 3 months';
            case 'yearly':
                return 'Yearly';
            default:
                return cycle;
        }
    }
    
    /**
     * Calculate the next billing date
     * @param {string} currentDate - The current billing date
     * @param {string} cycle - The billing cycle
     * @returns {string} The next billing date
     */
    calculateNextBillingDate(currentDate, cycle) {
        const date = new Date(currentDate);
        
        switch (cycle) {
            case 'weekly':
                date.setDate(date.getDate() + 7);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'quarterly':
                date.setMonth(date.getMonth() + 3);
                break;
            case 'yearly':
                date.setFullYear(date.getFullYear() + 1);
                break;
            default:
                break;
        }
        
        return date.toISOString().split('T')[0];
    }
    
    /**
     * Render the subscriptions list
     */
    renderSubscriptionsList() {
        if (!this.subscriptionsList) return;
        
        this.subscriptionsList.innerHTML = '';
        
        const subscriptions = this.store.getState().subscriptions;
        
        if (subscriptions.length === 0) {
            this.subscriptionsList.innerHTML = '<div class="empty-state">No subscriptions found</div>';
            return;
        }
        
        const currencySymbol = this.store.getState().currency;
        const pockets = this.store.getState().pockets;
        
        subscriptions.forEach(subscription => {
            const subscriptionElement = document.createElement('div');
            subscriptionElement.className = 'subscription-item';
            
            const pocket = pockets.find(p => p.id === subscription.pocketId) || { name: 'Unknown' };
            
            const subscriptionContent = `
                <div class="subscription-category">
                    <span class="category-icon">${getCategoryInitial(subscription.category)}</span>
                </div>
                <div class="subscription-details">
                    <div class="subscription-name">
                        <span>${subscription.name}</span>
                        <span class="subscription-amount">${currencySymbol} ${formatNumber(subscription.amount)}</span>
                    </div>
                    <div class="subscription-meta">
                        <span class="subscription-cycle">${this.formatBillingCycle(subscription.billingCycle)}</span>
                        <span class="subscription-date">Next: ${formatDate(subscription.nextBillingDate)}</span>
                        <span class="subscription-pocket">${pocket.name}</span>
                    </div>
                </div>
                <div class="subscription-actions">
                    <button class="delete-subscription">&times;</button>
                </div>
            `;
            
            subscriptionElement.innerHTML = subscriptionContent;
            
            // Add delete event listener
            const deleteButton = subscriptionElement.querySelector('.delete-subscription');
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteSubscription(subscription.id);
            });
            
            this.subscriptionsList.appendChild(subscriptionElement);
        });
    }
    
    /**
     * Render the subscriptions component
     */
    render() {
        this.updateCategoryDropdown();
        this.updatePocketDropdown();
        this.renderSubscriptionsList();
    }
} 