# BudgetIn - Simple Budget and Subscription Tracker

BudgetIn is a lightweight, browser-based budgeting and subscription tracking application that helps you monitor your income, expenses, and recurring subscriptions. With visual charts and summaries, you can easily track your financial health over different time periods.

## Features

- **Dashboard**: Get a quick overview of your financial health with total balance, income, expenses, and subscription costs.
- **Visual Reports**: View your income vs. expenses and spending by category with interactive charts.
- **Time-based Filtering**: View your financial data by week, month, quarter, or year.
- **Transaction Management**: Add, filter, and manage all your income and expense transactions.
- **Subscription Tracking**: Track recurring payments and view their impact on your monthly budget.
- **Category Management**: Create and manage custom categories for better organization.
- **Data Import/Export**: Backup your data or move it between devices.
- **Local Storage**: All data is stored in your browser's local storage for privacy.

## Project Structure

The codebase follows a modular architecture:

```
budgetin/
│
├── css/                    # Stylesheets
│   ├── main.css            # Global styles and variables
│   ├── layout.css          # Layout-specific styles
│   ├── components.css      # Component-specific styles
│   └── forms.css           # Forms and modals
│
├── js/                     # JavaScript files
│   ├── app.js              # Main application entry point
│   ├── components/         # UI components
│   │   ├── Dashboard.js    # Dashboard component
│   │   ├── Navigation.js   # Navigation component
│   │   ├── Settings.js     # Settings component
│   │   ├── Subscriptions.js# Subscriptions component
│   │   └── Transactions.js # Transactions component
│   ├── models/             # Data models
│   │   └── Store.js        # Application state management
│   └── utils/              # Utilities
│       └── helpers.js      # Helper functions
│
├── index.html              # Main HTML file
└── README.md               # Documentation
```

## How to Use

### Setup

1. Simply open the `index.html` file in a modern web browser.
2. No installation, server, or internet connection is required after the initial page load.

### Dashboard

- The dashboard shows your financial summary with quick stats and charts.
- Use the time filter buttons (Week, Month, Quarter, Year) to view data for different periods.
- Recent transactions appear at the bottom of the dashboard.

### Adding Transactions

1. Go to the "Transactions" tab or click "Add Transaction" on the dashboard.
2. Fill in the transaction details:
   - Type (Income or Expense)
   - Amount
   - Category
   - Date
   - Description (optional)
3. Click "Save" to add the transaction.

### Managing Subscriptions

1. Go to the "Subscriptions" tab.
2. Click "Add Subscription".
3. Enter the subscription details:
   - Name
   - Amount
   - Category
   - Billing Cycle (Weekly, Monthly, Quarterly, Annually)
   - Next Billing Date
   - Description (optional)
4. Click "Save" to add the subscription.

### Customizing Categories

1. Go to the "Settings" tab.
2. Under "Categories," you'll see existing income and expense categories.
3. To add a new category, enter the name in the input field and click "Add".
4. To delete a category, click the "×" button next to it (only if it's not being used).

### Importing and Exporting Data

1. Go to the "Settings" tab.
2. Click "Export Data" to download your current data as a JSON file.
3. Click "Import Data" to upload a previously exported file.
4. Use "Clear All Data" to reset the application (use with caution).

## Development

The application is built using vanilla JavaScript with a modular, component-based architecture. Each component is responsible for its own UI rendering and event handling. The application follows a simple state management approach with a centralized store.

### Key Implementation Details

- **Store Pattern**: A centralized Store class manages application state and local storage
- **Component-Based Architecture**: Each section of the app is a self-contained component
- **Event Delegation**: Event listeners are attached to parent elements where appropriate
- **Chart.js Integration**: Visualization with the Chart.js library
- **ES6 Modules**: Modern JavaScript module system for clean code organization

## Privacy

All your financial data is stored only in your browser's local storage and never sent to any server. This means:

- Your data remains on your device
- No internet connection is required
- No account creation is needed
- Your financial information stays private

## Browser Compatibility

BudgetIn works on all modern browsers that support:
- HTML5
- CSS3
- ES6 JavaScript
- Local Storage
- Chart.js

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+ with modules)
- Chart.js for data visualization
- Browser Local Storage API

## License

This project is free to use for personal purposes.

---

Happy budgeting! 