import Store from './models/Store.js';
import Dashboard from './components/Dashboard.js';
import Transactions from './components/Transactions.js';
import Subscriptions from './components/Subscriptions.js';
import Settings from './components/Settings.js';
import Navigation from './components/Navigation.js';
import TrendAnalysis from './components/TrendAnalysis.js';
import Calendar from './components/Calendar.js';

/**
 * BudgetIn Application - Main entry point
 */
class App {
    /**
     * Initialize the application
     */
    constructor() {
        // Create application store
        this.store = new Store();
        
        // Initialize components
        this.initComponents();
        
        // Initialize currency display
        this.updateCurrencySymbols();
    }
    
    /**
     * Initialize UI components
     */
    initComponents() {
        // Create components
        this.dashboard = new Dashboard(this.store);
        this.transactions = new Transactions(this.store);
        this.subscriptions = new Subscriptions(this.store);
        this.trendAnalysis = new TrendAnalysis(this.store);
        this.calendar = new Calendar(this.store);
        this.settings = new Settings(this.store);
        
        // Create navigation with references to page components
        this.navigation = new Navigation(this.store, {
            dashboard: this.dashboard,
            transactions: this.transactions,
            subscriptions: this.subscriptions,
            trends: this.trendAnalysis,
            calendar: this.calendar,
            settings: this.settings
        });
        
        // Initialize navigation to show the default page
        this.navigation.initDefaultPage();
    }
    
    /**
     * Update currency symbols throughout the UI
     */
    updateCurrencySymbols() {
        const currency = this.store.getState().currency;
        document.querySelectorAll('.currency-symbol').forEach(element => {
            element.textContent = currency;
        });
    }
}

// Start the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 