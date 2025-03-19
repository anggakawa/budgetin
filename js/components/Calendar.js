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
        
        // Month names for header
        this.months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        // Day names for header
        this.days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
        
        // If there's a selected date, show its transactions
        if (this.selectedDate) {
            this.showDailyTransactions(this.selectedDate);
        } else {
            // Hide the daily transactions section if no date is selected
            document.getElementById('daily-transactions-section').style.display = 'none';
        }
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
            
            // Add transaction indicator if there are transactions
            const isPositiveBalance = dailyData.balance >= 0;
            
            dateCell.innerHTML = `
                <div class="day-number">${day}</div>
                ${dailyData.count > 0 ? `
                    <div class="day-transactions ${isPositiveBalance ? 'positive' : 'negative'}">
                        <span class="transaction-count">${dailyData.count}</span>
                        <span class="day-balance">${this.store.getState().currency} ${formatNumber(Math.abs(dailyData.balance))}</span>
                    </div>
                ` : ''}
            `;
            
            // Add click event to show daily transactions
            dateCell.addEventListener('click', () => {
                this.selectedDate = new Date(currentDate);
                this.renderCalendar();
                this.showDailyTransactions(currentDate);
            });
            
            this.calendarGrid.appendChild(dateCell);
        }
    }
    
    /**
     * Show transactions for a specific date
     * @param {Date} date - The date to show transactions for
     */
    showDailyTransactions(date) {
        const dailyData = this.getDailyTransactions(date);
        const currency = this.store.getState().currency;
        
        // Update the daily transactions header
        const dailyTransactionsHeader = document.getElementById('daily-transactions-header');
        const formattedDate = date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        dailyTransactionsHeader.textContent = formattedDate;
        
        // Display the exact date string being used for debugging
        const dateDebug = document.getElementById('date-debug');
        if (dateDebug) {
            dateDebug.textContent = `Date used for filtering: ${this.formatDateString(date)}`;
        }
        
        // Update the summary cards
        document.getElementById('daily-income').textContent = `${currency} ${formatNumber(dailyData.income)}`;
        document.getElementById('daily-expenses').textContent = `${currency} ${formatNumber(dailyData.expense)}`;
        document.getElementById('daily-balance').textContent = `${currency} ${formatNumber(dailyData.balance)}`;
        
        // Show or hide the daily transactions section
        const dailyTransactionsSection = document.getElementById('daily-transactions-section');
        dailyTransactionsSection.style.display = 'block';
        
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
                        <button id="prev-month" class="month-nav">&lt;</button>
                        <h3 id="calendar-month-year"></h3>
                        <button id="next-month" class="month-nav">&gt;</button>
                        <button id="today-button" class="today-btn">Today</button>
                    </div>
                    
                    <div class="calendar-grid" id="calendar-grid"></div>
                </div>
                
                <div id="daily-transactions-section" class="daily-transactions-section">
                    <h3 id="daily-transactions-header">Transactions</h3>
                    <div id="date-debug" class="date-debug"></div>
                    
                    <div class="daily-summary-cards">
                        <div class="summary-card">
                            <div class="summary-label">Income</div>
                            <div class="summary-value income" id="daily-income">$0.00</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-label">Expenses</div>
                            <div class="summary-value expense" id="daily-expenses">$0.00</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-label">Balance</div>
                            <div class="summary-value" id="daily-balance">$0.00</div>
                        </div>
                    </div>
                    
                    <div class="transactions-list" id="daily-transactions-list"></div>
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
                    }
                    
                    .month-nav {
                        background-color: white;
                        color: var(--dark-color);
                        font-weight: bold;
                        width: 40px;
                        height: 40px;
                        padding: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .today-btn {
                        background-color: var(--secondary-color);
                        font-size: 0.875rem;
                        padding: 0.5rem 1rem;
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
                        background-color: #f5f5f5;
                    }
                    
                    .calendar-day.empty {
                        background-color: #f8f8f8;
                        cursor: default;
                    }
                    
                    .calendar-day.today {
                        background-color: #f0f8ff;
                        border: 2px solid var(--info-color);
                    }
                    
                    .calendar-day.selected {
                        background-color: #f7f0ff;
                        border: 2px solid var(--primary-color);
                    }
                    
                    .day-number {
                        font-weight: bold;
                        margin-bottom: 0.5rem;
                    }
                    
                    .day-transactions {
                        font-size: 0.75rem;
                        padding: 0.25rem 0.5rem;
                        border-radius: 0;
                        border: 1px solid var(--border-color);
                        margin-top: 0.5rem;
                        display: flex;
                        justify-content: space-between;
                    }
                    
                    .day-transactions.positive {
                        background-color: rgba(73, 197, 182, 0.1);
                        color: var(--secondary-color);
                    }
                    
                    .day-transactions.negative {
                        background-color: rgba(255, 84, 112, 0.1);
                        color: var(--primary-color);
                    }
                    
                    .transaction-count {
                        font-weight: bold;
                    }
                    
                    .date-debug {
                        font-size: 0.75rem;
                        color: #777;
                        margin-bottom: 0.5rem;
                    }
                    
                    .daily-transactions-section {
                        background-color: white;
                        border: 2px solid var(--border-color);
                        padding: 1.5rem;
                        margin-bottom: 2rem;
                        box-shadow: var(--shadow);
                        display: none;
                    }
                    
                    .daily-summary-cards {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 1rem;
                        margin: 1rem 0 2rem;
                    }
                    
                    .summary-card {
                        border: 1px solid var(--border-color);
                        padding: 1rem;
                        text-align: center;
                    }
                    
                    .summary-label {
                        font-size: 0.875rem;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        opacity: 0.7;
                        margin-bottom: 0.5rem;
                    }
                    
                    .summary-value {
                        font-size: 1.25rem;
                        font-weight: bold;
                    }
                    
                    .summary-value.income {
                        color: var(--secondary-color);
                    }
                    
                    .summary-value.expense {
                        color: var(--primary-color);
                    }
                    
                    @media (max-width: 768px) {
                        .calendar-grid {
                            grid-template-columns: repeat(7, 1fr);
                        }
                        
                        .calendar-day {
                            min-height: 60px;
                            padding: 0.25rem;
                        }
                        
                        .day-transactions {
                            flex-direction: column;
                            font-size: 0.7rem;
                            padding: 0.15rem;
                        }
                    }
                </style>
            `;
            
            // Cache DOM references
            this.calendarContainer = document.querySelector('.calendar-container');
            this.calendarMonthYear = document.getElementById('calendar-month-year');
            this.calendarGrid = document.getElementById('calendar-grid');
            this.dailyTransactionsList = document.getElementById('daily-transactions-list');
            
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