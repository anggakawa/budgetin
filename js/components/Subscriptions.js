import { formatNumber, formatDate, formatBillingCycle, getCategoryInitial } from '../utils/helpers.js';

/**
 * Subscriptions component for handling subscriptions UI and functionality
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
        this.subscriptionBillingCycleSelect = document.getElementById('subscription-billing-cycle');
        this.subscriptionNextBillingInput = document.getElementById('subscription-next-billing');
        this.subscriptionDescriptionInput = document.getElementById('subscription-description');
        
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
     * Set the current date in the next billing date field
     */
    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        this.subscriptionNextBillingInput.value = today;
    }
    
    /**
     * Show the subscription modal
     */
    showModal() {
        document.getElementById('subscription-modal').style.display = 'flex';
        this.updateCategoryDropdown();
    }
    
    /**
     * Hide the subscription modal
     */
    hideModal() {
        document.getElementById('subscription-modal').style.display = 'none';
    }
    
    /**
     * Update the category dropdown
     */
    updateCategoryDropdown() {
        // Use expense categories for subscriptions
        const categories = this.store.getState().categories.expense;
        
        this.subscriptionCategorySelect.innerHTML = '';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            this.subscriptionCategorySelect.appendChild(option);
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
            billingCycle: this.subscriptionBillingCycleSelect.value,
            nextBillingDate: this.subscriptionNextBillingInput.value,
            description: this.subscriptionDescriptionInput.value || '',
        };
        
        this.store.addSubscription(subscription);
        this.render();
    }
    
    /**
     * Calculate monthly equivalent cost
     * @param {Object} subscription - The subscription object
     * @returns {number} - Monthly cost equivalent
     */
    calculateMonthlyCost(subscription) {
        const amount = parseFloat(subscription.amount);
        
        switch (subscription.billingCycle) {
            case 'weekly':
                return amount * 4.33; // Average weeks in a month
            case 'monthly':
                return amount;
            case 'quarterly':
                return amount / 3;
            case 'annually':
                return amount / 12;
            default:
                return amount;
        }
    }
    
    /**
     * Delete a subscription
     * @param {string} subscriptionId - ID of the subscription to delete
     */
    deleteSubscription(subscriptionId) {
        if (confirm('Are you sure you want to delete this subscription?')) {
            this.store.deleteSubscription(subscriptionId);
            this.render();
        }
    }
    
    /**
     * Render the subscriptions list
     */
    renderSubscriptionsList() {
        const subscriptions = this.store.getState().subscriptions;
        
        // Clear the list
        this.subscriptionsList.innerHTML = '';
        
        if (subscriptions.length === 0) {
            this.subscriptionsList.innerHTML = '<div class="no-data">No subscriptions found</div>';
            return;
        }
        
        // Sort subscriptions by next billing date
        const sortedSubscriptions = [...subscriptions].sort((a, b) => 
            new Date(a.nextBillingDate) - new Date(b.nextBillingDate)
        );
        
        // Add each subscription
        sortedSubscriptions.forEach(subscription => {
            const item = document.createElement('div');
            item.className = 'subscription-item';
            
            const monthlyCost = this.calculateMonthlyCost(subscription);
            const currency = this.store.getState().currency;
            
            item.innerHTML = `
                <div class="subscription-info">
                    <div class="category-icon">${getCategoryInitial(subscription.category)}</div>
                    <div class="subscription-details">
                        <div class="subscription-title">${subscription.name}</div>
                        <div class="subscription-date">Next billing: ${formatDate(subscription.nextBillingDate)} (${formatBillingCycle(subscription.billingCycle)})</div>
                        ${subscription.description ? `<div class="subscription-description">${subscription.description}</div>` : ''}
                        <div class="monthly-cost">Monthly equivalent: ${currency} ${formatNumber(monthlyCost)}</div>
                    </div>
                </div>
                <div class="subscription-amount">${currency} ${formatNumber(subscription.amount)}</div>
                <div class="subscription-actions">
                    <div class="delete-subscription" data-id="${subscription.id}">×</div>
                </div>
            `;
            
            this.subscriptionsList.appendChild(item);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-subscription').forEach(button => {
            button.addEventListener('click', (e) => {
                const subscriptionId = e.target.getAttribute('data-id');
                this.deleteSubscription(subscriptionId);
            });
        });
    }
    
    /**
     * Render the subscriptions page
     */
    render() {
        this.renderSubscriptionsList();
    }
} 