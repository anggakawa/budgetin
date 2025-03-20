import { formatNumber, getCategoryInitial } from '../utils/helpers.js';

/**
 * Calendar component for displaying transactions on a calendar
 */
export default class Calendar {
    /**
     * Create a Calendar component
     * @param {Object} store - The application store
     */
    constructor(store) {
        this.store = store;
        this.currentDate = new Date();
        this.selectedDate = null;
        
        // DOM Elements that will be created
        this.calendarContainer = null;
        this.calendarMonthYear = null;
        this.calendarGrid = null;
        this.dailyTransactionsList = null;
        this.transactionModal = null;
        
        // Month names for header
        this.months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        // Day names for header
        this.days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Intensity levels for the heatmap
        this.intensityLevels = {
            income: ['income-level-0', 'income-level-1', 'income-level-2', 'income-level-3', 'income-level-4'],
            expense: ['expense-level-0', 'expense-level-1', 'expense-level-2', 'expense-level-3', 'expense-level-4']
        };
    }
    
    /**
     * Set up event listeners for calendar navigation
     */
    initEventListeners() {
        // Previous month button
        document.getElementById('prev-month').addEventListener('click', () => {
            this.previousMonth();
        });
        
        // Next month button
        document.getElementById('next-month').addEventListener('click', () => {
            this.nextMonth();
        });
        
        // Today button
        document.getElementById('today-button').addEventListener('click', () => {
            this.currentDate = new Date();
            this.renderCalendar();
        });

        // Modal close button
        document.querySelector('#calendar-transactions-modal .close').addEventListener('click', () => {
            this.hideModal();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target.id === 'calendar-transactions-modal') {
                this.hideModal();
            }
        });
    }
    
    /**
     * Navigate to the previous month
     */
    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }
    
    /**
     * Navigate to the next month
     */
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }
    
    /**
     * Render calendar for the current month
     */
    renderCalendar() {
        // Update month/year header
        this.calendarMonthYear.textContent = `${this.months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        
        // Generate the calendar grid
        this.generateCalendarGrid();
    }
    
    /**
     * Format a date to YYYY-MM-DD string for comparison
     * @param {Date} date - The date to format
     * @returns {string} Formatted date string
     */
    formatDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    /**
     * Get the total transactions for a specific date
     * @param {Date} date - The date to check
     * @returns {Object} Transaction totals (income, expense, balance)
     */
    getDailyTransactions(date) {
        // Format date as YYYY-MM-DD without timezone issues
        const dateString = this.formatDateString(date);
        
        const transactions = this.store.getState().transactions.filter(
            transaction => transaction.date === dateString
        );
        
        let income = 0;
        let expense = 0;
        
        transactions.forEach(transaction => {
            const amount = parseFloat(transaction.amount);
            if (transaction.type === 'income') {
                income += amount;
            } else if (transaction.type === 'expense') {
                expense += amount;
            }
        });
        
        return {
            transactions,
            income,
            expense,
            balance: income - expense,
            count: transactions.length
        };
    }
    
    /**
     * Calculate the intensity level for heatmap
     * @param {number} amount - The transaction amount
     * @param {string} type - The transaction type ('income' or 'expense')
     * @param {number} maxAmount - The maximum amount for the month (used for scaling)
     * @returns {number} - Intensity level (0-4)
     */
    calculateIntensityLevel(amount, type, maxAmount) {
        if (amount === 0) return 0;
        
        // Calculate percentage of max value (capped at 100%)
        const percentage = Math.min((amount / maxAmount) * 100, 100);
        
        // Map to intensity levels (0-4)
        if (percentage < 25) return 1;
        if (percentage < 50) return 2;
        if (percentage < 75) return 3;
        return 4;
    }
    
    /**
     * Calculate maximum daily transaction amounts for the month
     * @returns {Object} Max income and expense amounts
     */
    getMonthlyMaxAmounts() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        let maxIncome = 0;
        let maxExpense = 0;
        
        // Loop through each day of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const currentDate = new Date(year, month, day);
            const dailyData = this.getDailyTransactions(currentDate);
            
            maxIncome = Math.max(maxIncome, dailyData.income);
            maxExpense = Math.max(maxExpense, dailyData.expense);
        }
        
        return { maxIncome, maxExpense };
    }
    
    /**
     * Generate the calendar grid for the current month
     */
    generateCalendarGrid() {
        this.calendarGrid.innerHTML = '';
        
        // Get the first day of the month
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        
        // Get the last day of the month
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        
        // Get the day of the week for the first day (0-6)
        const firstDayIndex = firstDay.getDay();
        
        // Get total days in the month
        const totalDays = lastDay.getDate();
        
        // Calculate max amounts for scaling
        const { maxIncome, maxExpense } = this.getMonthlyMaxAmounts();
        
        // Add day headers
        this.days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            this.calendarGrid.appendChild(dayHeader);
        });
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayIndex; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            this.calendarGrid.appendChild(emptyDay);
        }
        
        // Create calendar days
        for (let day = 1; day <= totalDays; day++) {
            // Create date object for this day (keeping time at 00:00:00)
            const currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            const dateCell = document.createElement('div');
            dateCell.className = 'calendar-day';
            
            // Check if it's today
            const today = new Date();
            const todayFormatted = this.formatDateString(today);
            const currentDateFormatted = this.formatDateString(currentDate);
            
            if (currentDateFormatted === todayFormatted) {
                dateCell.classList.add('today');
            }
            
            // Check if it's the selected date
            if (this.selectedDate && this.formatDateString(currentDate) === this.formatDateString(this.selectedDate)) {
                dateCell.classList.add('selected');
            }
            
            // Get transactions for this day
            const dailyData = this.getDailyTransactions(currentDate);
            
            // Determine which type has higher value
            const dominantType = dailyData.income > dailyData.expense ? 'income' : 'expense';
            const dominantAmount = Math.max(dailyData.income, dailyData.expense);
            
            // Calculate intensity level
            const maxAmount = dominantType === 'income' ? maxIncome : maxExpense;
            const intensityLevel = this.calculateIntensityLevel(
                dominantAmount, 
                dominantType, 
                maxAmount
            );
            
            // Add intensity class if there are transactions
            if (dailyData.count > 0) {
                dateCell.classList.add(this.intensityLevels[dominantType][intensityLevel]);
            }
            
            // Create day number element
            const dayNumberElement = document.createElement('div');
            dayNumberElement.className = 'day-number';
            dayNumberElement.textContent = day;
            dateCell.appendChild(dayNumberElement);
            
            // Create transaction summary if there are transactions
            if (dailyData.count > 0) {
                const transactionSummary = document.createElement('div');
                transactionSummary.className = `day-transaction-summary ${dominantType}`;
                
                // Create compact indicator elements
                const indicator = document.createElement('div');
                indicator.className = 'transaction-indicator';
                
                // Show number of transactions and dominant amount with an appropriate icon
                indicator.innerHTML = `<span>${dailyData.count}</span>`;
                transactionSummary.appendChild(indicator);
                
                // Add amount label
                const amountLabel = document.createElement('div');
                amountLabel.className = 'transaction-amount-label';
                amountLabel.innerHTML = `${dominantType === 'income' ? '+' : '-'}${this.store.getState().currency}${formatNumber(dominantAmount)}`;
                transactionSummary.appendChild(amountLabel);
                
                dateCell.appendChild(transactionSummary);
            }
            
            // Explicitly create a separate element for the click handler
            const clickOverlay = document.createElement('div');
            clickOverlay.className = 'day-click-overlay';
            
            // Add click event to show daily transactions
            clickOverlay.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                this.showModal(new Date(currentDate));
            });
            
            dateCell.appendChild(clickOverlay);
            this.calendarGrid.appendChild(dateCell);
        }
    }
    
    /**
     * Show the transactions modal for a specific date
     * @param {Date} date - The date to show transactions for
     */
    showModal(date) {
        this.selectedDate = date;
        document.getElementById('calendar-transactions-modal').style.display = 'flex';
        this.showDailyTransactions(date);
    }

    /**
     * Hide the transactions modal
     */
    hideModal() {
        document.getElementById('calendar-transactions-modal').style.display = 'none';
    }
    
    /**
     * Show transactions for a specific date
     * @param {Date} date - The date to show transactions for
     */
    showDailyTransactions(date) {
        const dailyData = this.getDailyTransactions(date);
        const currency = this.store.getState().currency;
        
        // Update the daily transactions header
        const dailyTransactionsHeader = document.getElementById('modal-transactions-header');
        const formattedDate = date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        dailyTransactionsHeader.textContent = formattedDate;
        
        // Update the summary cards
        document.getElementById('modal-daily-income').textContent = `${currency} ${formatNumber(dailyData.income)}`;
        document.getElementById('modal-daily-expenses').textContent = `${currency} ${formatNumber(dailyData.expense)}`;
        document.getElementById('modal-daily-balance').textContent = `${currency} ${formatNumber(dailyData.balance)}`;
        
        // Clear the transactions list
        this.dailyTransactionsList.innerHTML = '';
        
        // Show message if no transactions
        if (dailyData.transactions.length === 0) {
            this.dailyTransactionsList.innerHTML = '<div class="no-data">No transactions for this date</div>';
            return;
        }
        
        // Sort transactions by amount (largest first)
        const sortedTransactions = [...dailyData.transactions].sort((a, b) => 
            parseFloat(b.amount) - parseFloat(a.amount)
        );
        
        // Add transactions to the list
        sortedTransactions.forEach(transaction => {
            const item = document.createElement('div');
            item.className = 'transaction-item';
            
            const amountClass = transaction.type === 'income' ? 'income-amount' : 'expense-amount';
            const sign = transaction.type === 'income' ? '+' : '-';
            
            item.innerHTML = `
                <div class="transaction-info">
                    <div class="category-icon">${getCategoryInitial(transaction.category)}</div>
                    <div class="transaction-details">
                        <div class="transaction-title">${transaction.category}</div>
                        ${transaction.description ? `<div class="transaction-description">${transaction.description}</div>` : ''}
                    </div>
                </div>
                <div class="transaction-amount ${amountClass}">${sign} ${currency} ${formatNumber(transaction.amount)}</div>
            `;
            
            this.dailyTransactionsList.appendChild(item);
        });
    }
    
    /**
     * Render the calendar view
     */
    render() {
        const calendarPage = document.getElementById('calendar');
        
        // First-time setup if needed
        if (!this.calendarContainer) {
            // Create the calendar container and structure
            calendarPage.innerHTML = `
                <h2>Calendar View</h2>
                
                <div class="calendar-container">
                    <div class="calendar-header">
                        <div class="calendar-nav-controls">
                            <button id="prev-month" class="month-nav">&lt;</button>
                            <h3 id="calendar-month-year"></h3>
                            <button id="next-month" class="month-nav">&gt;</button>
                        </div>
                        <button id="today-button" class="today-btn">Today</button>
                    </div>
                    
                    <div class="calendar-grid" id="calendar-grid"></div>
                </div>
                
                <!-- Modal for displaying daily transactions -->
                <div id="calendar-transactions-modal" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 id="modal-transactions-header">Transactions</h3>
                            <span class="close">&times;</span>
                        </div>
                        <div class="modal-body">
                            <div class="daily-summary-cards">
                                <div class="summary-card">
                                    <div class="summary-label">Income</div>
                                    <div class="summary-value income" id="modal-daily-income">$0.00</div>
                                </div>
                                <div class="summary-card">
                                    <div class="summary-label">Expenses</div>
                                    <div class="summary-value expense" id="modal-daily-expenses">$0.00</div>
                                </div>
                                <div class="summary-card">
                                    <div class="summary-label">Balance</div>
                                    <div class="summary-value" id="modal-daily-balance">$0.00</div>
                                </div>
                            </div>
                            
                            <div class="transactions-list" id="daily-transactions-list"></div>
                        </div>
                    </div>
                </div>
                
                <style>
                    .calendar-container {
                        background-color: white;
                        border: 2px solid var(--border-color);
                        box-shadow: var(--shadow);
                        margin-bottom: 2rem;
                    }
                    
                    .calendar-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 1rem;
                        border-bottom: 2px solid var(--border-color);
                        flex-wrap: wrap;
                        row-gap: 10px;
                    }
                    
                    .calendar-nav-controls {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    
                    #calendar-month-year {
                        margin: 0;
                        min-width: 140px;
                        text-align: center;
                    }
                    
                    .month-nav {
                        background-color: white;
                        color: var(--dark-color);
                        font-weight: bold;
                        width: 36px;
                        height: 36px;
                        min-width: 36px;
                        padding: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .today-btn {
                        background-color: var(--secondary-color);
                        font-size: 0.875rem;
                        padding: 0.5rem 1rem;
                        white-space: nowrap;
                    }
                    
                    .calendar-grid {
                        display: grid;
                        grid-template-columns: repeat(7, 1fr);
                        gap: 1px;
                        background-color: #ddd;
                    }
                    
                    .calendar-day-header {
                        background-color: var(--light-color);
                        padding: 0.5rem;
                        text-align: center;
                        font-weight: bold;
                        text-transform: uppercase;
                        font-size: 0.75rem;
                        letter-spacing: 1px;
                    }
                    
                    .calendar-day {
                        background-color: white;
                        min-height: 100px;
                        padding: 0.5rem;
                        position: relative;
                        cursor: pointer;
                        transition: var(--transition);
                    }
                    
                    .calendar-day:hover {
                        filter: brightness(0.95);
                    }
                    
                    .calendar-day.empty {
                        background-color: #f8f8f8;
                        cursor: default;
                    }
                    
                    .calendar-day.today {
                        border: 2px solid var(--info-color);
                    }
                    
                    .calendar-day.selected {
                        border: 2px solid var(--primary-color);
                    }
                    
                    /* GitHub-like heatmap styles for income */
                    .calendar-day.income-level-1 {
                        background-color: rgba(73, 197, 182, 0.1);
                    }
                    
                    .calendar-day.income-level-2 {
                        background-color: rgba(73, 197, 182, 0.3);
                    }
                    
                    .calendar-day.income-level-3 {
                        background-color: rgba(73, 197, 182, 0.5);
                    }
                    
                    .calendar-day.income-level-4 {
                        background-color: rgba(73, 197, 182, 0.8);
                    }
                    
                    /* GitHub-like heatmap styles for expense */
                    .calendar-day.expense-level-1 {
                        background-color: rgba(255, 84, 112, 0.1);
                    }
                    
                    .calendar-day.expense-level-2 {
                        background-color: rgba(255, 84, 112, 0.3);
                    }
                    
                    .calendar-day.expense-level-3 {
                        background-color: rgba(255, 84, 112, 0.5);
                    }
                    
                    .calendar-day.expense-level-4 {
                        background-color: rgba(255, 84, 112, 0.8);
                    }
                    
                    .day-number {
                        font-weight: bold;
                        margin-bottom: 0.5rem;
                    }
                    
                    .day-click-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        z-index: 10;
                    }
                    
                    .day-transaction-summary {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-size: 0.75rem;
                        width: 100%;
                        padding: 2px 3px;
                        height: auto;
                        overflow: hidden;
                        position: relative;
                        z-index: 5;
                    }
                    
                    .day-transaction-summary.income {
                        color: var(--secondary-color);
                    }
                    
                    .day-transaction-summary.expense {
                        color: var(--primary-color);
                    }
                    
                    .transaction-indicator {
                        display: flex;
                        align-items: center;
                        font-weight: bold;
                        font-size: 0.7rem;
                        white-space: nowrap;
                    }
                    
                    .transaction-amount-label {
                        font-size: 0.7rem;
                        color: white;
                        text-align: right;
                        white-space: nowrap;
                    }
                    
                    /* Modal Styles */
                    #calendar-transactions-modal .modal-content {
                        max-width: 600px;
                        max-height: 80vh;
                        overflow-y: auto;
                    }
                    
                    #calendar-transactions-modal .daily-summary-cards {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 1rem;
                        margin: 1rem 0 2rem;
                    }
                    
                    #calendar-transactions-modal .summary-card {
                        border: 1px solid var(--border-color);
                        padding: 1rem;
                        text-align: center;
                    }
                    
                    #calendar-transactions-modal .summary-label {
                        font-size: 0.875rem;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        opacity: 0.7;
                        margin-bottom: 0.5rem;
                    }
                    
                    #calendar-transactions-modal .summary-value {
                        font-size: 1.25rem;
                        font-weight: bold;
                    }
                    
                    #calendar-transactions-modal .summary-value.income {
                        color: var(--secondary-color);
                    }
                    
                    #calendar-transactions-modal .summary-value.expense {
                        color: var(--primary-color);
                    }
                    
                    .transaction-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 0.75rem;
                        border-bottom: 1px solid var(--border-color);
                    }
                    
                    .transaction-info {
                        display: flex;
                        align-items: center;
                    }
                    
                    .category-icon {
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        background-color: var(--light-color);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 1rem;
                    }
                    
                    .transaction-details {
                        display: flex;
                        flex-direction: column;
                    }
                    
                    .transaction-title {
                        font-weight: bold;
                    }
                    
                    .transaction-description {
                        font-size: 0.875rem;
                        color: #666;
                        margin-top: 0.25rem;
                    }
                    
                    .transaction-amount {
                        font-weight: bold;
                    }
                    
                    .income-amount {
                        color: var(--secondary-color);
                    }
                    
                    .expense-amount {
                        color: var(--primary-color);
                    }
                    
                    .no-data {
                        padding: 2rem;
                        text-align: center;
                        color: #666;
                        font-style: italic;
                    }
                    
                    @media (max-width: 768px) {
                        .calendar-grid {
                            grid-template-columns: repeat(7, 1fr);
                        }
                        
                        .calendar-day {
                            min-height: 60px;
                            padding: 0.25rem;
                        }
                        
                        .day-transaction-summary {
                            font-size: 0.65rem;
                            flex-direction: column;
                            padding: 1px;
                        }
                        
                        .transaction-indicator,
                        .transaction-amount-label {
                            font-size: 0.6rem;
                        }
                        
                        .calendar-header {
                            justify-content: center;
                        }
                        
                        #calendar-month-year {
                            min-width: 120px;
                            font-size: 1rem;
                        }
                        
                        .month-nav {
                            width: 30px;
                            height: 30px;
                            min-width: 30px;
                        }
                        
                        #calendar-transactions-modal .modal-content {
                            width: 95%;
                            max-height: 80vh;
                        }
                        
                        .transaction-item {
                            padding: 0.5rem;
                        }
                        
                        .category-icon {
                            width: 30px;
                            height: 30px;
                            margin-right: 0.5rem;
                        }
                    }
                    
                    @media (max-width: 480px) {
                        .calendar-day {
                            min-height: 45px;
                            padding: 0.15rem;
                        }
                        
                        .day-number {
                            margin-bottom: 0.2rem;
                            font-size: 0.8rem;
                        }
                        
                        .day-transaction-summary {
                            font-size: 0.55rem;
                        }
                        
                        .transaction-indicator,
                        .transaction-amount-label {
                            font-size: 0.55rem;
                        }
                        
                        .calendar-day-header {
                            padding: 0.25rem;
                            font-size: 0.65rem;
                        }
                    }
                </style>
            `;
            
            // Cache DOM references
            this.calendarContainer = document.querySelector('.calendar-container');
            this.calendarMonthYear = document.getElementById('calendar-month-year');
            this.calendarGrid = document.getElementById('calendar-grid');
            this.dailyTransactionsList = document.getElementById('daily-transactions-list');
            this.transactionModal = document.getElementById('calendar-transactions-modal');
            
            // Initialize event listeners
            this.initEventListeners();
            
            // Initial render of calendar
            this.renderCalendar();
        } else {
            // If container exists, just update the calendar
            this.renderCalendar();
        }
    }
} 