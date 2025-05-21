# Financial Server

A Node.js backend server for managing financial data and providing smart financial insights. The server integrates with Google Apps Script for data storage and processing.

## Features

- **Marketplace Management**
  - Latest transaction tracking
  - Monthly budget allocation
  - Historical expenditure analysis
  - User income and budget management
  - Expense transaction tracking

- **Smart Financial Features**
  - Dashboard statistics
  - Recurring transaction prediction
  - Pattern detection
  - Smart suggestions
  - Goal suggestions
  - Category-based expense analysis
  - OCR transaction processing
  - Usage duration prediction
  - Budget alerts
  - Goal reminders
  - Category prediction

## Tech Stack

- Node.js
- Express.js
- Google Apps Script
- Axios

## Project Structure

```
financial-server/
├── controllers/         # Request handlers
├── middleware/         # Custom middleware
├── routes/            # API routes
├── services/          # Business logic
├── utils/             # Utility functions
└── scripts/           # Google Apps Script files
```

## Setup

1. Clone the repository:
```bash
git clone https://github.com/anh29/financial-server.git
cd financial-server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MODEL_URL=your_model_url
```

4. Start the server:
```bash
npm start
```

## API Endpoints

### Marketplace Endpoints
- `GET /getLatestTransaction/user/:userId` - Get latest transaction
- `GET /getMonthlyBudgetWithAllocations/user/:userId/month/:month` - Get monthly budget
- `GET /getHistoricalExpenditures/user/:userId` - Get historical expenditures
- `GET /getUserIncomeAndBudgets/user/:userId` - Get user income and budgets
- `GET /getExpensesTransactions/user/:userId` - Get expense transactions

### Smart Features Endpoints
- `GET /dashboard/:userId` - Get dashboard statistics
- `GET /predictRecurring/:userId` - Predict recurring transactions
- `GET /detectRecurring/:userId` - Detect new recurring patterns
- `GET /suggestions/:userId` - Get smart suggestions
- `GET /goals/suggest/:userId` - Suggest smart goals
- `GET /expenseByCategory/:userId` - Get expenses by category
- `GET /ocr/pending/:userId` - Get pending OCR reviews
- `POST /ocr/confirm` - Confirm OCR transaction
- `POST /predictUsageDuration` - Predict usage duration
- `GET /alerts/budget/:userId` - Check budget alerts
- `GET /reminders/goals/:userId` - Check goal reminders
- `POST /category` - Predict category

## Error Handling

The server implements comprehensive error handling with:
- Input validation
- Error logging
- Standardized error responses
- Google Apps Script error handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 