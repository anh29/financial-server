// 1. Create a new user
POST /exec?path=createUser
Body (JSON):
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "123456",
  "email_verified": true,
  "via_google": false
}

// 2. Sign in
POST /exec?path=signIn
Body (JSON):
{
  "email": "test@example.com",
  "password": "123456"
}

// 3. Add Account
POST /exec?path=addAccounts
Body (JSON):
{
  "userId": "USER_ID",
  "name": "Cash Wallet",
  "type": "cash",
  "default_account": true,
  "currency": "VND"
}

// 4. Add Transaction
POST /exec?path=addTransactions
Body (JSON):
{
  "userId": "USER_ID",
  "accountId": "ACCOUNT_ID",
  "amount": 300000,
  "type": "expense",
  "description": "Groceries BigC",
  "category_id": "groceries",
  "date": "2025-04-10",
  "source": "manual"
}

// 5. Predict Usage Duration
POST /exec?path=predictUsageDuration
Body (JSON):
{
  "userId": "USER_ID",
  "category": "groceries",
  "name": "Groceries",
  "date": "2025-04-10",
  "volume": 2
}

// 6. Get Dashboard Stats
GET /exec?path=getUserDashboardStats&userId=USER_ID

// 7. Get Smart Suggestions
GET /exec?path=getSmartSuggestions&userId=USER_ID

// 8. Detect Recurring Patterns
GET /exec?path=detectNewRecurringPatterns&userId=USER_ID

// 9. Predict Recurring Transactions
GET /exec?path=predictRecurringTransactions&userId=USER_ID

// 10. Suggest Goals
GET /exec?path=suggestSmartGoals&userId=USER_ID

// 11. Budget Alerts
GET /exec?path=checkBudgetAlerts&userId=USER_ID

// 12. Goal Reminders
GET /exec?path=checkGoalReminders&userId=USER_ID

// 13. OCR Review
GET /exec?path=getPendingOCRReview&userId=USER_ID

// 14. Confirm OCR Transaction
POST /exec?path=confirmOCRTransaction
Body (JSON):
{
  "ocrId": "OCR_ID",
  "userId": "USER_ID",
  "accountId": "ACCOUNT_ID",
  "confirmed_category": "groceries",
  "confirmed_amount": 250000,
  "confirmed_date": "2025-04-10",
  "confirmed_description": "Receipt MM Mega Market"
}

// 15. Expense by Category
GET /exec?path=getExpenseByCategory&userId=USER_ID
