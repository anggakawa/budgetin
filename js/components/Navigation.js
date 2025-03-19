/**
 * Navigation component for handling page navigation
 */
export default class Navigation {
    /**
     * Create a Navigation component
     * @param {Object} store - The application store
     * @param {Object} components - Object containing page components
     */
    constructor(store, components) {
        this.store = store;
        this.components = components;
        
        // DOM Elements
        this.navLinks = document.querySelectorAll('nav a');
        this.viewAllLink = document.querySelector('.view-all');
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const pageId = link.getAttribute('data-page');
                this.changePage(pageId);
            });
        });
        
        // View All link
        if (this.viewAllLink) {
            this.viewAllLink.addEventListener('click', (event) => {
                event.preventDefault();
                const pageId = this.viewAllLink.getAttribute('data-page');
                this.changePage(pageId);
            });
        }
    }
    
    /**
     * Change the active page
     * @param {string} pageId - The ID of the page to show
     */
    changePage(pageId) {
        // Update active link
        this.navLinks.forEach(link => {
            if (link.getAttribute('data-page') === pageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show the selected page
        document.getElementById(pageId).classList.add('active');
        
        // Update store
        this.store.setState('currentPage', pageId);
        
        // Render the component for the active page
        if (this.components[pageId]) {
            this.components[pageId].render();
        }
    }
    
    /**
     * Initialize the first page to show
     */
    initDefaultPage() {
        const defaultPage = this.store.getState().currentPage || 'dashboard';
        this.changePage(defaultPage);
    }
} 