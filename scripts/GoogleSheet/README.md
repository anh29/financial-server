# 📘 Financial Assistant System – Developer & API Documentation

Welcome to the **Financial Assistant System** documentation. This guide is designed to help developers, testers, and evaluators navigate the system's structure and use its APIs effectively.

---

## 🛍️ Overview

- **Platform**: Google Apps Script (Web App backend)
- **Database**: Google Sheets (with normalized structure)

> 🧑‍💻 This doc helps you:
> - Understand all sheets (tables)
> - Use both standard CRUD and advanced Smart Logic APIs
> - Test with Postman

---

## 🗃️ Database Table Overview

| 📄 Sheet Name         | 🔎 Description                                                                 |
|----------------------|-------------------------------------------------------------------------------|
| `Users`              | Stores user accounts and login info                                           |
| `Accounts`           | Wallets/bank accounts per user                                                |
| `Transactions`       | Expense/income records with links to accounts and categories                 |
| `Categories`         | Category metadata: label, parent ID, color, keywords                         |
| `Tags`               | Tags for classifying and filtering expenses                                   |
| `TransactionTags`    | Many-to-many mapping between transactions and tags                           |
| `Budgets`            | Spending limits set by user for categories or globally                       |
| `Goals`              | Savings goals with deadlines and categories                                  |
| `RecurringPatterns`  | Recurring spending or income patterns detected or added                       |
| `OCRReceipts`        | Raw and parsed data from receipt image uploads (OCR-powered)                 |
| `ActivityLogs`       | Actions performed by users (create/update/delete logs)                        |
| `Notifications`      | Alerts related to budgets, goals, reminders                                  |

---

## 🔧 Standard API Reference – CRUD

> Base URL: `https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_ID/exec`

### ✨ Endpoints Structure

| Method | Endpoint Format                            | Description                       |
|--------|--------------------------------------------|-----------------------------------|
| `GET`  | `/exec?path=getAll<Table>`                 | Fetch all records from a sheet    |
| `GET`  | `/exec?path=get<Table>ById&id=`            | Get a record by its ID            |
| `GET`  | `/exec?path=get<Table>ByUser&userId=`      | Get all records for a user        |
| `POST` | `/exec?path=add<Table>`                    | Create a new record               |
| `POST` | `/exec?path=update<Table>`                 | Update a record by its ID         |
| `GET`  | `/exec?path=delete<Table>ById&id=`         | Delete a record by its ID         |

### 📅 Example (Add Transaction)

```http
POST /exec?path=addTransactions
```
**Request Body:**
```json
{
  "userId": "u1",
  "accountId": "a1",
  "amount": 200000,
  "type": "expense",
  "description": "Lunch",
  "category_id": "food",
  "date": "2024-04-01"
}
```
**Response:**
```json
{
  "status": 200,
  "message": "Add to Transactions successfully.",
  "data": ["generated-id", "u1", "a1", 200000, "expense", "Lunch", ...]
}
```

---

## 🌟 Smart Logic Modules (Key APIs)

These intelligent APIs combine insights from multiple sheets to deliver advanced financial features and predictions.

---

### 1. `getUserDashboardStats`
**GET** `...?path=getUserDashboardStats&userId=u1`
- 📊 **Purpose**: Show income, expense, savings, budget usage, and goal progress in one summary.
- ✅ **When**: Home dashboard or after syncing new data.
- 📌 **Requires**: Transactions, Budgets, Goals.
```json
{
  "totalIncome": 5000000,
  "totalExpense": 3200000,
  "netSavings": 1800000,
  "budgetUsage": [...],
  "goalProgress": [...]
}
```

### 2. `predictRecurringTransactions`
**GET** `...?path=predictRecurringTransactions&userId=u1`
- 🔁 **Purpose**: Forecast next recurring payment (amount + date).
- ✅ **When**: Weekly check, notifications.
- 📌 **Requires**: ≥2 matching keyword transactions with time gaps.
```json
[
  {
    "keyword": "viettel",
    "predicted_category": "utilities",
    "predicted_amount": 220000,
    "predicted_next_date": "2025-05-02"
  }
]
```

### 3. `detectNewRecurringPatterns`
**GET** `...?path=detectNewRecurringPatterns&userId=u1`
- 🧠 **Purpose**: Detect repeating expenses not yet marked as recurring.
- ✅ **When**: Monthly or after heavy usage.
- 📌 **Requires**: ≥10 transactions with similar keywords + date spacing.

### 4. `getSmartSuggestions`
**GET** `...?path=getSmartSuggestions&userId=u1`
- 🎯 **Purpose**: Recommend actions like creating goals, budgets, or alerts.
- ✅ **When**: Onboarding, inactivity, or imbalance.
- 📌 **Requires**: Mixed data: low budgets, no goals, overspending.

### 5. `suggestSmartGoals`
**GET** `...?path=suggestSmartGoals&userId=u1`
- 💡 **Purpose**: Suggest goals based on highest expense categories.
- ✅ **When**: After detecting large spending in one category.
- 📌 **Requires**: Expense transactions grouped by category.

### 6. `getExpenseByCategory`
**GET** `...?path=getExpenseByCategory&userId=u1`
- 📊 **Purpose**: Aggregate all expenses by category.
- ✅ **When**: Insights tab, trend analysis.
- 📌 **Requires**: Categorized transactions.

### 7. `getPendingOCRReview`
**GET** `...?path=getPendingOCRReview&userId=u1`
- 📸 **Purpose**: Show scanned receipts that need confirmation.
- ✅ **When**: After OCR upload.
- 📌 **Requires**: OCRReceipts with `status = 'pending'`.

### 8. `confirmOCRTransaction`
**POST** `...?path=confirmOCRTransaction`
- ✅ **Purpose**: Save a transaction based on reviewed OCR receipt.
- ✅ **When**: After user confirms OCR info.
- 📌 **Requires**: OCR ID + fields (`userId`, `accountId`, `amount`, etc).
```json
{
  "ocrId": "ocr123",
  "userId": "u1",
  "accountId": "acc1",
  "confirmed_category": "transport",
  "confirmed_amount": 30000,
  "confirmed_date": "2025-04-11",
  "confirmed_description": "Grab bike"
}
```

### 9. `predictUsageDuration`
**POST** `...?path=predictUsageDuration`
- 📦 **Purpose**: Estimate how long a product/item will last (e.g. groceries).
- ✅ **When**: After logging similar past items.
- 📌 **Requires**: Name + category + `volume` + history.
```json
{
  "userId": "u1",
  "category": "groceries",
  "name": "eggs",
  "date": "2025-04-11",
  "volume": 12
}
```
```json
{
  "message": "Predicted usage from past",
  "days": 14
}
```

### 10. `checkBudgetAlerts`
**GET** `...?path=checkBudgetAlerts&userId=u1`
- 🚨 **Purpose**: Warn user if spending nears/exceeds 90% of any budget.
- ✅ **When**: After a new transaction or daily summary.
- 📌 **Requires**: Budgets + related transactions within period.

### 11. `checkGoalReminders`
**GET** `...?path=checkGoalReminders&userId=u1`
- ⏳ **Purpose**: Remind user of slow progress toward nearing goal deadlines.
- ✅ **When**: Weekly, payday, or goal deadlines.
- 📌 **Requires**: Active goals with future `target_date`.

| 🧠 Function | ⏰ When to Use | 📄 Requires |
|----------------|------------------------|-------------------------|
| `getUserDashboardStats` | Anytime user opens dashboard | Transactions, Budgets, Goals |
| `predictRecurringTransactions` | Weekly forecast | Repeating transactions by keyword |
| `detectNewRecurringPatterns` | Monthly scan | >10 transactions with similar keyword |
| `getSmartSuggestions` | Budgeting/goal setting | Spending + category + budget gaps |
| `suggestSmartGoals` | After overspending | Transactions with high total by category |
| `getExpenseByCategory` | Anytime | Categorized transactions |
| `getPendingOCRReview` | After OCR uploads | OCRReceipts with `status: pending` |
| `confirmOCRTransaction` | When user confirms OCR info | OCR ID + confirm fields |
| `predictUsageDuration` | Grocery/item usage tracking | Items with `volume` and frequency |
| `checkBudgetAlerts` | Weekly or new expenses | Budget + matched transactions |
| `checkGoalReminders` | Weekly or pre-payday | Goals with due dates + savings progress |

---

## 🦪 Postman Testing Tips
- Use query params in GET like `...?path=...&userId=...`
- For POST: set headers to `Content-Type: application/json`
- Paste JSON body in `raw` tab of Postman body

---

## 🏁 Final Notes
- This documentation focuses on clarity, examples, and full testing coverage.
- Smart modules are your standout features — keep them modular, clean, and user-centric.

Ready to deploy 🚀
